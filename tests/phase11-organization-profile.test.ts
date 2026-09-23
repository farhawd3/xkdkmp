// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET, PATCH } from "@/app/api/organization/profile/route";
import { OrganizationProfileUpdateSchema } from "@/lib/validations/simple-schemas";

describe("Tahap 3 — Profil Koperasi & Kustomisasi Kelembagaan Permanen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Validasi Zod Schema (OrganizationProfileUpdateSchema)", () => {
    it("menerima payload profil yang valid", () => {
      const validData = {
        display_name: "Kopdes Merah Putih — Ladang Laweh",
        legal_name: "Koperasi Konsumen Ladang Laweh Mandiri",
        business_status: "persiapan",
        manager_name: "Abdul Halim",
        manager_title: "Manajer Koperasi",
        region: "Nagari Ladang Laweh, Kec. Banuhampu, Agam",
        full_address: "Simpang Tiga Ladang Laweh, Kec. Banuhampu, Kab. Agam",
        fiscal_year: "2026/2027",
        operational_target_date: "2027-01-01",
        phone: "081234567890",
        email: "ladanglaweh@kopdes.id",
        bank_name: "Bank Nagari",
        bank_account_number: "1234567890",
        bank_account_holder: "Koperasi Ladang Laweh",
        notes: "Target operasional penuh awal 2027",
      };

      const result = OrganizationProfileUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.display_name).toBe("Kopdes Merah Putih — Ladang Laweh");
        expect(result.data.business_status).toBe("persiapan");
      }
    });

    it("menolak jika display_name kurang dari 3 karakter", () => {
      const invalidData = {
        display_name: "Ko",
        manager_name: "Abdul Halim",
        region: "Nagari Ladang Laweh",
      };
      const result = OrganizationProfileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 3 karakter");
      }
    });

    it("menolak jika manager_name kosong atau kurang dari 2 karakter", () => {
      const invalidData = {
        display_name: "Koperasi Ladang Laweh",
        manager_name: "A",
        region: "Nagari Ladang Laweh",
      };
      const result = OrganizationProfileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 2 karakter");
      }
    });

    it("menolak status bisnis yang tidak dikenali", () => {
      const invalidData = {
        display_name: "Koperasi Ladang Laweh",
        manager_name: "Abdul Halim",
        region: "Nagari Ladang Laweh",
        business_status: "status_palsu",
      };
      const result = OrganizationProfileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("menolak format email yang tidak valid jika diisi", () => {
      const invalidData = {
        display_name: "Koperasi Ladang Laweh",
        manager_name: "Abdul Halim",
        region: "Nagari Ladang Laweh",
        email: "bukan-email-valid",
      };
      const result = OrganizationProfileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("mengizinkan email berupa string kosong atau null", () => {
      const dataWithEmptyEmail = {
        display_name: "Koperasi Ladang Laweh",
        manager_name: "Abdul Halim",
        region: "Nagari Ladang Laweh",
        email: "",
      };
      const result = OrganizationProfileUpdateSchema.safeParse(dataWithEmptyEmail);
      expect(result.success).toBe(true);
    });
  });

  describe("2. Endpoint GET /api/organization/profile", () => {
    it("menolak akses dari domain publik luar tanpa header/token privat", async () => {
      const req = new Request("https://website-publik.com/api/organization/profile", {
        headers: { host: "website-publik.com" },
      });
      const res = await GET(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it("mengembalikan status 500 jika pembacaan Supabase mengalami kegagalan", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: null,
                error: { message: "Database connection failed" },
              }),
            }),
          }),
        }),
      });

      const res = await GET(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("Gagal membaca profil organisasi");
    });

    it("mengembalikan default profile jika tabel database masih kosong (data = null)", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        headers: { host: "localhost:3000" },
      });

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.profile).toBeDefined();
      expect(json.profile.display_name).toBe("Kopdes Merah Putih — Ladang Laweh");
      expect(json.profile.manager_name).toBe("Abdul Halim");
      expect(json.profile.business_status).toBe("persiapan");
    });

    it("mengembalikan data profil tersimpan dari database Supabase", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        headers: { host: "localhost:3000" },
      });

      const dbProfile = {
        id: "prof-123",
        display_name: "Koperasi Konsumen Ladang Laweh Sejahtera",
        manager_name: "Abdul Halim",
        manager_title: "General Manager",
        region: "Ladang Laweh, Agam",
        business_status: "siap_buka",
        bank_name: "Bank Nagari Syariah",
        bank_account_number: "9876543210",
      };

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: dbProfile,
                error: null,
              }),
            }),
          }),
        }),
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.profile.id).toBe("prof-123");
      expect(json.profile.display_name).toBe("Koperasi Konsumen Ladang Laweh Sejahtera");
      expect(json.profile.business_status).toBe("siap_buka");
    });
  });

  describe("3. Endpoint PATCH /api/organization/profile", () => {
    it("menolak akses publik luar pada PATCH", async () => {
      const req = new Request("https://website-publik.com/api/organization/profile", {
        method: "PATCH",
        headers: { host: "website-publik.com" },
        body: JSON.stringify({ display_name: "Uji Coba" }),
      });
      const res = await PATCH(req);
      expect(res.status).toBe(403);
    });

    it("mengembalikan status 400 jika payload tidak valid (display_name terlalu pendek)", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        method: "PATCH",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({
          display_name: "A",
          manager_name: "Abdul Halim",
          region: "Ladang Laweh",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("minimal 3 karakter");
    });

    it("mengembalikan status 500 jika query pemeriksaan Supabase mengalami error", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        method: "PATCH",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({
          display_name: "Koperasi Ladang Laweh",
          manager_name: "Abdul Halim",
          region: "Nagari Ladang Laweh",
        }),
      });

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: null,
                error: { message: "Query timeout" },
              }),
            }),
          }),
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("Gagal memeriksa profil organisasi");
    });

    it("melakukan INSERT baru jika tabel belum memiliki profil tersimpan", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        method: "PATCH",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({
          display_name: "Koperasi Ladang Laweh Baru",
          manager_name: "Abdul Halim",
          region: "Nagari Ladang Laweh, Kec. Banuhampu",
          business_status: "persiapan",
        }),
      });

      let insertCalledWith: unknown = null;

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: null, // belum ada record
                error: null,
              }),
            }),
          }),
          insert: (payload: unknown) => {
            insertCalledWith = payload;
            return {
              select: () => ({
                single: async () => ({
                  data: { id: "new-profile-id", ...(payload as object) },
                  error: null,
                }),
              }),
            };
          },
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profile.id).toBe("new-profile-id");
      expect(json.profile.display_name).toBe("Koperasi Ladang Laweh Baru");
      expect(insertCalledWith).toBeDefined();
    });

    it("melakukan UPDATE jika profil sudah ada di database", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        method: "PATCH",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({
          display_name: "Koperasi Ladang Laweh Terkini",
          manager_name: "Abdul Halim",
          region: "Nagari Ladang Laweh, Kec. Banuhampu",
          business_status: "siap_buka",
        }),
      });

      let updateCalledWith: unknown = null;
      let eqCalledWith: unknown = null;

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: { id: "existing-profile-id" },
                error: null,
              }),
            }),
          }),
          update: (payload: unknown) => {
            updateCalledWith = payload;
            return {
              eq: (col: string, val: unknown) => {
                eqCalledWith = { col, val };
                return {
                  select: () => ({
                    single: async () => ({
                      data: { id: val, ...(payload as object) },
                      error: null,
                    }),
                  }),
                };
              },
            };
          },
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.profile.display_name).toBe("Koperasi Ladang Laweh Terkini");
      expect(updateCalledWith).toBeDefined();
      expect(eqCalledWith).toEqual({ col: "id", val: "existing-profile-id" });
    });

    it("mengembalikan status 500 jika operasi update Supabase error", async () => {
      const req = new Request("http://localhost:3000/api/organization/profile", {
        method: "PATCH",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({
          display_name: "Koperasi Ladang Laweh Terkini",
          manager_name: "Abdul Halim",
          region: "Nagari Ladang Laweh",
        }),
      });

      createClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({
                data: { id: "existing-profile-id" },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: { message: "Permission denied on update" },
                }),
              }),
            }),
          }),
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("Gagal menyimpan profil organisasi ke Supabase");
    });
  });
});
