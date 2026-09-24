// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET as getRegister } from "@/app/api/finance/register/route";
import { POST as postReport } from "@/app/api/monitoring/records/route";

beforeEach(() => vi.clearAllMocks());

describe("Buku rekap operasional", () => {
  it("menolak bulan tidak valid sebelum menghubungi database", async () => {
    const response = await getRegister(new Request("http://localhost:3000/api/finance/register?month=2026-13"));
    expect(response.status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("membaca satu halaman rekap nyata tanpa menyebutnya buku besar", async () => {
    const query = {
      gte: vi.fn().mockReturnThis(), lt: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ count: 1, error: null, data: [{ id: "r1", report_date: "2026-09-24", gross_revenue: "150000.00", operational_expenses: "50000.00", cash_in_hand: "0.00", source_type: "manual", business_units: { name: "Gerai Sembako", code: "GS" } }] }),
    };
    createClient.mockResolvedValue({ from: () => ({ select: () => query }) });
    const response = await getRegister(new Request("http://localhost:3000/api/finance/register?month=2026-09&page=1"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ month: "2026-09", total: 1, rows: [{ unitName: "Gerai Sembako", grossRevenue: 150000, operationalExpenses: 50000, reportedCash: 0 }] });
    expect(query.range).toHaveBeenCalledWith(0, 24);
  });

  it("form manual menolak label sumber API palsu", async () => {
    const response = await postReport(new Request("http://localhost:3000/api/monitoring/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unit_id: "11111111-1111-4111-8111-111111111111", report_date: "2026-09-24", gross_revenue: "100.00", operational_expenses: "10.00", cash_in_hand: "0.00", source_type: "api" }) }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("belum aktif");
    expect(createClient).not.toHaveBeenCalled();
  });
});
