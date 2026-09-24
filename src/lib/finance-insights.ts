export interface OperationalReportAmount {
  report_date: string;
  gross_revenue: string | number;
  operational_expenses: string | number;
  cash_in_hand: string | number | null;
}

export interface FinanceSummaryResponse {
  generatedAt: string;
  businessDate: string;
  summary: ReturnType<typeof buildFinanceInsights> & { totalMembers: number };
  accountingReadiness: {
    officialStatementsAvailable: false;
    reason: string;
    missingRecords: string[];
  };
}

function cents(value: string | number): bigint {
  const raw = String(value);
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error("Nilai uang pada rekap tidak valid.");
  const negative = raw.startsWith("-");
  const [whole, decimal = ""] = (negative ? raw.slice(1) : raw).split(".");
  const amount = BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0"));
  return negative ? -amount : amount;
}

function rupiah(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < -BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Akumulasi uang melebihi batas perhitungan aman.");
  }
  return Number(value) / 100;
}

/** Ringkasan operasional dari rekap gerai; bukan jurnal atau laporan akuntansi. */
export function buildFinanceInsights(reports: OperationalReportAmount[], dates: string[]) {
  let revenue = 0n;
  let expenses = 0n;
  let reportedCash = 0n;
  let cashReportsCount = 0;
  const byDate = new Map<string, { revenue: bigint; expenses: bigint; reports: number }>();

  for (const report of reports) {
    const rev = cents(report.gross_revenue);
    const exp = cents(report.operational_expenses);
    revenue += rev;
    expenses += exp;
    if (report.cash_in_hand !== null && report.cash_in_hand !== undefined) {
      reportedCash += cents(report.cash_in_hand);
      cashReportsCount++;
    }
    const day = byDate.get(report.report_date) ?? { revenue: 0n, expenses: 0n, reports: 0 };
    day.revenue += rev;
    day.expenses += exp;
    day.reports++;
    byDate.set(report.report_date, day);
  }

  return {
    totalGrossRevenue: rupiah(revenue),
    totalExpenses: rupiah(expenses),
    netOperationalMargin: rupiah(revenue - expenses),
    reportedCashTotal: rupiah(reportedCash),
    cashReportsCount,
    reportCount: reports.length,
    dailyTrend: dates.map((date) => {
      const day = byDate.get(date);
      return { date, revenue: rupiah(day?.revenue ?? 0n), expenses: rupiah(day?.expenses ?? 0n), reports: day?.reports ?? 0 };
    }),
  };
}
