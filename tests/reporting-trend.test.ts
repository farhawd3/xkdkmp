import { describe, expect, it } from "vitest";
import { buildReportingTrend } from "@/lib/reporting-trend";

describe("keterisian rekap tujuh hari", () => {
  const dates = ["2026-09-23", "2026-09-24"];

  it("menghitung gerai aktif unik saja dan tidak menggandakan rekap", () => {
    const result = buildReportingTrend(dates, [
      { report_date: dates[0], unit_id: "a" },
      { report_date: dates[0], unit_id: "a" },
      { report_date: dates[0], unit_id: "nonaktif" },
      { report_date: dates[1], unit_id: "b" },
    ], ["a", "b"]);
    expect(result).toEqual([
      { date: dates[0], reported: 1, total: 2, percent: 50 },
      { date: dates[1], reported: 1, total: 2, percent: 50 },
    ]);
  });

  it("membedakan tidak ada gerai aktif dari nol laporan", () => {
    expect(buildReportingTrend(dates, [], [])).toEqual(dates.map((date) => ({
      date, reported: 0, total: 0, percent: null,
    })));
    expect(buildReportingTrend(dates, [], ["a"])[0]).toMatchObject({
      reported: 0, total: 1, percent: 0,
    });
  });
});
