import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BusinessUnitSchema } from "@/lib/validations/simple-schemas";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const supabase = await createClient();
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
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    // Hanya admin atau manajer yang boleh menambah gerai
    const canManage = user.roles.some((r) => ["admin", "manajer"].includes(r));
    if (!canManage) {
      return NextResponse.json({ error: "Hanya Admin atau Manajer yang dapat mendaftarkan unit usaha baru." }, { status: 403 });
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
      return NextResponse.json({ error: "Gagal menyimpan gerai baru ke Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, unit: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const canManage = user.roles.some((r) => ["admin", "manajer"].includes(r));
    if (!canManage) {
      return NextResponse.json({ error: "Hanya Admin atau Manajer yang dapat mengedit data unit usaha." }, { status: 403 });
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
    if (parsed.data.code !== undefined) updates.code = parsed.data.code;
    if (parsed.data.unit_type !== undefined) updates.unit_type = parsed.data.unit_type;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.pic_name !== undefined) updates.pic_name = parsed.data.pic_name;
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
    if (parsed.data.location !== undefined) updates.location = parsed.data.location;
    if (parsed.data.monthly_target !== undefined) updates.monthly_target = parsed.data.monthly_target;
    if (parsed.data.readiness_percentage !== undefined) updates.readiness_percentage = parsed.data.readiness_percentage;
    if (parsed.data.operational_start_date !== undefined) updates.operational_start_date = parsed.data.operational_start_date;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("business_units")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui data gerai di Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, unit: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
