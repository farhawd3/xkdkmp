import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { getTodayWIB, getCurrentYearMonthWIB, getDaysAgoWIB } from "@/lib/utils";
import { buildReportingTrend } from "@/lib/reporting-trend";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();

    // Gunakan zona waktu bisnis Asia/Jakarta (WIB) untuk semua parameter tanggal
    const today = getTodayWIB();
    const currentYearMonth = getCurrentYearMonthWIB();
    const sevenDaysAgoStr = getDaysAgoWIB(6);

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
      productsRes,
      overdueTasksRes,
    ] = await Promise.all([
      supabase.from("business_units").select("id", { count: "exact", head: true }),
      supabase.from("business_units").select("id, name, status"),
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
      supabase.from("unit_daily_reports").select("gross_revenue, operational_expenses, net_profit").gte("report_date", `${currentYearMonth}-01`).lte("report_date", today),
      // Data tren 7 hari WIB: omset per hari
      supabase.from("unit_daily_reports")
        .select("report_date, unit_id, gross_revenue, operational_expenses, net_profit")
        .gte("report_date", sevenDaysAgoStr)
        .lte("report_date", today)
        .order("report_date", { ascending: true }),
      supabase.from("organization_profile").select("business_status").limit(1).maybeSingle(),
      // Gerai yang sudah lapor hari ini
      supabase.from("unit_daily_reports").select("unit_id").eq("report_date", today),
      // Komoditas barang untuk deteksi stok menipis/habis
      supabase.from("products").select("id, sku, name, current_stock, min_stock, base_unit").eq("is_archived", false),
      // Tugas aktif dengan tenggat <= hari ini (terlambat / jatuh tempo hari ini)
      supabase.from("tasks")
        .select("id, title, priority, status, due_date, pic_name, business_units(name)")
        .neq("status", "selesai")
        .not("due_date", "is", null)
        .lte("due_date", today)
        .order("due_date", { ascending: true }),
    ]);

    // Pemeriksaan galat database secara fail-fast
    const queryError =
      unitsRes.error ||
      allUnitsRes.error ||
      activeUnitsRes.error ||
      membersRes.error ||
      tasksRes.error ||
      urgentTasksRes.error ||
      urgentTaskListRes.error ||
      todayReportsRes.error ||
      monthReportsRes.error ||
      weeklyReportsRes.error ||
      orgProfileRes.error ||
      reportedUnitsRes.error ||
      productsRes.error ||
      overdueTasksRes.error;

    if (queryError) {
      return NextResponse.json(
        { error: "Gagal memuat ringkasan eksekutif dari database: " + queryError.message },
        { status: 500 }
      );
    }

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

    // Bangun data tren 7 hari (agregasi per tanggal WIB)
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

    // Susun array 7 hari terakhir secara kronologis
    const dailyTrend: { date: string; revenue: number; expenses: number; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = getDaysAgoWIB(i);
      const entry = trendMap.get(dateStr) || { revenue: 0, expenses: 0, profit: 0 };
      dailyTrend.push({ date: dateStr, ...entry });
    }

    // Hitung gerai wajib lapor yang BELUM lapor hari ini
    const reportedUnitIds = new Set(
      (reportedUnitsRes.data || []).map((r: { unit_id: string }) => r.unit_id)
    );
    const allUnits = allUnitsRes.data || [];
    const activeUnits = allUnits.filter((u: { status?: string }) => u.status === "aktif");
    const reportingTrend = buildReportingTrend(
      dailyTrend.map((day) => day.date),
      (weeklyReportsRes.data || []) as Array<{ report_date: string; unit_id: string }>,
      activeUnits.map((unit: { id: string }) => unit.id),
    );

    const unreportedUnits = activeUnits
      .filter((u: { id: string }) => !reportedUnitIds.has(u.id))
      .map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }));

    // Analisis Stok Menipis / Habis (Fokus Hari Ini)
    const allProducts = (productsRes.data || []) as Array<{
      id: string;
      sku: string;
      name: string;
      current_stock: number;
      min_stock: number;
      base_unit: string;
    }>;
    const lowStockItems = allProducts.filter(
      (p) => Number(p.current_stock) <= Number(p.min_stock)
    );
    const lowStockCount = lowStockItems.length;

    // Analisis Tugas Terlambat & Jatuh Tempo Hari Ini (Fokus Hari Ini)
    type TaskItemType = {
      id: string;
      title: string;
      priority: string;
      status: string;
      due_date: string | null;
      pic_name: string;
      business_units?: { name: string } | null;
    };
    const overdueTaskList: TaskItemType[] = [];
    const todayDueTaskList: TaskItemType[] = [];

    for (const task of ((overdueTasksRes.data || []) as unknown as TaskItemType[])) {
      if (task.due_date && task.due_date < today) {
        overdueTaskList.push(task);
      } else if (task.due_date && task.due_date === today) {
        todayDueTaskList.push(task);
      }
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      businessDate: today,
      totalUnits: unitsRes.count ?? 0,
      activeUnits: activeUnitsRes.count ?? 0,
      totalMembers: membersRes.count ?? 0,
      activeTasks: tasksRes.count ?? 0,
      urgentTasks: urgentTasksRes.count ?? 0,
      urgentTaskList: urgentTaskListRes.data ?? [],
      todayReports: todayReportsRes.count ?? 0,
      activeReportedUnits: activeUnits.length - unreportedUnits.length,
      monthRevenue,
      monthExpenses,
      monthProfit,
      dailyTrend,
      reportingTrend,
      unreportedUnits,
      businessStatus: orgProfileRes.data?.business_status ?? "persiapan",
      // Fitur Fokus Hari Ini
      lowStockCount,
      lowStockItems: lowStockItems.slice(0, 5),
      overdueTaskCount: overdueTaskList.length,
      todayDueTaskCount: todayDueTaskList.length,
      overdueTaskList: overdueTaskList.slice(0, 5),
      todayDueTaskList: todayDueTaskList.slice(0, 5),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
