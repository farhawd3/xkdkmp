// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET } from "@/app/api/dashboard/summary/route";

describe("Tahap 11 — ringkasan database", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak akses di luar batas privat publik tanpa konfigurasi", async () => {
    const externalReq = new Request("https://public-unknown.org/api/dashboard/summary", {
      headers: { host: "public-unknown.org" },
    });
    const res = await GET(externalReq);
    expect(res.status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("mengembalikan galat saat tabel Supabase gagal, tanpa angka contoh", async () => {
    const localReq = new Request("http://localhost:3000/api/dashboard/summary", {
      headers: { host: "localhost:3000" },
    });
    createClient.mockResolvedValue({
      from: (table: string) => ({
        select: () => table === "organization_profile"
          ? { limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }
          : table === "tasks"
            ? Promise.resolve({ count: null, error: { message: "permission denied" } })
            : { eq: async () => ({ count: 0, error: null }) },
      }),
    });
    const response = await GET(localReq);
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("members");
  });

  it("mengembalikan jumlah dari query database, bukan data sesi lokal", async () => {
    const localReq = new Request("http://localhost:3000/api/dashboard/summary", {
      headers: { host: "localhost:3000" },
    });
    const counts: Record<string, number> = { members: 2, products: 3, tasks: 5 };
    createClient.mockResolvedValue({
      from: (table: string) => ({
        select: () => table === "organization_profile"
          ? { limit: () => ({ maybeSingle: async () => ({ data: { business_status: "persiapan" }, error: null }) }) }
          : table === "tasks"
            ? Promise.resolve({ count: counts[table], error: null })
            : { eq: async () => ({ count: counts[table], error: null }) },
      }),
    });
    const response = await GET(localReq);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      members: 2, products: 3, tasks: 5, businessStatus: "persiapan",
    });
  });
});
