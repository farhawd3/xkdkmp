import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { getTodayWIB } from "@/lib/utils";
import {
  buildUnitPerformanceMetrics,
  calculateCalendarDaysElapsed,
  getPreviousPeriodRange,
  getTotalDaysInMonth,
  RawBusinessUnit,
  RawDailyReport,
} from "@/lib/unit-performance";

const querySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus YYYY-MM")
    .refine((val) => {
      const year = parseInt(val.split("-")[0], 10);
      return year >= 2025 && year <= 2030;
    }, "Tahun harus antara 2025 dan 2030")
    .optional(),
  unitId: z.string().uuid("ID Unit Usaha harus format UUID valid").optional().or(z.literal("")),
});

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error || "Akses ditolak." },
        { status: access.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      month: searchParams.get("month") || undefined,
      unitId: searchParams.get("unitId") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parameter tidak sah", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const todayWIB = getTodayWIB();
    const defaultMonth = todayWIB.slice(0, 7);
    const selectedMonth = parsed.data.month || defaultMonth;
    const unitId = parsed.data.unitId || undefined;

    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    const totalDays = getTotalDaysInMonth(year, monthNum);
    const currentStart = `${selectedMonth}-01`;
    const currentEnd = `${selectedMonth}-${String(totalDays).padStart(2, "0")}`;

    const { calendarDaysElapsed } = calculateCalendarDaysElapsed(year, monthNum, todayWIB);
    const prevRange = getPreviousPeriodRange(year, monthNum, calendarDaysElapsed);

    const supabase = await createClient();
    const partialErrors: string[] = [];

    // Query 1: Business Units
    let unitsQuery = supabase
      .from("business_units")
      .select("id, code, name, unit_type, status, pic_name, location, monthly_target")
      .order("name", { ascending: true });

    if (unitId) {
      unitsQuery = unitsQuery.eq("id", unitId);
    }

    // Query 2: Laporan Harian Bulan Terpilih
    let currentReportsQuery = supabase
      .from("unit_daily_reports")
      .select("id, unit_id, report_date, gross_revenue, operational_expenses, net_profit, operational_notes")
      .gte("report_date", currentStart)
      .lte("report_date", currentEnd)
      .order("report_date", { ascending: true });

    if (unitId) {
      currentReportsQuery = currentReportsQuery.eq("unit_id", unitId);
    }

    // Query 3: Laporan Harian Periode Setara Bulan Lalu (jika hari elapsed > 0)
    let prevReportsQuery = null;
    if (prevRange.prevDaysElapsed > 0) {
      prevReportsQuery = supabase
        .from("unit_daily_reports")
        .select("id, unit_id, report_date, gross_revenue, operational_expenses, net_profit, operational_notes")
        .gte("report_date", prevRange.startDate)
        .lte("report_date", prevRange.endDate)
        .order("report_date", { ascending: true });

      if (unitId) {
        prevReportsQuery = prevReportsQuery.eq("unit_id", unitId);
      }
    }

    const [unitsRes, currentReportsRes, prevReportsRes] = await Promise.all([
      unitsQuery,
      currentReportsQuery,
      prevReportsQuery ? prevReportsQuery : Promise.resolve({ data: [], error: null }),
    ]);

    if (unitsRes.error) {
      partialErrors.push(`Data Gerai Usaha: ${unitsRes.error.message}`);
    }
    if (currentReportsRes.error) {
      partialErrors.push(`Rekap Bulan Ini: ${currentReportsRes.error.message}`);
    }
    if (prevReportsRes && prevReportsRes.error) {
      partialErrors.push(`Rekap Pembanding Bulan Lalu: ${prevReportsRes.error.message}`);
    }

    // Jika sumber utama gagal total
    if (unitsRes.error && currentReportsRes.error) {
      return NextResponse.json(
        {
          error: "Gagal memuat data kinerja gerai dari Supabase.",
          details: partialErrors,
        },
        { status: 500 }
      );
    }

    const rawUnits = (unitsRes.data as RawBusinessUnit[]) || [];
    const currentReports = (currentReportsRes.data as RawDailyReport[]) || [];
    const prevReports = (prevReportsRes?.data as RawDailyReport[]) || [];

    const performance = buildUnitPerformanceMetrics(
      rawUnits,
      currentReports,
      prevReports,
      year,
      monthNum,
      todayWIB
    );

    return NextResponse.json({
      ...performance,
      partialErrors: partialErrors.length > 0 ? partialErrors : undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Kesalahan sistem internal.";
    return NextResponse.json(
      { error: "Gagal memproses data kinerja gerai.", details: message },
      { status: 500 }
    );
  }
}
