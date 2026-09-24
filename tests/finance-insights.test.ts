import { describe, expect, it } from "vitest";
import { buildFinanceInsights } from "@/lib/finance-insights";

describe("ringkasan operasional keuangan", () => {
  it("memisahkan setoran nol, setoran kosong, dan selisih operasional", () => {
    const result = buildFinanceInsights([
      { report_date: "2026-09-23", gross_revenue: "100.10", operational_expenses: "20.05", cash_in_hand: "0.00" },
      { report_date: "2026-09-23", gross_revenue: "50.20", operational_expenses: "80.10", cash_in_hand: null },
    ], ["2026-09-23", "2026-09-24"]);
    expect(result).toMatchObject({ totalGrossRevenue: 150.3, totalExpenses: 100.15, netOperationalMargin: 50.15, reportedCashTotal: 0, cashReportsCount: 1 });
    expect(result.dailyTrend[0]).toMatchObject({ reports: 2, revenue: 150.3, expenses: 100.15 });
    expect(result.dailyTrend[1]).toMatchObject({ reports: 0, revenue: 0 });
  });

  it("menolak nilai uang yang tidak valid agar tidak berubah diam-diam menjadi nol", () => {
    expect(() => buildFinanceInsights([{ report_date: "2026-09-23", gross_revenue: "x", operational_expenses: "0", cash_in_hand: null }], [])).toThrow("Nilai uang");
  });
});
