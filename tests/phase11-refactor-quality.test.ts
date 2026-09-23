import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { GET as getMembers, PATCH as patchMember, POST as postMember } from "@/app/api/members/route";
import { GET as getUnits } from "@/app/api/units/route";
import { NextRequest } from "next/server";

// Mock Supabase
const mockSupabaseData = {
  members: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      member_number: "KOP-00001",
      full_name: "Bapak Wali Nagari",
      phone: "081234567890",
      status: "aktif",
      join_date: "2026-09-01",
      notes: "Anggota perintis",
      created_at: "2026-09-01T00:00:00Z",
      is_archived: false,
    },
  ],
  units: [
    {
      id: "unit-001",
      code: "GU-01",
      name: "Gerai Sembako Jorong Barat",
      unit_type: "Sembako",
      status: "aktif",
      pic_name: "Abdul Halim",
      phone: "081234567899",
      location: "Ladang Laweh",
      monthly_target: 15000000,
      readiness_percentage: 95,
      operational_start_date: "2027-01-01",
      notes: "Siap beroperasi",
      created_at: "2026-09-01T00:00:00Z",
    },
  ],
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === "members") {
        return {
          select: (cols: string) => ({
            eq: (col: string, val: unknown) => {
              if (col === "id") {
                const found = mockSupabaseData.members.find((m) => m.id === val);
                return {
                  maybeSingle: async () => ({ data: found || null, error: null }),
                };
              }
              if (col === "is_archived") {
                return {
                  order: () => ({
                    eq: () => ({
                      data: mockSupabaseData.members,
                      error: null,
                    }),
                    or: () => ({
                      data: mockSupabaseData.members,
                      error: null,
                    }),
                    data: mockSupabaseData.members,
                    error: null,
                  }),
                };
              }
              return { maybeSingle: async () => ({ data: null, error: null }) };
            },
          }),
          update: (updates: Record<string, unknown>) => ({
            eq: (_col: string, id: string) => ({
              select: () => ({
                single: async () => {
                  const item = mockSupabaseData.members.find((m) => m.id === id);
                  return { data: { ...item, ...updates }, error: null };
                },
              }),
            }),
          }),
          insert: (item: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({ data: { id: "new-mem-id", ...item }, error: null }),
            }),
          }),
        };
      }

      if (table === "business_units") {
        return {
          select: () => ({
            eq: (col: string, val: unknown) => {
              if (col === "id") {
                const found = mockSupabaseData.units.find((u) => u.id === val);
                return {
                  maybeSingle: async () => ({ data: found || null, error: null }),
                };
              }
              return { maybeSingle: async () => ({ data: null, error: null }) };
            },
            order: () => ({
              data: mockSupabaseData.units,
              error: null,
            }),
          }),
        };
      }

      return {
        select: () => ({ error: null, data: [] }),
      };
    },
  })),
}));

describe("Tahap 6 — Kerapian Kode, Efisiensi, & Verifikasi Menyeluruh", () => {
  describe("1. Reduksi Ukuran File & Modularitas Halaman", () => {
    it("memastikan /monitoring telah dipecah menjadi modular dan ukurannya < 200 baris", () => {
      const filePath = path.resolve(process.cwd(), "src/app/monitoring/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThan(200);
      expect(content).toContain("MonitoringReportForm");
      expect(content).toContain("MonitoringHistoryTable");
      expect(content).toContain("MonitoringPeriodicSummary");
      expect(content).toContain("MonitoringTaskModal");
    });

    it("memastikan /pekerjaan telah dipecah menjadi modular dan ukurannya < 500 baris", () => {
      const filePath = path.resolve(process.cwd(), "src/app/pekerjaan/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThan(500);
      expect(content).toContain("TaskList");
      expect(content).toContain("TaskFormModal");
      expect(content).toContain("TaskCalendarView");
    });

    it("memastikan /anggota telah dipecah menjadi modular dan ukurannya < 400 baris", () => {
      const filePath = path.resolve(process.cwd(), "src/app/anggota/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThan(400);
      expect(content).toContain("MemberAddModal");
      expect(content).toContain("MemberImportModal");
    });

    it("memastikan /stok telah dipecah dan ukurannya < 50 baris", () => {
      const filePath = path.resolve(process.cwd(), "src/app/stok/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThan(50);
      expect(content).toContain("ProductionStockPage");
    });
  });

  describe("2. Integrasi Riil Sub-Halaman Detail", () => {
    it("memastikan /anggota/[id] tidak lagi menggunakan preparationRepository dan tersambung ke /api/members", () => {
      const filePath = path.resolve(process.cwd(), "src/app/anggota/[id]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).not.toContain("preparationRepository");
      expect(content).toContain("/api/members?id=");
      expect(content).toContain("MemberRecord");
    });

    it("memastikan /unit-usaha/[id] tidak lagi menggunakan preparationRepository dan tersambung ke /api/units", () => {
      const filePath = path.resolve(process.cwd(), "src/app/unit-usaha/[id]/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).not.toContain("preparationRepository");
      expect(content).toContain("/api/units?id=");
      expect(content).toContain("BusinessUnit");
    });
  });

  describe("3. Pengujian Endpoint API Riil", () => {
    it("GET /api/members?id=550e8400-e29b-41d4-a716-446655440001 mengembalikan 1 anggota spesifik", async () => {
      const req = new NextRequest("http://127.0.0.1:3000/api/members?id=550e8400-e29b-41d4-a716-446655440001", {
        headers: { host: "127.0.0.1:3000" },
      });
      const res = await getMembers(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.member).toBeDefined();
      expect(data.member.full_name).toBe("Bapak Wali Nagari");
    });

    it("GET /api/members?id=unknown mengembalikan 404 Not Found", async () => {
      const req = new NextRequest("http://127.0.0.1:3000/api/members?id=unknown", {
        headers: { host: "127.0.0.1:3000" },
      });
      const res = await getMembers(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain("tidak ditemukan");
    });

    it("PATCH /api/members mendukung pengarsipan anggota (is_archived: true)", async () => {
      const req = new NextRequest("http://127.0.0.1:3000/api/members", {
        method: "PATCH",
        headers: { host: "127.0.0.1:3000", "content-type": "application/json" },
        body: JSON.stringify({ id: "550e8400-e29b-41d4-a716-446655440001", is_archived: true }),
      });
      const res = await patchMember(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.member.is_archived).toBe(true);
    });

    it("GET /api/units?id=unit-001 mengembalikan 1 unit spesifik", async () => {
      const req = new NextRequest("http://127.0.0.1:3000/api/units?id=unit-001", {
        headers: { host: "127.0.0.1:3000" },
      });
      const res = await getUnits(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.unit).toBeDefined();
      expect(data.unit.code).toBe("GU-01");
      expect(data.unit.name).toBe("Gerai Sembako Jorong Barat");
    });

    it("GET /api/units?id=unknown mengembalikan 404 Not Found", async () => {
      const req = new NextRequest("http://127.0.0.1:3000/api/units?id=unknown", {
        headers: { host: "127.0.0.1:3000" },
      });
      const res = await getUnits(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain("tidak ditemukan");
    });
  });
});
