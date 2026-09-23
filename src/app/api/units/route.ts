import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { BusinessUnitSchema } from "@/lib/validations/simple-schemas";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from("business_units")
        .select("id, code, name, unit_type, status, pic_name, phone, location, monthly_target, readiness_percentage, operational_start_date, notes, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: "Gagal memuat unit usaha dari Supabase: " + error.message }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "Unit usaha tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ unit: data }, { headers: { "Cache-Control": "no-store" } });
    }

    const { data, error } = await supabase
      .from("business_units")
      .select("id, code, name, unit_type, status, pic_name, phone, location, monthly_target, readiness_percentage, operational_start_date, notes, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Daftar unit usaha belum dapat dibaca dari Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ units: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const body = await request.json();
    const parsed = BusinessUnitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data unit usaha tidak valid." }, { status: 400 });
    }

    const unit = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("business_units")
      .insert({
        code: unit.code,
        name: unit.name,
        unit_type: unit.unit_type,
        status: unit.status,
        pic_name: unit.pic_name,
        phone: unit.phone || null,
        location: unit.location || "Ladang Laweh",
        monthly_target: unit.monthly_target,
        readiness_percentage: unit.readiness_percentage,
        operational_start_date: unit.operational_start_date || null,
        notes: unit.notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal mendaftarkan unit usaha ke Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, unit: data });
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
    if (!body.id) {
      return NextResponse.json({ error: "ID unit usaha diperlukan untuk pembaruan." }, { status: 400 });
    }

    const parsed = BusinessUnitSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data pembaruan tidak valid." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.unit_type !== undefined) updates.unit_type = parsed.data.unit_type;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.pic_name !== undefined) updates.pic_name = parsed.data.pic_name;
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone || null;
    if (parsed.data.location !== undefined) updates.location = parsed.data.location;
    if (parsed.data.monthly_target !== undefined) updates.monthly_target = parsed.data.monthly_target;
    if (parsed.data.readiness_percentage !== undefined) updates.readiness_percentage = parsed.data.readiness_percentage;
    if (parsed.data.operational_start_date !== undefined) updates.operational_start_date = parsed.data.operational_start_date || null;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes || null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("business_units")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui unit usaha di Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, unit: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
