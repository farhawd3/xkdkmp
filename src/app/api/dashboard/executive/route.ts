import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const supabase = await createClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentYearMonth = today.substring(0, 7);

    // Hitung tanggal 7 hari ke belakang untuk tren harian
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const [
      unitsRes,
      allUnitsRes,
      activeUnitsRes,
      membersRes,
      tasksRes,
      urgentTasksRes,
      urgentTaskListRes,
      todayReportsRes,
      monthReportsRes,
      weeklyReportsRes,
      orgProfileRes,
      reportedUnitsRes,
    ] = await Promise.all([
      supabase.from("business_units").select("id", { count: "exact", head: true }),
      supabase.from("business_units").select("id, name"),
      supabase.from("business_units").select("id", { count: "exact", head: true }).eq("status", "aktif"),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
      supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "selesai"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("priority", "mendesak").neq("status", "selesai"),
      // Ambil 5 tugas mendesak/tinggi untuk ditampilkan langsung di dashboard
      supabase.from("tasks")
        .select("id, title, priority, status, due_date, pic_name, business_units(name)")
        .neq("status", "selesai")
        .in("priority", ["mendesak", "tinggi"])
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
      supabase.from("unit_daily_reports").select("id", { count: "exact", head: true }).eq("report_date", today),
      supabase.from("unit_daily_reports").select("gross_revenue, operational_expenses, net_profit").gte("report_date", `${currentYearMonth}-01`),
      // Data tren 7 hari: omset per hari
      supabase.from("unit_daily_reports")
        .select("report_date, gross_revenue, operational_expenses, net_profit")
        .gte("report_date", sevenDaysAgoStr)
        .lte("report_date", today)
        .order("report_date", { ascending: true }),
      supabase.from("organization_profile").select("business_status").limit(1).maybeSingle(),
      // Gerai yang sudah lapor hari ini
      supabase.from("unit_daily_reports").select("unit_id").eq("report_date", today),
    ]);

    let monthRevenue = 0;
    let monthExpenses = 0;
    let monthProfit = 0;

    if (monthReportsRes.data && Array.isArray(monthReportsRes.data)) {
      for (const row of monthReportsRes.data) {
        monthRevenue += Number(row.gross_revenue) || 0;
        monthExpenses += Number(row.operational_expenses) || 0;
        monthProfit += Number(row.net_profit) || 0;
      }
    }

    // Bangun data tren 7 hari (agregasi per tanggal)
    const dailyTrend: { date: string; revenue: number; expenses: number; profit: number }[] = [];
    const trendMap = new Map<string, { revenue: number; expenses: number; profit: number }>();
    
    if (weeklyReportsRes.data && Array.isArray(weeklyReportsRes.data)) {
      for (const row of weeklyReportsRes.data) {
        const d = row.report_date;
        const existing = trendMap.get(d) || { revenue: 0, expenses: 0, profit: 0 };
        existing.revenue += Number(row.gross_revenue) || 0;
        existing.expenses += Number(row.operational_expenses) || 0;
        existing.profit += Number(row.net_profit) || 0;
        trendMap.set(d, existing);
      }
    }
    
    // Isi 7 hari terakhir (termasuk hari tanpa data = 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = trendMap.get(dateStr) || { revenue: 0, expenses: 0, profit: 0 };
      dailyTrend.push({ date: dateStr, ...entry });
    }

    // Hitung gerai yang BELUM lapor hari ini
    const reportedUnitIds = new Set(
      (reportedUnitsRes.data || []).map((r: { unit_id: string }) => r.unit_id)
    );
    const allUnits = allUnitsRes.data || [];
    const unreportedUnits = allUnits
      .filter((u: { id: string; name: string }) => !reportedUnitIds.has(u.id))
      .map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }));

    return NextResponse.json({
      totalUnits: unitsRes.count ?? 0,
      activeUnits: activeUnitsRes.count ?? 0,
      totalMembers: membersRes.count ?? 0,
      activeTasks: tasksRes.count ?? 0,
      urgentTasks: urgentTasksRes.count ?? 0,
      urgentTaskList: urgentTaskListRes.data ?? [],
      todayReports: todayReportsRes.count ?? 0,
      monthRevenue,
      monthExpenses,
      monthProfit,
      dailyTrend,
      unreportedUnits,
      businessStatus: orgProfileRes.data?.business_status ?? "persiapan",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
