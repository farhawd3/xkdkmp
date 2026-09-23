import { describe, it, expect } from "vitest";
import {
  DailyReportSchema,
  TaskSchema,
  BusinessUnitSchema,
} from "@/lib/validations/simple-schemas";

describe("Tahap 11 — Validasi Skema Pemantauan Operasional Gerai & Tugas", () => {
  describe("Rekapitulasi Harian Gerai (DailyReportSchema)", () => {
    it("menolak laporan tanpa format tanggal yang sah", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "23-09-2026", // Format salah, harus YYYY-MM-DD
        gross_revenue: "1500000.00",
        operational_expenses: "200000.00",
      });
      expect(result.success).toBe(false);
    });

    it("menolak omset dengan nilai nominal bukan angka uang valid", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-09-23",
        gross_revenue: "satu_juta",
        operational_expenses: "200000.00",
      });
      expect(result.success).toBe(false);
    });

    it("menerima laporan rekap harian gerai yang sah secara default manual", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-09-23",
        gross_revenue: "2450000.00",
        operational_expenses: "350000.00",
        cash_in_hand: "2100000.00",
        transaction_count: 42,
        operational_notes: "Pasokan minyak goreng aman lancar",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source_type).toBe("manual");
      }
    });
  });

  describe("Manajemen Tugas Manajer (TaskSchema)", () => {
    it("menolak tugas dengan judul kurang dari 3 karakter", () => {
      const result = TaskSchema.safeParse({
        title: "AB",
        pic_name: "Abdul Halim",
      });
      expect(result.success).toBe(false);
    });

    it("menerima tugas yang valid dengan default status belum_mulai dan prioritas sedang", () => {
      const result = TaskSchema.safeParse({
        title: "Pengecekan fisik stok beras gerai sembako",
        pic_name: "Abdul Halim",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("sedang");
        expect(result.data.status).toBe("belum_mulai");
      }
    });
  });

  describe("Profil Unit Usaha / Gerai (BusinessUnitSchema)", () => {
    it("menolak gerai tanpa nama", () => {
      const result = BusinessUnitSchema.safeParse({
        code: "GERAI-01",
        name: "",
        unit_type: "Sembako",
      });
      expect(result.success).toBe(false);
    });

    it("menerima profil gerai yang valid", () => {
      const result = BusinessUnitSchema.safeParse({
        code: "GERAI-SEMBAKO-01",
        name: "Gerai Sembako Nagari Ladang Laweh",
        unit_type: "Sembako & Kebutuhan Pokok",
        pic_name: "Abdul Halim",
        monthly_target: "25000000.00",
        status: "persiapan",
      });
      expect(result.success).toBe(true);
    });
  });
});
