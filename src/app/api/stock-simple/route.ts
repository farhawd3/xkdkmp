import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { SimpleStockUpdateSchema } from "@/lib/validations/simple-schemas";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, sku, name, category, base_unit, current_stock, min_stock, notes, unit_id, is_archived")
      .eq("is_archived", false)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Katalog stok belum dapat dibaca dari Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const body = await request.json();
    const parsed = SimpleStockUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data stok tidak valid." }, { status: 400 });
    }

    const { product_id, current_stock, min_stock, notes } = parsed.data;
    const updates: Record<string, unknown> = {
      current_stock,
      updated_at: new Date().toISOString(),
    };
    if (min_stock !== undefined) updates.min_stock = min_stock;
    if (notes !== undefined) updates.notes = notes;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", product_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui angka stok di Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
