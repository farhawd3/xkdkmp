import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { DailyReportSchema } from "@/lib/validations/simple-schemas";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unit_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const supabase = await createClient();
    let query = supabase
      .from("unit_daily_reports")
      .select("id, unit_id, report_date, gross_revenue, operational_expenses, net_profit, transaction_count, cash_in_hand, operational_notes, source_type, created_at, business_units(name, code)")
      .order("report_date", { ascending: false });

    if (unitId) query = query.eq("unit_id", unitId);
    if (startDate) query = query.gte("report_date", startDate);
    if (endDate) query = query.lte("report_date", endDate);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Laporan pemantauan belum dapat dimuat dari Supabase: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
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
    const parsed = DailyReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data laporan pemantauan tidak valid." }, { status: 400 });
    }

    const report = parsed.data;
    if (report.source_type !== "manual") {
      return NextResponse.json({ error: "Sumber API belum aktif. Rekap dari formulir hanya boleh berlabel manual." }, { status: 400 });
    }
    const grossNum = parseFloat(report.gross_revenue as string);
    const expNum = parseFloat(report.operational_expenses as string);
    const netProfit = (grossNum - expNum).toFixed(2);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("unit_daily_reports")
      .upsert(
        {
          unit_id: report.unit_id,
          report_date: report.report_date,
          gross_revenue: report.gross_revenue,
          operational_expenses: report.operational_expenses,
          net_profit: netProfit,
          transaction_count: report.transaction_count,
          cash_in_hand: report.cash_in_hand,
          operational_notes: report.operational_notes || null,
          source_type: "manual",
          // Aplikasi pribadi: set null sesuai skema nullable (mencegah error invalid UUID)
          created_by: null,
        },
        { onConflict: "unit_id, report_date" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan rekap harian gerai: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
