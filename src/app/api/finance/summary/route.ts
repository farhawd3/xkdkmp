import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { buildFinanceInsights, type OperationalReportAmount } from "@/lib/finance-insights";
import { getDaysAgoWIB, getTodayWIB } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();
    const [reportsRes, membersRes] = await Promise.all([
      supabase.from("unit_daily_reports")
        .select("gross_revenue, operational_expenses, cash_in_hand, report_date", { count: "exact" })
        .order("report_date", { ascending: true }),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
    ]);

    const dbError = reportsRes.error || membersRes.error;
    if (dbError) {
      return NextResponse.json({ error: `Gagal membaca rekap operasional: ${dbError.message}` }, { status: 500 });
    }
    const reports = (reportsRes.data ?? []) as OperationalReportAmount[];
    // PostgREST lazimnya membatasi hasil ke 1.000 baris; jangan sajikan ringkasan terpotong sebagai total.
    if (typeof reportsRes.count === "number" && reportsRes.count > reports.length) {
      return NextResponse.json({ error: "Jumlah rekap melebihi batas pengambilan data. Ringkasan tidak ditampilkan agar tidak menyesatkan; perlu pagination server." }, { status: 409 });
    }

    const dates = Array.from({ length: 7 }, (_, index) => getDaysAgoWIB(6 - index));
    const insights = buildFinanceInsights(reports, dates);
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      businessDate: getTodayWIB(),
      summary: { ...insights, totalMembers: membersRes.count ?? 0 },
      accountingReadiness: {
        officialStatementsAvailable: false,
        reason: "Rekap gerai belum memuat jurnal berpasangan, HPP, penyusutan, utang, modal, pajak, dan saldo bank yang terverifikasi.",
        missingRecords: ["Jurnal umum dan buku besar", "Nilai persediaan dan HPP", "Utang dan piutang", "Modal dan simpanan anggota", "Saldo bank serta rekonsiliasi", "Penyusutan dan pajak", "Keputusan RAT tentang SHU"],
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
