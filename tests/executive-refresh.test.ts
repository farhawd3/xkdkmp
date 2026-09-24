// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
import { GET } from "@/app/api/dashboard/executive/route";
import { getTodayWIB } from "@/lib/utils";

describe("API dashboard — batas tanggal dan galat", () => {
  beforeEach(() => vi.clearAllMocks());
  function mockDatabase(profileError = false) {
    const bounds: string[][] = [];
    createClient.mockResolvedValue({ from: (table: string) => ({ select: (columns: string) => {
      const result = { count: 0, data: table === "organization_profile" ? null : [], error: profileError && table === "organization_profile" ? { message: "Profil gagal dimuat" } : null };
      const chain: Record<string, unknown> = {};
      for (const method of ["eq", "neq", "gte", "lte", "in", "not", "order", "limit"]) chain[method] = (...args: string[]) => { if (method === "lte") bounds.push([table, columns, ...args]); return chain; };
      chain.maybeSingle = async () => result;
      chain.then = (resolve: (value: typeof result) => void) => resolve(result);
      return chain;
    } }) });
    return bounds;
  }
  it("tidak menyamarkan kegagalan profil", async () => {
    mockDatabase(true);
    const response = await GET(new Request("http://localhost:3000/api/dashboard/executive"));
    expect(response.status).toBe(500);
  });
  it("membatasi bulan sampai hari ini WIB dan menyertakan waktu pembacaan", async () => {
    const bounds = mockDatabase();
    const response = await GET(new Request("http://localhost:3000/api/dashboard/executive"));
    expect(response.status).toBe(200);
    expect(bounds).toContainEqual(["unit_daily_reports", "gross_revenue, operational_expenses, net_profit", "report_date", getTodayWIB()]);
    expect(await response.json()).toMatchObject({ businessDate: getTodayWIB(), activeReportedUnits: 0, reportingTrend: expect.arrayContaining([expect.objectContaining({ total: 0, percent: null })]) });
  });
});
