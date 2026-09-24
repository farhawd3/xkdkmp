// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayWIB, getCurrentYearMonthWIB, getDaysAgoWIB } from "@/lib/utils";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET as getFinanceSummary } from "@/app/api/finance/summary/route";
import { GET as getExecutiveDashboard } from "@/app/api/dashboard/executive/route";

describe("Tahap 2 — Audit Kejujuran Data & Perhitungan Finansial/Operasional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Utilitas Tanggal Bisnis WIB (Asia/Jakarta)", () => {
    it("menghasilkan format YYYY-MM-DD untuk hari ini", () => {
      const today = getTodayWIB();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("menghasilkan format YYYY-MM untuk bulan berjalan", () => {
      const ym = getCurrentYearMonthWIB();
      expect(ym).toMatch(/^\d{4}-\d{2}$/);
    });

    it("menghasilkan tanggal 6 hari lalu dengan format yang sah", () => {
      const sixDaysAgo = getDaysAgoWIB(6);
      expect(sixDaysAgo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("2. Audit Kejujuran Data Keuangan (/api/finance/summary)", () => {
    it("menolak akses dari host publik luar tanpa konfigurasi privat", async () => {
      const req = new Request("https://publik-luar.org/api/finance/summary", {
        headers: { host: "publik-luar.org" },
      });
      const res = await getFinanceSummary(req);
      expect(res.status).toBe(403);
    });

    it("mengembalikan status 500 fail-fast jika query Supabase error (tanpa masking nol)", async () => {
      const req = new Request("http://localhost:3000/api/finance/summary", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: (table: string) => ({
          select: () => {
            if (table === "unit_daily_reports") {
              return { order: async () => ({ data: null, error: { message: "Database connection failed" } }) };
            }
            return {
              eq: async () => ({ count: 0, data: [], error: null }),
            };
          },
        }),
      });

      const res = await getFinanceSummary(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("Gagal membaca rekap operasional");
    });

    it("tidak memuat konstanta palsu (kas bank Rp25jt, aset Rp15jt, atau valuasi stok Rp20rb)", async () => {
      const req = new Request("http://localhost:3000/api/finance/summary", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: (table: string) => ({
          select: () => {
            if (table === "unit_daily_reports") {
              return { order: async () => ({
                data: [
                  {
                    gross_revenue: "1000000.00",
                    operational_expenses: "200000.00",
                    net_profit: "800000.00",
                    cash_in_hand: "800000.00",
                    report_date: "2026-09-23",
                  },
                ],
                error: null,
              }) };
            }
            if (table === "products") {
              return {
                eq: async () => ({
                  data: [{ current_stock: "50", min_stock: "10" }],
                  error: null,
                }),
              };
            }
            if (table === "members") {
              return {
                eq: async () => ({ count: 15, error: null }),
              };
            }
            return {
              eq: async () => ({ data: [], count: 0, error: null }),
            };
          },
        }),
      });

      const res = await getFinanceSummary(req);
      expect(res.status).toBe(200);
      const body = await res.json();

      // Tidak ada angka fiktif Rp 25.000.000 atau Rp 15.000.000
      expect(body.bukuBesar).toBeUndefined();
      expect(body.neraca).toBeUndefined();
      expect(body.alokasiShu).toBeUndefined();
      expect(body.accountingReadiness.officialStatementsAvailable).toBe(false);
      expect(body.summary.netOperationalMargin).toBe(800000);
    });

    it("mempertahankan nilai setoran kas = 0 tanpa tertimpa oleh omset minus pengeluaran", async () => {
      const req = new Request("http://localhost:3000/api/finance/summary", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: (table: string) => ({
          select: () => {
            if (table === "unit_daily_reports") {
              return { order: async () => ({
                data: [
                  {
                    gross_revenue: "500000.00",
                    operational_expenses: "100000.00",
                    net_profit: "400000.00",
                    cash_in_hand: "0.00", // Setoran nihil (misal uang disimpan di brankas gerai)
                    report_date: "2026-09-23",
                  },
                ],
                error: null,
              }) };
            }
            return {
              eq: async () => ({ data: [], count: 0, error: null }),
            };
          },
        }),
      });

      const res = await getFinanceSummary(req);
      const body = await res.json();
      // Setoran kas operasional yang diterima harus tepat 0, bukan 400.000 (omset - beban)
      expect(body.summary.reportedCashTotal).toBe(0);
      expect(body.summary.cashReportsCount).toBe(1);
    });

    it("mendukung selisih operasional negatif (kerugian/defisit) tanpa dipaksa menjadi nol", async () => {
      const req = new Request("http://localhost:3000/api/finance/summary", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: (table: string) => ({
          select: () => {
            if (table === "unit_daily_reports") {
              return { order: async () => ({
                data: [
                  {
                    gross_revenue: "200000.00",
                    operational_expenses: "350000.00",
                    net_profit: "-150000.00",
                    cash_in_hand: "0.00",
                    report_date: "2026-09-23",
                  },
                ],
                error: null,
              }) };
            }
            return {
              eq: async () => ({ data: [], count: 0, error: null }),
            };
          },
        }),
      });

      const res = await getFinanceSummary(req);
      const body = await res.json();
      expect(body.summary.netOperationalMargin).toBe(-150000);
      expect(body.accountingReadiness.officialStatementsAvailable).toBe(false);
    });
  });

  describe("3. Audit Dashboard Eksekutif (/api/dashboard/executive)", () => {
    it("mengembalikan status 500 fail-fast bila query database gagal", async () => {
      const req = new Request("http://localhost:3000/api/dashboard/executive", {
        headers: { host: "localhost:3000" },
      });

      const errorResult = { data: null, error: { message: "Supabase connection error" }, count: null };
      const chainable: any = {
        eq: () => chainable,
        neq: () => chainable,
        gte: () => chainable,
        lte: () => chainable,
        in: () => chainable,
        not: () => chainable,
        order: () => chainable,
        limit: () => chainable,
        maybeSingle: async () => errorResult,
        then: (resolve: any) => resolve(errorResult),
      };

      createClient.mockResolvedValue({
        from: () => ({
          select: () => chainable,
        }),
      });

      const res = await getExecutiveDashboard(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toContain("Gagal memuat ringkasan eksekutif");
    });

    it("hanya mengevaluasi kepatuhan lapor hari ini untuk gerai berstatus aktif", async () => {
      const req = new Request("http://localhost:3000/api/dashboard/executive", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: (table: string) => {
          if (table === "business_units") {
            return {
              select: (cols: string) => {
                if (cols.includes("name")) {
                  // Daftar seluruh gerai: 1 aktif, 1 persiapan, 1 rencana
                  return Promise.resolve({
                    data: [
                      { id: "u-1", name: "Gerai Sembako Aktif", status: "aktif" },
                      { id: "u-2", name: "Gerai ATK Persiapan", status: "persiapan" },
                      { id: "u-3", name: "Gerai Klinik Rencana", status: "rencana" },
                    ],
                    error: null,
                  });
                }
                return {
                  eq: async () => ({ count: 1, error: null }),
                  then: (resolve: (v: unknown) => void) => resolve({ count: 3, error: null }),
                };
              },
            };
          }
          if (table === "unit_daily_reports") {
            return {
              select: () => ({
                eq: async () => ({ count: 0, data: [], error: null }),
                gte: () => ({
                  lte: () => ({
                    order: async () => ({ data: [], error: null }),
                  }),
                  then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
                }),
              }),
            };
          }
          if (table === "organization_profile") {
            return {
              select: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: { business_status: "persiapan" }, error: null }),
                }),
              }),
            };
          }
          if (table === "products") {
            return {
              select: () => ({
                eq: async () => ({ data: [], error: null }),
              }),
            };
          }
          // Default untuk tabel lain (tasks, members)
          return {
            select: () => ({
              eq: () => ({
                neq: async () => ({ count: 0, error: null }),
                then: (resolve: (v: unknown) => void) => resolve({ count: 0, error: null }),
              }),
              neq: () => ({
                in: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: null }),
                  }),
                }),
                not: () => ({
                  lte: () => ({
                    order: async () => ({ data: [], error: null }),
                  }),
                }),
                then: (resolve: (v: unknown) => void) => resolve({ count: 0, error: null }),
              }),
            }),
          };
        },
      });

      const res = await getExecutiveDashboard(req);
      expect(res.status).toBe(200);
      const body = await res.json();

      // Hanya gerai aktif (u-1) yang masuk ke unreportedUnits jika belum lapor.
      // Gerai persiapan dan rencana tidak dianggap terlambat!
      expect(body.unreportedUnits).toHaveLength(1);
      expect(body.unreportedUnits[0].name).toBe("Gerai Sembako Aktif");
    });
  });
});
