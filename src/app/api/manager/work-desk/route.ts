import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, getDaysAgoWIB } from "@/lib/utils";

export interface WorkDeskItem {
  id: string;
  source: "tugas" | "rekap_gerai" | "kendala" | "stok";
  urgency: "perlu_sekarang" | "hari_ini" | "pantau" | "selesai";
  title: string;
  description: string;
  unitId?: string | null;
  unitName?: string | null;
  picName?: string | null;
  dateStr?: string | null;
  actionUrl: string;
  actionLabel: string;
  metricBadge?: string;
}

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();
    const today = getTodayWIB();
    const sevenDaysAgo = getDaysAgoWIB(7);

    const errors: string[] = [];

    // Query 4 sumber data secara independen untuk mendukung fail-fast parsial
    const [unitsRes, reportsRes, tasksRes, productsRes] = await Promise.all([
      supabase.from("business_units").select("id, name, status, pic_name").order("name", { ascending: true }),
      supabase
        .from("unit_daily_reports")
        .select("id, unit_id, report_date, gross_revenue, operational_notes, business_units(name)")
        .gte("report_date", sevenDaysAgo)
        .order("report_date", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, title, description, priority, status, due_date, pic_name, unit_id, business_units(name)")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("products")
        .select("id, sku, name, current_stock, min_stock, base_unit, unit_id, is_archived")
        .eq("is_archived", false)
        .order("current_stock", { ascending: true }),
    ]);

    if (unitsRes.error) errors.push(`Data Gerai Usaha: ${unitsRes.error.message}`);
    if (reportsRes.error) errors.push(`Rekapitulasi Pemantauan: ${reportsRes.error.message}`);
    if (tasksRes.error) errors.push(`Tugas Operasional: ${tasksRes.error.message}`);
    if (productsRes.error) errors.push(`Katalog Stok Barang: ${productsRes.error.message}`);

    // Jika seluruh sumber data gagal, kembalikan respons 500
    if (errors.length === 4) {
      return NextResponse.json(
        { error: "Seluruh sumber data Meja Kerja gagal dimuat dari Supabase.", details: errors },
        { status: 500 }
      );
    }

    const items: WorkDeskItem[] = [];

    const units = unitsRes.data || [];
    const reports = reportsRes.data || [];
    const tasks = tasksRes.data || [];
    const products = productsRes.data || [];

    // Map nama unit untuk lookup cepat
    const unitMap = new Map<string, string>();
    units.forEach((u) => unitMap.set(u.id, u.name));

    // 1. TUGAS OPERASIONAL (Tasks)
    if (!tasksRes.error) {
      for (const t of tasks) {
        const unitName = (t as any).business_units?.name || (t.unit_id ? unitMap.get(t.unit_id) : null) || null;

        if (t.status === "selesai") {
          // Tugas selesai yang tenggatnya hari ini
          if (t.due_date === today) {
            items.push({
              id: `task-${t.id}`,
              source: "tugas",
              urgency: "selesai",
              title: t.title,
              description: `Tugas operasional telah diselesaikan. PIC: ${t.pic_name || "Abdul Halim"}.`,
              unitId: t.unit_id,
              unitName,
              picName: t.pic_name,
              dateStr: t.due_date,
              actionUrl: `/pekerjaan`,
              actionLabel: "Buka Pekerjaan",
              metricBadge: "Selesai",
            });
          }
          continue;
        }

        // Tugas belum selesai
        const isOverdue = t.due_date && t.due_date < today;
        const isDueToday = t.due_date && t.due_date === today;
        const isUrgentPriority = t.priority === "mendesak";
        const isHighPriority = t.priority === "tinggi";

        if (isOverdue || isUrgentPriority) {
          items.push({
            id: `task-${t.id}`,
            source: "tugas",
            urgency: "perlu_sekarang",
            title: t.title,
            description: isOverdue
              ? `Tenggat telah terlewat sejak ${t.due_date}. Prioritas: ${t.priority.toUpperCase()}.`
              : `Tugas prioritas mendesak membutuhkan tindakan segera.`,
            unitId: t.unit_id,
            unitName,
            picName: t.pic_name,
            dateStr: t.due_date,
            actionUrl: `/pekerjaan`,
            actionLabel: "Tindak Lanjuti",
            metricBadge: isOverdue ? "Terlambat" : "Mendesak",
          });
        } else if (isDueToday || isHighPriority) {
          items.push({
            id: `task-${t.id}`,
            source: "tugas",
            urgency: "hari_ini",
            title: t.title,
            description: isDueToday
              ? `Jatuh tempo hari ini (${today}). Mohon pastikan instruksi berjalan.`
              : `Tugas prioritas tinggi dalam pantauan hari ini.`,
            unitId: t.unit_id,
            unitName,
            picName: t.pic_name,
            dateStr: t.due_date,
            actionUrl: `/pekerjaan`,
            actionLabel: "Periksa Tugas",
            metricBadge: isDueToday ? "Hari Ini" : "Prioritas Tinggi",
          });
        }
      }
    }

    // 2. KELENGKAPAN REKAPITULASI GERAI (Business Units & Daily Reports)
    if (!unitsRes.error && !reportsRes.error) {
      const activeUnits = units.filter((u) => u.status === "aktif");
      const reportedUnitIdsToday = new Set(
        reports.filter((r) => r.report_date === today).map((r) => r.unit_id)
      );

      for (const unit of activeUnits) {
        if (!reportedUnitIdsToday.has(unit.id)) {
          // Gerai aktif belum lapor hari ini
          items.push({
            id: `unit-unreported-${unit.id}`,
            source: "rekap_gerai",
            urgency: "hari_ini",
            title: `Rekap Harian: ${unit.name}`,
            description: `Gerai berstatus aktif belum memasukkan rekapitulasi harian per tanggal ${today}. PIC: ${unit.pic_name || "Abdul Halim"}.`,
            unitId: unit.id,
            unitName: unit.name,
            picName: unit.pic_name,
            dateStr: today,
            actionUrl: `/monitoring?unit_id=${unit.id}`,
            actionLabel: "Catat Rekap",
            metricBadge: "Belum Rekap",
          });
        } else {
          // Gerai aktif sudah lapor hari ini
          items.push({
            id: `unit-reported-${unit.id}`,
            source: "rekap_gerai",
            urgency: "selesai",
            title: `Rekap Masuk: ${unit.name}`,
            description: `Laporan transaksi harian tanggal ${today} telah tercatat di sistem.`,
            unitId: unit.id,
            unitName: unit.name,
            picName: unit.pic_name,
            dateStr: today,
            actionUrl: `/monitoring`,
            actionLabel: "Lihat Rekap",
            metricBadge: "Rekap Masuk",
          });
        }
      }
    }

    // 3. KENDALA LAPANGAN DARI REKAP (Operational Notes)
    if (!reportsRes.error) {
      // Ambil laporan 7 hari terakhir yang memiliki catatan kendala
      const recentIssues = reports.filter(
        (r) => r.operational_notes && r.operational_notes.trim().length > 0
      );

      for (const issue of recentIssues) {
        const unitName = (issue as any).business_units?.name || (issue.unit_id ? unitMap.get(issue.unit_id) : null) || "Gerai Koperasi";
        items.push({
          id: `issue-${issue.id}`,
          source: "kendala",
          urgency: "pantau",
          title: `Kendala Lapangan: ${unitName}`,
          description: `Catatan rekap (${issue.report_date}): "${issue.operational_notes}"`,
          unitId: issue.unit_id,
          unitName,
          dateStr: issue.report_date,
          actionUrl: `/monitoring`,
          actionLabel: "Tinjau di Monitoring",
          metricBadge: "Catatan Kendala",
        });
      }
    }

    // 4. STATUS STOK BARANG (Products)
    if (!productsRes.error) {
      for (const p of products) {
        const stock = Number(p.current_stock) || 0;
        const minStock = Number(p.min_stock) || 0;
        const unitName = p.unit_id ? unitMap.get(p.unit_id) : null;

        if (stock <= 0) {
          items.push({
            id: `product-empty-${p.id}`,
            source: "stok",
            urgency: "perlu_sekarang",
            title: `Stok Habis: ${p.name}`,
            description: `Saldo fisik 0 ${p.base_unit || "unit"}. Komoditas kosong membutuhkan pengadaan segera.`,
            unitId: p.unit_id,
            unitName,
            dateStr: today,
            actionUrl: `/stok?status=empty`,
            actionLabel: "Periksa Stok",
            metricBadge: "0 Unit Fisik",
          });
        } else if (stock <= minStock) {
          items.push({
            id: `product-low-${p.id}`,
            source: "stok",
            urgency: "pantau",
            title: `Stok Menipis: ${p.name}`,
            description: `Sisa fisik: ${stock} ${p.base_unit || "unit"} (Batas minimum: ${minStock} ${p.base_unit || "unit"}).`,
            unitId: p.unit_id,
            unitName,
            dateStr: today,
            actionUrl: `/stok?status=low`,
            actionLabel: "Periksa Stok",
            metricBadge: "Stok Menipis",
          });
        }
      }
    }

    // Pengurutan deterministik:
    // Urgensi: perlu_sekarang (1) -> hari_ini (2) -> pantau (3) -> selesai (4)
    // Kemudian tanggal lebih lampau lebih dulu
    const urgencyWeight: Record<string, number> = {
      perlu_sekarang: 1,
      hari_ini: 2,
      pantau: 3,
      selesai: 4,
    };

    items.sort((a, b) => {
      const weightDiff = (urgencyWeight[a.urgency] || 99) - (urgencyWeight[b.urgency] || 99);
      if (weightDiff !== 0) return weightDiff;
      if (a.dateStr && b.dateStr) {
        return a.dateStr.localeCompare(b.dateStr);
      }
      return 0;
    });

    const summary = {
      total: items.length,
      perlu_sekarang: items.filter((i) => i.urgency === "perlu_sekarang").length,
      hari_ini: items.filter((i) => i.urgency === "hari_ini").length,
      pantau: items.filter((i) => i.urgency === "pantau").length,
      selesai: items.filter((i) => i.urgency === "selesai").length,
    };

    return NextResponse.json(
      {
        timestampWIB: today,
        summary,
        items,
        partialErrors: errors.length > 0 ? errors : null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
