// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackupFileSchema } from "@/lib/validations/backup-schemas";
import { TaskSchema } from "@/lib/validations/simple-schemas";
import { serializeCsv } from "@/lib/csv";
import { getTodayWIB, getTomorrowWIB, getDaysAgoWIB } from "@/lib/utils";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET as getExecutiveDashboard } from "@/app/api/dashboard/executive/route";

describe("Tahap 5 — Fitur Fokus Manajer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Utilitas Tanggal & CSV Sanitasi", () => {
    it("menghitung getTomorrowWIB tepat 1 hari setelah getTodayWIB", () => {
      const today = getTodayWIB();
      const tomorrow = getTomorrowWIB();
      expect(tomorrow > today).toBe(true);

      const todayDate = new Date(`${today}T00:00:00Z`);
      const tomorrowDate = new Date(`${tomorrow}T00:00:00Z`);
      const diffMs = tomorrowDate.getTime() - todayDate.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    });

    it("memastikan serializeCsv menetralkan karakter formula injection berbahaya", () => {
      const rows = [
        ["Nama", "Rumus 1", "Rumus 2", "Rumus 3", "Tab Test"],
        ["Normal", "=cmd|' /C calc'!A0", "+1+2", "@SUM(A1:A5)", "\talert(1)"],
      ];
      const serialized = serializeCsv(rows);
      expect(serialized.startsWith("\uFEFF")).toBe(true);
      expect(serialized).toContain('"\'=cmd|\' /C calc\'!A0"');
      expect(serialized).toContain('"\'+1+2"');
      expect(serialized).toContain('"\'@SUM(A1:A5)"');
      expect(serialized).toContain('"\'\talert(1)"');
    });
  });

  describe("2. Validasi Skema Berkas Cadangan (BackupFileSchema)", () => {
    it("menerima berkas cadangan JSON yang valid dan lengkap", () => {
      const validBackup = {
        app: "Kopdes Merah Putih Ladang Laweh",
        version: 1,
        exported_at: new Date().toISOString(),
        data: {
          organization_profile: [{ id: "550e8400-e29b-41d4-a716-446655440000", display_name: "Kopdes" }],
          business_units: [{ id: "550e8400-e29b-41d4-a716-446655440001", code: "GERAI-01", name: "Gerai Sembako" }],
          tasks: [{ id: "550e8400-e29b-41d4-a716-446655440002", title: "Cek beras", pic_name: "Halim" }],
          products: [{ id: "550e8400-e29b-41d4-a716-446655440003", sku: "BRS-01", name: "Beras" }],
          unit_daily_reports: [{ id: "550e8400-e29b-41d4-a716-446655440004", report_date: "2026-09-23" }],
          members: [{ id: "550e8400-e29b-41d4-a716-446655440005", member_number: "ANG-01", full_name: "Budi" }],
        },
      };

      const result = BackupFileSchema.safeParse(validBackup);
      expect(result.success).toBe(true);
    });

    it("menolak berkas cadangan dengan versi yang tidak didukung", () => {
      const invalidVersion = {
        app: "Kopdes Merah Putih Ladang Laweh",
        version: 2, // Hanya versi 1 yang didukung
        exported_at: new Date().toISOString(),
        data: {
          organization_profile: [],
          business_units: [],
          tasks: [],
          products: [],
          unit_daily_reports: [],
          members: [],
        },
      };

      const result = BackupFileSchema.safeParse(invalidVersion);
      expect(result.success).toBe(false);
    });

    it("menolak berkas cadangan tanpa objek data inti", () => {
      const noData = {
        app: "Kopdes Merah Putih Ladang Laweh",
        version: 1,
        exported_at: new Date().toISOString(),
      };

      const result = BackupFileSchema.safeParse(noData);
      expect(result.success).toBe(false);
    });
  });

  describe("3. Alur 'Jadikan Kendala sebagai Tugas'", () => {
    it("memvalidasi data tugas yang dibentuk dari catatan kendala rekap gerai", () => {
      const reportDate = "2026-09-23";
      const unitName = "Gerai Sembako Nagari";
      const note = "Pasokan telur retak dari distributor, perlu retur segera.";
      
      const generatedTaskPayload = {
        title: `[Kendala ${unitName}] ${note.slice(0, 35)}...`,
        description: `Dilaporkan pada rekap harian tanggal ${reportDate} untuk unit ${unitName}:\n\n"${note}"`,
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        pic_name: "Abdul Halim",
        due_date: getTomorrowWIB(),
        priority: "tinggi" as const,
        status: "belum_mulai" as const,
        notes: `Tugas otomatis dibuat dari rekap gerai tanggal ${reportDate}.`,
      };

      const parsed = TaskSchema.safeParse(generatedTaskPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.priority).toBe("tinggi");
        expect(parsed.data.title).toContain("[Kendala Gerai Sembako Nagari]");
        expect(parsed.data.pic_name).toBe("Abdul Halim");
      }
    });
  });

  describe("4. Dashboard Eksekutif — Fokus Hari Ini (Stok Menipis & Tugas Terlambat)", () => {
    it("menghitung lowStockCount dan memisahkan tugas terlambat vs jatuh tempo hari ini", async () => {
      const today = getTodayWIB();
      const yesterday = getDaysAgoWIB(1);

      const createChainable = (defaultResult: any) => {
        const chain: any = {
          eq: () => chain,
          neq: () => chain,
          gte: () => chain,
          lte: () => chain,
          in: () => chain,
          not: () => chain,
          order: () => chain,
          limit: () => chain,
          maybeSingle: async () => defaultResult,
          then: (resolve: any) => resolve(defaultResult),
        };
        return chain;
      };

      createClient.mockResolvedValue({
        from: (table: string) => ({
          select: (_cols?: string, opts?: { count?: string; head?: boolean }) => {
            if (table === "business_units") {
              if (opts?.head) return createChainable({ count: 1, error: null });
              return Promise.resolve({ data: [{ id: "u-1", name: "Gerai Sembako", status: "aktif" }], error: null });
            }
            if (table === "members") {
              return createChainable({ count: 50, error: null });
            }
            if (table === "products") {
              return createChainable({
                data: [
                  { id: "p-1", sku: "BRS-01", name: "Beras Medium", current_stock: 5, min_stock: 20, base_unit: "Kg" },
                  { id: "p-2", sku: "MYK-01", name: "Minyak Goreng", current_stock: 0, min_stock: 10, base_unit: "Liter" },
                  { id: "p-3", sku: "GLA-01", name: "Gula Pasir", current_stock: 50, min_stock: 10, base_unit: "Kg" },
                ],
                error: null,
              });
            }
            if (table === "tasks") {
              const chain: any = {
                eq: () => chain,
                neq: () => chain,
                in: () => chain,
                not: () => chain,
                lte: () => chain,
                order: () => chain,
                limit: () => chain,
                then: (resolve: any) => resolve({
                  count: 2,
                  data: [
                    { id: "t-1", title: "Tugas Terlambat", due_date: yesterday, priority: "tinggi", status: "sedang_proses", pic_name: "Halim" },
                    { id: "t-2", title: "Tugas Hari Ini", due_date: today, priority: "mendesak", status: "belum_mulai", pic_name: "Halim" },
                  ],
                  error: null,
                }),
              };
              return chain;
            }
            if (table === "unit_daily_reports") {
              return createChainable({ count: 1, data: [{ unit_id: "u-1" }], error: null });
            }
            if (table === "organization_profile") {
              return createChainable({ data: { business_status: "persiapan" }, error: null });
            }
            return createChainable({ data: [], error: null });
          },
        }),
      });

      const req = new Request("http://localhost:3000/api/dashboard/executive", {
        headers: { host: "localhost:3000" },
      });

      const res = await getExecutiveDashboard(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.lowStockCount).toBe(2);
      expect(json.lowStockItems).toHaveLength(2);
      expect(json.overdueTaskCount).toBe(1);
      expect(json.todayDueTaskCount).toBe(1);
      expect(json.overdueTaskList[0].title).toBe("Tugas Terlambat");
      expect(json.todayDueTaskList[0].title).toBe("Tugas Hari Ini");
    });
  });
});
