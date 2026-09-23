import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { BackupFileSchema } from "@/lib/validations/backup-schemas";
import { getTodayWIB } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();

    const [
      orgProfileRes,
      unitsRes,
      tasksRes,
      productsRes,
      reportsRes,
      membersRes,
    ] = await Promise.all([
      supabase.from("organization_profile").select("*"),
      supabase.from("business_units").select("*"),
      supabase.from("tasks").select("*"),
      supabase.from("products").select("*"),
      supabase.from("unit_daily_reports").select("*"),
      supabase.from("members").select("*"),
    ]);

    const queryError =
      orgProfileRes.error ||
      unitsRes.error ||
      tasksRes.error ||
      productsRes.error ||
      reportsRes.error ||
      membersRes.error;

    if (queryError) {
      return NextResponse.json(
        { error: "Gagal mengambil data untuk pencadangan: " + queryError.message },
        { status: 500 }
      );
    }

    const backupPayload = {
      app: "Kopdes Merah Putih Ladang Laweh",
      version: 1,
      exported_at: new Date().toISOString(),
      data: {
        organization_profile: orgProfileRes.data || [],
        business_units: unitsRes.data || [],
        tasks: tasksRes.data || [],
        products: productsRes.data || [],
        unit_daily_reports: reportsRes.data || [],
        members: membersRes.data || [],
      },
    };

    const todayStr = getTodayWIB();
    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-kopdes-${todayStr}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat membuat cadangan data.";
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
    const parsed = BackupFileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Format berkas cadangan tidak valid: " + (parsed.error.issues[0]?.message || "Struktur berkas salah.") },
        { status: 400 }
      );
    }

    const { data } = parsed.data;
    const supabase = await createClient();

    const restoredCounts: Record<string, number> = {
      organization_profile: 0,
      business_units: 0,
      products: 0,
      tasks: 0,
      members: 0,
      unit_daily_reports: 0,
    };

    // 1. Pulihkan organization_profile
    if (data.organization_profile.length > 0) {
      const { error } = await supabase.from("organization_profile").upsert(data.organization_profile);
      if (error) throw new Error("Gagal memulihkan profil organisasi: " + error.message);
      restoredCounts.organization_profile = data.organization_profile.length;
    }

    // 2. Pulihkan business_units (harus sebelum reports/tasks/products yang mereferensikan unit_id)
    if (data.business_units.length > 0) {
      const { error } = await supabase.from("business_units").upsert(data.business_units);
      if (error) throw new Error("Gagal memulihkan unit usaha: " + error.message);
      restoredCounts.business_units = data.business_units.length;
    }

    // 3. Pulihkan products
    if (data.products.length > 0) {
      const { error } = await supabase.from("products").upsert(data.products);
      if (error) throw new Error("Gagal memulihkan produk & stok: " + error.message);
      restoredCounts.products = data.products.length;
    }

    // 4. Pulihkan tasks
    if (data.tasks.length > 0) {
      const { error } = await supabase.from("tasks").upsert(data.tasks);
      if (error) throw new Error("Gagal memulihkan tugas operasional: " + error.message);
      restoredCounts.tasks = data.tasks.length;
    }

    // 5. Pulihkan members
    if (data.members.length > 0) {
      const { error } = await supabase.from("members").upsert(data.members);
      if (error) throw new Error("Gagal memulihkan data anggota: " + error.message);
      restoredCounts.members = data.members.length;
    }

    // 6. Pulihkan unit_daily_reports
    if (data.unit_daily_reports.length > 0) {
      const { error } = await supabase.from("unit_daily_reports").upsert(data.unit_daily_reports);
      if (error) throw new Error("Gagal memulihkan rekapitulasi harian: " + error.message);
      restoredCounts.unit_daily_reports = data.unit_daily_reports.length;
    }

    return NextResponse.json({
      success: true,
      message: "Data cadangan berhasil dipulihkan ke database Supabase.",
      restored: restoredCounts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memulihkan cadangan data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
