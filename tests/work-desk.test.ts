// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET } from "@/app/api/manager/work-desk/route";
import { getTodayWIB, getDaysAgoWIB } from "@/lib/utils";

describe("Meja Kerja Manajer — GET /api/manager/work-desk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const today = getTodayWIB();
  const yesterday = getDaysAgoWIB(1);

  it("menolak akses di luar batas privat", async () => {
    const externalReq = new Request("https://external-domain.com/api/manager/work-desk", {
      headers: { host: "external-domain.com" },
    });
    const res = await GET(externalReq);
    expect(res.status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("menghimpun dan mengelompokkan tindak lanjut prioritas secara deterministik", async () => {
    const localReq = new Request("http://localhost:3000/api/manager/work-desk", {
      headers: { host: "localhost:3000" },
    });

    const mockUnits = [
      { id: "u-1", name: "Gerai Sembako", status: "aktif", pic_name: "Abdul Halim" },
      { id: "u-2", name: "Gerai Sayur Segar", status: "aktif", pic_name: "Siti Rahma" },
      { id: "u-3", name: "Gerai Pulsa & PPOB", status: "persiapan", pic_name: "Budi Santoso" },
    ];

    const mockReports = [
      // u-1 sudah lapor hari ini
      { id: "r-1", unit_id: "u-1", report_date: today, gross_revenue: 1500000, operational_notes: null },
      // u-2 kemarin ada kendala
      { id: "r-2", unit_id: "u-2", report_date: yesterday, gross_revenue: 400000, operational_notes: "Genset padam 2 jam" },
    ];

    const mockTasks = [
      // Lewat tenggat
      { id: "t-1", title: "Bayar Tagihan Listrik", description: "PLN", priority: "tinggi", status: "belum_mulai", due_date: "2026-01-01", pic_name: "Abdul Halim", unit_id: "u-1" },
      // Jatuh tempo hari ini
      { id: "t-2", title: "Verifikasi Rekap Harian", description: "Cek fisik", priority: "sedang", status: "sedang_proses", due_date: today, pic_name: "Abdul Halim", unit_id: "u-1" },
      // Prioritas mendesak tanpa tenggat
      { id: "t-3", title: "Perbaiki Atap Bocor", description: "Darurat", priority: "mendesak", status: "belum_mulai", due_date: null, pic_name: "Siti Rahma", unit_id: "u-2" },
      // Selesai hari ini
      { id: "t-4", title: "Kirim Surat Pengurus", description: "Arsip", priority: "rendah", status: "selesai", due_date: today, pic_name: "Abdul Halim", unit_id: "u-1" },
    ];

    const mockProducts = [
      // Stok kosong (0)
      { id: "p-1", sku: "BRG-01", name: "Beras Solok 10kg", current_stock: 0, min_stock: 5, base_unit: "karung", unit_id: "u-1", is_archived: false },
      // Stok menipis
      { id: "p-2", sku: "BRG-02", name: "Minyak Goreng 2L", current_stock: 3, min_stock: 10, base_unit: "pouch", unit_id: "u-1", is_archived: false },
      // Stok aman
      { id: "p-3", sku: "BRG-03", name: "Gula Pasir 1kg", current_stock: 30, min_stock: 10, base_unit: "kg", unit_id: "u-1", is_archived: false },
    ];

    createClient.mockResolvedValue({
      from: (table: string) => {
        if (table === "business_units") {
          return {
            select: () => ({
              order: async () => ({ data: mockUnits, error: null }),
            }),
          };
        }
        if (table === "unit_daily_reports") {
          return {
            select: () => ({
              gte: () => ({
                order: async () => ({ data: mockReports, error: null }),
              }),
            }),
          };
        }
        if (table === "tasks") {
          return {
            select: () => ({
              order: async () => ({ data: mockTasks, error: null }),
            }),
          };
        }
        if (table === "products") {
          return {
            select: () => ({
              eq: () => ({
                order: async () => ({ data: mockProducts, error: null }),
              }),
            }),
          };
        }
        return { select: () => Promise.resolve({ data: [], error: null }) };
      },
    });

    const res = await GET(localReq);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.timestampWIB).toBe(today);
    expect(body.summary).toBeDefined();

    // Verifikasi pengelompokan urgensi:
    // perlu_sekarang: t-1 (overdue), t-3 (mendesak), p-1 (stok 0) = 3 item
    expect(body.summary.perlu_sekarang).toBe(3);

    // hari_ini: t-2 (tenggat hari ini), u-2 (gerai aktif belum rekap hari ini) = 2 item
    // Catatan: u-3 statusnya 'persiapan', bukan 'aktif', jadi tidak ditagih rekap
    expect(body.summary.hari_ini).toBe(2);

    // pantau: p-2 (stok menipis), r-2 (catatan kendala u-2) = 2 item
    expect(body.summary.pantau).toBe(2);

    // selesai: t-4 (tugas selesai hari ini), u-1 (gerai aktif sudah rekap hari ini) = 2 item
    expect(body.summary.selesai).toBe(2);

    expect(body.summary.total).toBe(9);
    expect(body.partialErrors).toBeNull();
  });

  it("menangani kegagalan salah satu tabel secara fail-fast parsial tanpa membuat sistem runtuh", async () => {
    const localReq = new Request("http://localhost:3000/api/manager/work-desk", {
      headers: { host: "localhost:3000" },
    });

    createClient.mockResolvedValue({
      from: (table: string) => {
        if (table === "products") {
          // Simulasikan produk gagal dibaca
          return {
            select: () => ({
              eq: () => ({
                order: async () => ({ data: null, error: { message: "Tabel products terkunci" } }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            order: async () => ({ data: [], error: null }),
            gte: () => ({
              order: async () => ({ data: [], error: null }),
            }),
            eq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        };
      },
    });

    const res = await GET(localReq);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.partialErrors).toBeDefined();
    expect(body.partialErrors.length).toBe(1);
    expect(body.partialErrors[0]).toContain("Katalog Stok Barang");
  });

  it("mengembalikan status 500 jika seluruh sumber data gagal dimuat", async () => {
    const localReq = new Request("http://localhost:3000/api/manager/work-desk", {
      headers: { host: "localhost:3000" },
    });

    const dbError = { message: "Database connection lost" };
    createClient.mockResolvedValue({
      from: () => ({
        select: () => ({
          order: async () => ({ data: null, error: dbError }),
          gte: () => ({
            order: async () => ({ data: null, error: dbError }),
          }),
          eq: () => ({
            order: async () => ({ data: null, error: dbError }),
          }),
        }),
      }),
    });

    const res = await GET(localReq);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Seluruh sumber data Meja Kerja gagal dimuat");
  });
});
