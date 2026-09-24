import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateCalendarDaysElapsed,
  getTotalDaysInMonth,
  getPreviousPeriodRange,
  evaluateFairComparison,
  buildUnitPerformanceMetrics,
  RawBusinessUnit,
  RawDailyReport,
} from "@/lib/unit-performance";
import { GET } from "@/app/api/manager/unit-performance/route";

describe("Modul Kalkulasi Kinerja Gerai (Unit Performance)", () => {
  describe("1. Perhitungan Hari Kalender Berjalan", () => {
    it("menghitung hari berjalan pada bulan aktif WIB secara tepat", () => {
      const result = calculateCalendarDaysElapsed(2026, 9, "2026-09-23");
      expect(result.isCurrentMonth).toBe(true);
      expect(result.isPastMonth).toBe(false);
      expect(result.isFutureMonth).toBe(false);
      expect(result.calendarDaysElapsed).toBe(23);
      expect(result.totalDaysInMonth).toBe(30);
    });

    it("menghitung seluruh hari kalender untuk bulan lampau", () => {
      const result = calculateCalendarDaysElapsed(2026, 8, "2026-09-23");
      expect(result.isCurrentMonth).toBe(false);
      expect(result.isPastMonth).toBe(true);
      expect(result.calendarDaysElapsed).toBe(31);
      expect(result.totalDaysInMonth).toBe(31);
    });

    it("menghitung 0 hari kalender untuk bulan masa depan", () => {
      const result = calculateCalendarDaysElapsed(2026, 10, "2026-09-23");
      expect(result.isCurrentMonth).toBe(false);
      expect(result.isFutureMonth).toBe(true);
      expect(result.calendarDaysElapsed).toBe(0);
      expect(result.totalDaysInMonth).toBe(31);
    });

    it("menghitung hari kabisat Februari dengan benar", () => {
      expect(getTotalDaysInMonth(2028, 2)).toBe(29);
      expect(getTotalDaysInMonth(2026, 2)).toBe(28);
    });
  });

  describe("2. Rentang Periode Pembanding Bulan Lalu", () => {
    it("menghasilkan rentang ekuivalen pada bulan yang sama tahun berjalan", () => {
      const range = getPreviousPeriodRange(2026, 9, 23);
      expect(range.prevYear).toBe(2026);
      expect(range.prevMonth).toBe(8);
      expect(range.startDate).toBe("2026-08-01");
      expect(range.endDate).toBe("2026-08-23");
      expect(range.prevDaysElapsed).toBe(23);
    });

    it("menangani pergantian tahun (Januari ke Desember tahun sebelumnya)", () => {
      const range = getPreviousPeriodRange(2027, 1, 15);
      expect(range.prevYear).toBe(2026);
      expect(range.prevMonth).toBe(12);
      expect(range.startDate).toBe("2026-12-01");
      expect(range.endDate).toBe("2026-12-15");
      expect(range.prevDaysElapsed).toBe(15);
    });
  });

  describe("3. Evaluasi Perbandingan Periode yang Adil (Fair Comparison)", () => {
    it("menolak perbandingan jika data bulan lalu belum ada (0 hari)", () => {
      const comp = evaluateFairComparison(10000000, 15, 0, 0, 20);
      expect(comp.isFair).toBe(false);
      expect(comp.growthPercent).toBeNull();
      expect(comp.note).toContain("belum tersedia");
    });

    it("menolak perbandingan jika data bulan lalu tidak seimbang (< 50% hari lapor)", () => {
      const comp = evaluateFairComparison(15000000, 20, 2000000, 3, 20);
      expect(comp.isFair).toBe(false);
      expect(comp.growthPercent).toBeNull();
      expect(comp.note).toContain("belum cukup lengkap");
    });

    it("menghitung persentase pertumbuhan kenaikan jika data kedua periode seimbang", () => {
      const comp = evaluateFairComparison(15000000, 20, 10000000, 18, 20);
      expect(comp.isFair).toBe(true);
      expect(comp.growthPercent).toBe(50);
      expect(comp.note).toContain("Naik 50%");
    });

    it("menghitung persentase penurunan jika omset menurun", () => {
      const comp = evaluateFairComparison(8000000, 20, 10000000, 18, 20);
      expect(comp.isFair).toBe(true);
      expect(comp.growthPercent).toBe(-20);
      expect(comp.note).toContain("Turun 20%");
    });
  });

  describe("4. Pembangunan Metrik & Ringkasan Koperasi", () => {
    const mockUnits: RawBusinessUnit[] = [
      {
        id: "unit-1",
        code: "SEMBAKO-01",
        name: "Gerai Sembako",
        unit_type: "Sembako",
        status: "aktif",
        pic_name: "Abdul Halim",
        monthly_target: 20000000,
      },
      {
        id: "unit-2",
        code: "PUPUK-01",
        name: "Gerai Saprotan",
        unit_type: "Pertanian",
        status: "persiapan",
        pic_name: "Budi",
        monthly_target: 0, // Target belum ditentukan
      },
    ];

    const mockCurrentReports: RawDailyReport[] = [
      {
        id: "rep-1",
        unit_id: "unit-1",
        report_date: "2026-09-01",
        gross_revenue: 12000000,
        operational_expenses: 2000000,
        operational_notes: "Sempat ada kendala pasokan",
      },
      {
        id: "rep-2",
        unit_id: "unit-1",
        report_date: "2026-09-02",
        gross_revenue: 10000000,
        operational_expenses: 1000000,
      },
      {
        id: "rep-3",
        unit_id: "unit-2",
        report_date: "2026-09-01",
        gross_revenue: 5000000,
        operational_expenses: 500000,
      },
    ];

    it("membedakan gerai dengan target versus gerai tanpa target", () => {
      const { summary, units } = buildUnitPerformanceMetrics(
        mockUnits,
        mockCurrentReports,
        [],
        2026,
        9,
        "2026-09-23"
      );

      expect(units.length).toBe(2);

      // Gerai Sembako (target 20jt, omset 22jt -> 110%)
      const u1 = units.find((u) => u.id === "unit-1")!;
      expect(u1.monthlyTarget).toBe(20000000);
      expect(u1.actualRevenue).toBe(22000000);
      expect(u1.targetAchievementPercent).toBe(110);
      expect(u1.reportedDays).toBe(2);
      expect(u1.operationalMargin).toBe(19000000);
      expect(u1.latestIssue).toBe("Sempat ada kendala pasokan");

      // Gerai Saprotan (target 0 -> null percent)
      const u2 = units.find((u) => u.id === "unit-2")!;
      expect(u2.monthlyTarget).toBe(0);
      expect(u2.actualRevenue).toBe(5000000);
      expect(u2.targetAchievementPercent).toBeNull();

      // Ringkasan koperasi
      expect(summary.totalRevenue).toBe(27000000);
      expect(summary.totalTarget).toBe(20000000);
      expect(summary.unitsWithTarget).toBe(1);
      expect(summary.unitsMeetingTarget).toBe(1);
    });
  });

  describe("5. Endpoint API GET /api/manager/unit-performance", () => {
    it("menolak request dari host publik yang tidak sah (403)", async () => {
      const req = new Request("http://example.com/api/manager/unit-performance", {
        headers: { host: "evil-hacker.com" },
      });
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    it("menolak format bulan yang tidak valid (400)", async () => {
      const req = new Request("http://127.0.0.1:3000/api/manager/unit-performance?month=2026-13", {
        headers: { host: "127.0.0.1:3000" },
      });
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Parameter tidak sah");
    });
  });
});
