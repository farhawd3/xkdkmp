import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });
    const canReadSummary = user.roles && user.roles.some((role) =>
      ["admin", "manajer", "bendahara", "pengawas", "operator"].includes(role)
    );
    if (!canReadSummary) {
      return NextResponse.json({ error: "Akun belum mendapat peran yang sah." }, { status: 403 });
    }

    const supabase = await createClient();
    const [members, products, purchaseOrders, profile] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("purchase_orders").select("id", { count: "exact", head: true }),
      supabase.from("organization_profile").select("business_status").limit(1).maybeSingle(),
    ]);

    const failed = [members, products, purchaseOrders, profile].find((result) => result.error);
    if (failed?.error) {
      return NextResponse.json({ error: "Data ringkasan belum dapat dibaca dari Supabase." }, { status: 503 });
    }

    return NextResponse.json({
      members: members.count ?? 0,
      products: products.count ?? 0,
      purchaseOrders: purchaseOrders.count ?? 0,
      businessStatus: profile.data?.business_status ?? "persiapan",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Hak akses atau koneksi database belum dapat diverifikasi." }, { status: 503 });
  }
}
