import { describe, it, expect } from "vitest";
import {
  TaskSchema,
  DailyReportSchema,
  BusinessUnitSchema,
  SimpleStockUpdateSchema,
  SimpleMemberSchema,
} from "@/lib/validations/simple-schemas";

describe("Sistem Manajemen & Pemantauan Sederhana — Validasi Skema", () => {
  describe("Manajemen Tugas (TaskSchema)", () => {
    it("menolak tugas dengan judul terlalu pendek (< 3 karakter)", () => {
      const result = TaskSchema.safeParse({
        title: "Ab",
        pic_name: "Abdul Halim",
      });
      expect(result.success).toBe(false);
    });

    it("menolak tugas dengan prioritas yang tidak terdaftar", () => {
      const result = TaskSchema.safeParse({
        title: "Pengecekan Stok Toko",
        pic_name: "Abdul Halim",
        priority: "super_penting", // Bukan rendah|sedang|tinggi|mendesak
      });
      expect(result.success).toBe(false);
    });

    it("menerima tugas yang sah dengan default status dan prioritas", () => {
      const result = TaskSchema.safeParse({
        title: "Koordinasi pasokan beras dengan mitra",
        pic_name: "Abdul Halim",
        due_date: "2026-10-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("sedang");
        expect(result.data.status).toBe("belum_mulai");
      }
    });
  });

  describe("Rekapitulasi Pemantauan Gerai Harian (DailyReportSchema)", () => {
    it("menolak rekapitulasi dengan omset bernilai teks tidak valid", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-10-01",
        gross_revenue: "dua_juta",
        operational_expenses: "100000.00",
      });
      expect(result.success).toBe(false);
    });

    it("menolak rekapitulasi dengan nilai uang negatif", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-10-01",
        gross_revenue: -500000,
        operational_expenses: 0,
      });
      expect(result.success).toBe(false);
    });

    it("menerima data rekap harian gerai manual yang valid", () => {
      const result = DailyReportSchema.safeParse({
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        report_date: "2026-10-01",
        gross_revenue: "1850000.00",
        operational_expenses: "250000.00",
        cash_in_hand: "1600000.00",
        transaction_count: 52,
        operational_notes: "Operasional lancar, beras 5kg laris",
        source_type: "manual",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Kelola & Edit Gerai (BusinessUnitSchema)", () => {
    it("menolak gerai tanpa nama", () => {
      const result = BusinessUnitSchema.safeParse({
        code: "GERAI-02",
        name: "",
        pic_name: "Abdul Halim",
      });
      expect(result.success).toBe(false);
    });

    it("menerima data penyesuaian gerai lengkap", () => {
      const result = BusinessUnitSchema.safeParse({
        code: "GERAI-SEMBAKO-01",
        name: "Gerai Sembako Nagari Ladang Laweh",
        unit_type: "Sembako & Kebutuhan Pokok",
        pic_name: "Abdul Halim",
        phone: "08123456789",
        location: "Simpang Tiga Ladang Laweh",
        monthly_target: "30000000.00",
        status: "persiapan",
        readiness_percentage: 50,
        notes: "Target pembukaan awal 2027",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Pemantauan Stok Angka (SimpleStockUpdateSchema)", () => {
    it("menolak angka stok negatif", () => {
      const result = SimpleStockUpdateSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        current_stock: -10,
      });
      expect(result.success).toBe(false);
    });

    it("menerima penyesuaian angka stok fisik yang valid", () => {
      const result = SimpleStockUpdateSchema.safeParse({
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        current_stock: 45,
        min_stock: 15,
        notes: "Hasil stok opname fisik",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Pemantauan Anggota (SimpleMemberSchema)", () => {
    it("menolak anggota dengan nama terlalu pendek", () => {
      const result = SimpleMemberSchema.safeParse({
        member_number: "ANG-001",
        full_name: "A",
      });
      expect(result.success).toBe(false);
    });

    it("menerima pendaftaran anggota baru", () => {
      const result = SimpleMemberSchema.safeParse({
        member_number: "ANG-001",
        full_name: "Ahmad Dahlan",
        phone: "081298765432",
        status: "calon",
      });
      expect(result.success).toBe(true);
    });
  });
});
