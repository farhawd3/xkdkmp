/**
 * Modul Kalkulasi Kanonikal Kinerja Gerai (Unit Performance)
 * Kopdes Merah Putih — Ladang Laweh
 *
 * Mengimplementasikan aturan bisnis kejujuran data:
 * 1. Target 0 / kosong = "Target belum ditetapkan", bukan "0%".
 * 2. Kepatuhan hari lapor dihitung terhadap hari kalender yang telah berjalan, bukan total sebulan penuh jika bulan masih berjalan.
 * 3. Perbandingan periode adil (fair comparison): tidak menampilkan klaim tren jika data pembanding belum memadai.
 * 4. Selisih operasional = Omset - Pengeluaran (bukan laba bersih resmi).
 */

import { getTodayWIB, getWIBDateParts } from "@/lib/utils";

export interface RawBusinessUnit {
  id: string;
  code: string;
  name: string;
  unit_type?: string;
  status: string;
  pic_name?: string;
  location?: string;
  monthly_target?: number | string | null;
}

export interface RawDailyReport {
  id: string;
  unit_id: string;
  report_date: string;
  gross_revenue: number | string | null;
  operational_expenses: number | string | null;
  net_profit?: number | string | null;
  operational_notes?: string | null;
}

export interface FairComparisonResult {
  isFair: boolean;
  previousRevenue: number;
  previousReportedDays: number;
  growthPercent: number | null;
  note: string;
}

export interface UnitPerformanceMetric {
  id: string;
  code: string;
  name: string;
  unitType: string;
  status: string;
  picName: string;
  location: string;
  monthlyTarget: number;
  actualRevenue: number;
  targetAchievementPercent: number | null;
  reportedDays: number;
  calendarDaysElapsed: number;
  reportingRatePercent: number | null;
  totalExpenses: number;
  operationalMargin: number;
  latestIssue: string | null;
  latestIssueDate: string | null;
  comparison: FairComparisonResult;
}

export interface UnitPerformanceSummary {
  totalUnits: number;
  activeUnits: number;
  totalRevenue: number;
  totalTarget: number;
  overallTargetPercent: number | null;
  totalExpenses: number;
  totalOperationalMargin: number;
  avgReportingRate: number | null;
  unitsMeetingTarget: number;
  unitsWithTarget: number;
}

export interface PeriodMetadata {
  month: string; // "YYYY-MM"
  monthLabel: string; // e.g. "September 2026"
  year: number;
  monthNum: number;
  calendarDaysElapsed: number;
  totalDaysInMonth: number;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFutureMonth: boolean;
}

export interface UnitPerformanceResponse {
  period: PeriodMetadata;
  summary: UnitPerformanceSummary;
  units: UnitPerformanceMetric[];
  partialErrors?: string[];
}

/**
 * Menghitung jumlah hari total dalam suatu bulan kalender.
 */
export function getTotalDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Menghitung jumlah hari kalender yang telah berjalan dalam suatu bulan tertentu.
 */
export function calculateCalendarDaysElapsed(
  year: number,
  month: number,
  referenceDateWIB = getTodayWIB()
): {
  calendarDaysElapsed: number;
  totalDaysInMonth: number;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFutureMonth: boolean;
} {
  const totalDays = getTotalDaysInMonth(year, month);
  const [refYearStr, refMonthStr, refDayStr] = referenceDateWIB.split("-");
  const refYear = parseInt(refYearStr, 10);
  const refMonth = parseInt(refMonthStr, 10);
  const refDay = parseInt(refDayStr, 10);

  if (year < refYear || (year === refYear && month < refMonth)) {
    // Bulan di masa lampau: seluruh hari telah berjalan
    return {
      calendarDaysElapsed: totalDays,
      totalDaysInMonth: totalDays,
      isCurrentMonth: false,
      isPastMonth: true,
      isFutureMonth: false,
    };
  }

  if (year > refYear || (year === refYear && month > refMonth)) {
    // Bulan di masa depan: belum ada hari yang berjalan
    return {
      calendarDaysElapsed: 0,
      totalDaysInMonth: totalDays,
      isCurrentMonth: false,
      isPastMonth: false,
      isFutureMonth: true,
    };
  }

  // Bulan saat ini berjalan: hari kalender berjalan = hari ini (maksimal total hari)
  const elapsed = Math.min(refDay, totalDays);
  return {
    calendarDaysElapsed: elapsed,
    totalDaysInMonth: totalDays,
    isCurrentMonth: true,
    isPastMonth: false,
    isFutureMonth: false,
  };
}

/**
 * Mendapatkan rentang tanggal ekuivalen untuk bulan lalu (hari 1 s.d. hari ke-N yang setara).
 */
export function getPreviousPeriodRange(
  year: number,
  month: number,
  daysElapsed: number
): {
  prevYear: number;
  prevMonth: number;
  startDate: string;
  endDate: string;
  prevDaysElapsed: number;
} {
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const prevTotalDays = getTotalDaysInMonth(prevYear, prevMonth);
  const prevDaysElapsed = Math.min(daysElapsed, prevTotalDays);

  const prevMonthStr = String(prevMonth).padStart(2, "0");
  const startDate = `${prevYear}-${prevMonthStr}-01`;
  const endDate = `${prevYear}-${prevMonthStr}-${String(prevDaysElapsed).padStart(2, "0")}`;

  return {
    prevYear,
    prevMonth,
    startDate,
    endDate,
    prevDaysElapsed,
  };
}

/**
 * Mengevaluasi perbandingan omset antar periode secara adil dan jujur.
 */
export function evaluateFairComparison(
  currentRevenue: number,
  currentReportedDays: number,
  prevRevenue: number,
  prevReportedDays: number,
  daysElapsed: number
): FairComparisonResult {
  if (daysElapsed <= 0) {
    return {
      isFair: false,
      previousRevenue: prevRevenue,
      previousReportedDays: prevReportedDays,
      growthPercent: null,
      note: "Periode belum berjalan",
    };
  }

  if (currentReportedDays === 0) {
    return {
      isFair: false,
      previousRevenue: prevRevenue,
      previousReportedDays: prevReportedDays,
      growthPercent: null,
      note: "Belum ada rekap tercatat bulan ini",
    };
  }

  if (prevReportedDays === 0) {
    return {
      isFair: false,
      previousRevenue: 0,
      previousReportedDays: 0,
      growthPercent: null,
      note: "Data pembanding bulan lalu belum tersedia",
    };
  }

  // Jika data bulan lalu kurang dari 50% hari lapor bulan ini, perbandingan dianggap belum seimbang
  if (prevReportedDays < Math.max(1, Math.floor(currentReportedDays * 0.5))) {
    return {
      isFair: false,
      previousRevenue: prevRevenue,
      previousReportedDays: prevReportedDays,
      growthPercent: null,
      note: "Data bulan lalu belum cukup lengkap untuk perbandingan berimbang",
    };
  }

  if (prevRevenue === 0) {
    if (currentRevenue > 0) {
      return {
        isFair: true,
        previousRevenue: 0,
        previousReportedDays: prevReportedDays,
        growthPercent: 100,
        note: "Mulai mencatatkan omset (bulan lalu Rp 0)",
      };
    }
    return {
      isFair: true,
      previousRevenue: 0,
      previousReportedDays: prevReportedDays,
      growthPercent: 0,
      note: "Sama dengan bulan lalu (Rp 0)",
    };
  }

  const diff = currentRevenue - prevRevenue;
  const growth = Math.round((diff / prevRevenue) * 100);
  const note =
    growth > 0
      ? `Naik ${growth}% dibanding periode setara bulan lalu`
      : growth < 0
      ? `Turun ${Math.abs(growth)}% dibanding periode setara bulan lalu`
      : "Stabil (sama dengan periode setara bulan lalu)";

  return {
    isFair: true,
    previousRevenue: prevRevenue,
    previousReportedDays: prevReportedDays,
    growthPercent: growth,
    note,
  };
}

/**
 * Menghitung metrik performa seluruh gerai.
 */
export function buildUnitPerformanceMetrics(
  units: RawBusinessUnit[],
  currentReports: RawDailyReport[],
  previousReports: RawDailyReport[],
  year: number,
  month: number,
  referenceDateWIB = getTodayWIB()
): {
  period: PeriodMetadata;
  summary: UnitPerformanceSummary;
  units: UnitPerformanceMetric[];
} {
  const { calendarDaysElapsed, totalDaysInMonth, isCurrentMonth, isPastMonth, isFutureMonth } =
    calculateCalendarDaysElapsed(year, month, referenceDateWIB);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthLabel = `${monthNames[month - 1]} ${year}`;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const period: PeriodMetadata = {
    month: monthStr,
    monthLabel,
    year,
    monthNum: month,
    calendarDaysElapsed,
    totalDaysInMonth,
    isCurrentMonth,
    isPastMonth,
    isFutureMonth,
  };

  // Peta laporan per unit
  const currentMap = new Map<string, RawDailyReport[]>();
  for (const r of currentReports) {
    if (!currentMap.has(r.unit_id)) currentMap.set(r.unit_id, []);
    currentMap.get(r.unit_id)!.push(r);
  }

  const previousMap = new Map<string, RawDailyReport[]>();
  for (const r of previousReports) {
    if (!previousMap.has(r.unit_id)) previousMap.set(r.unit_id, []);
    previousMap.get(r.unit_id)!.push(r);
  }

  let totalRevenue = 0;
  let totalTarget = 0;
  let totalExpenses = 0;
  let totalReportingPercentageSum = 0;
  let unitsWithReportingRateCount = 0;
  let unitsMeetingTarget = 0;
  let unitsWithTarget = 0;
  let activeUnitsCount = 0;

  const resultUnits: UnitPerformanceMetric[] = units.map((u) => {
    const rawTarget = typeof u.monthly_target === "string" ? parseFloat(u.monthly_target) : u.monthly_target;
    const monthlyTarget = typeof rawTarget === "number" && !isNaN(rawTarget) ? rawTarget : 0;

    const uCurrentReports = currentMap.get(u.id) || [];
    const uPreviousReports = previousMap.get(u.id) || [];

    // Agregasi bulan berjalan
    let actualRevenue = 0;
    let uExpenses = 0;
    let latestIssue: string | null = null;
    let latestIssueDate: string | null = null;

    // Urutkan laporan berdasarkan tanggal menaik untuk konsistensi
    const sortedCurrent = [...uCurrentReports].sort((a, b) => a.report_date.localeCompare(b.report_date));

    for (const rep of sortedCurrent) {
      const rev = typeof rep.gross_revenue === "string" ? parseFloat(rep.gross_revenue) : (rep.gross_revenue || 0);
      const exp = typeof rep.operational_expenses === "string" ? parseFloat(rep.operational_expenses) : (rep.operational_expenses || 0);
      actualRevenue += isNaN(rev) ? 0 : rev;
      uExpenses += isNaN(exp) ? 0 : exp;

      if (rep.operational_notes && rep.operational_notes.trim().length > 0) {
        latestIssue = rep.operational_notes.trim();
        latestIssueDate = rep.report_date;
      }
    }

    const reportedDays = sortedCurrent.length;
    const reportingRatePercent =
      calendarDaysElapsed > 0 ? Math.round((reportedDays / calendarDaysElapsed) * 100) : null;

    const targetAchievementPercent =
      monthlyTarget > 0 ? Math.round((actualRevenue / monthlyTarget) * 100) : null;

    const operationalMargin = actualRevenue - uExpenses;

    // Agregasi periode setara bulan lalu
    let prevRevenue = 0;
    for (const prep of uPreviousReports) {
      const prevRev = typeof prep.gross_revenue === "string" ? parseFloat(prep.gross_revenue) : (prep.gross_revenue || 0);
      prevRevenue += isNaN(prevRev) ? 0 : prevRev;
    }
    const prevReportedDays = uPreviousReports.length;

    const comparison = evaluateFairComparison(
      actualRevenue,
      reportedDays,
      prevRevenue,
      prevReportedDays,
      calendarDaysElapsed
    );

    // Akumulasi ringkasan koperasi
    totalRevenue += actualRevenue;
    totalExpenses += uExpenses;
    if (monthlyTarget > 0) {
      totalTarget += monthlyTarget;
      unitsWithTarget += 1;
      if (actualRevenue >= monthlyTarget) {
        unitsMeetingTarget += 1;
      }
    }

    if (reportingRatePercent !== null) {
      totalReportingPercentageSum += reportingRatePercent;
      unitsWithReportingRateCount += 1;
    }

    if (u.status === "aktif") {
      activeUnitsCount += 1;
    }

    return {
      id: u.id,
      code: u.code,
      name: u.name,
      unitType: u.unit_type || "Usaha Umum",
      status: u.status,
      picName: u.pic_name || "Abdul Halim",
      location: u.location || "Ladang Laweh",
      monthlyTarget,
      actualRevenue,
      targetAchievementPercent,
      reportedDays,
      calendarDaysElapsed,
      reportingRatePercent,
      totalExpenses: uExpenses,
      operationalMargin,
      latestIssue,
      latestIssueDate,
      comparison,
    };
  });

  const overallTargetPercent =
    totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : null;

  const avgReportingRate =
    unitsWithReportingRateCount > 0
      ? Math.round(totalReportingPercentageSum / unitsWithReportingRateCount)
      : null;

  const summary: UnitPerformanceSummary = {
    totalUnits: units.length,
    activeUnits: activeUnitsCount,
    totalRevenue,
    totalTarget,
    overallTargetPercent,
    totalExpenses,
    totalOperationalMargin: totalRevenue - totalExpenses,
    avgReportingRate,
    unitsMeetingTarget,
    unitsWithTarget,
  };

  return { period, summary, units: resultUnits };
}
