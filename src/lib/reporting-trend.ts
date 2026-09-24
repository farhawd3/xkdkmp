export interface DailyReportingCoverage {
  date: string;
  reported: number;
  total: number;
  percent: number | null;
}

/** Menghitung gerai aktif yang mengirim rekap, bukan jumlah baris rekap. */
export function buildReportingTrend(
  dates: string[],
  reports: Array<{ report_date: string; unit_id: string }>,
  activeUnitIds: string[],
): DailyReportingCoverage[] {
  const active = new Set(activeUnitIds);
  const reportedByDate = new Map<string, Set<string>>();

  for (const report of reports) {
    if (!active.has(report.unit_id)) continue;
    const unitIds = reportedByDate.get(report.report_date) ?? new Set<string>();
    unitIds.add(report.unit_id);
    reportedByDate.set(report.report_date, unitIds);
  }

  return dates.map((date) => {
    const reported = reportedByDate.get(date)?.size ?? 0;
    return {
      date,
      reported,
      total: active.size,
      percent: active.size ? Math.round((reported / active.size) * 100) : null,
    };
  });
}
