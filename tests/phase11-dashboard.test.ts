// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, createClient } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET } from "@/app/api/dashboard/summary/route";

describe("Tahap 11 — ringkasan database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak akun tanpa sesi atau tanpa peran", async () => {
    getCurrentUser.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
    getCurrentUser.mockResolvedValueOnce({ roles: [] });
    expect((await GET()).status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("mengembalikan galat saat tabel Supabase gagal, tanpa angka contoh", async () => {
    getCurrentUser.mockResolvedValue({ roles: ["admin"] });
    createClient.mockResolvedValue({
      from: (table: string) => ({
        select: () => table === "organization_profile"
          ? { limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }
          : table === "purchase_orders"
            ? Promise.resolve({ count: null, error: { message: "permission denied" } })
            : { eq: async () => ({ count: 0, error: null }) },
      }),
    });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("members");
  });

  it("mengembalikan jumlah dari query database, bukan data sesi lokal", async () => {
    getCurrentUser.mockResolvedValue({ roles: ["admin"] });
    const counts: Record<string, number> = { members: 2, products: 3, purchase_orders: 1 };
    createClient.mockResolvedValue({
      from: (table: string) => ({
        select: () => table === "organization_profile"
          ? { limit: () => ({ maybeSingle: async () => ({ data: { business_status: "persiapan" }, error: null }) }) }
          : table === "purchase_orders"
            ? Promise.resolve({ count: counts[table], error: null })
            : { eq: async () => ({ count: counts[table], error: null }) },
      }),
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      members: 2, products: 3, purchaseOrders: 1, businessStatus: "persiapan",
    });
  });
});
