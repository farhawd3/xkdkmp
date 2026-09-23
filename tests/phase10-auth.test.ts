import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { sanitizeRedirectUrl } from "@/lib/supabase/middleware";
import { sanitizeAuthError, withAuthTimeout } from "@/lib/auth/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENT_USER } from "@/lib/constants";
import { PERSONAL_MANAGER_USER } from "@/lib/auth/session";
import {
  isPrivateIp,
  isLoopbackHost,
  isSameOriginMutation,
  verifyPrivateAccess,
  verifyPrivateApiAccess,
} from "@/lib/security/private-access";
import { NextRequest } from "next/server";

describe("Tahap 10 — Keamanan Autentikasi & Pencegahan Open Redirect", () => {
  it("memvalidasi dan mengizinkan path relatif lokal yang sah", () => {
    expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/stok")).toBe("/stok");
    expect(sanitizeRedirectUrl("/keuangan?tab=jurnal")).toBe("/keuangan?tab=jurnal");
    expect(sanitizeRedirectUrl("/persiapan/checklist")).toBe("/persiapan/checklist");
  });

  it("menolak URL eksternal berbahaya dan mengembalikan URL default /dashboard", () => {
    expect(sanitizeRedirectUrl("https://evil.com/phishing")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("http://phishing-site.xyz")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("//attacker.com/malicious")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/\\attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript:alert(document.cookie)")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
  });

  it("mengembalikan defaultUrl kustom jika target pengalihan kosong atau tidak valid", () => {
    expect(sanitizeRedirectUrl(null, "/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl(undefined, "/anggota")).toBe("/anggota");
    expect(sanitizeRedirectUrl("", "/persiapan")).toBe("/persiapan");
  });
});

describe("Tahap 10 — Sanitasi Pesan Galat & Pencegahan Enumerasi Akun", () => {
  it("menyamarkan kesalahan kredensial agar tidak membocorkan keberadaan email di sistem", () => {
    const error1 = sanitizeAuthError("Invalid login credentials");
    const error2 = sanitizeAuthError("User not found");
    const error3 = sanitizeAuthError("Email not found");
    const error4 = sanitizeAuthError("invalid email or password");

    // Seluruh galat harus menghasilkan pesan generik yang identik
    expect(error1).toBe("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
    expect(error2).toBe("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
    expect(error3).toBe("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
    expect(error4).toBe("Email atau kata sandi tidak sesuai. Silakan periksa kembali.");
  });

  it("menyampaikan pesan batas frekuensi secara tepat saat rate limit terpicu", () => {
    const rateLimitError = sanitizeAuthError("rate limit exceeded: too many requests");
    expect(rateLimitError).toContain("Terlalu banyak percobaan masuk");
  });

  it("tidak menyebut kata sandi salah untuk galat layanan yang tidak dikenal", () => {
    expect(sanitizeAuthError("Not Found")).toBe(
      "Login belum berhasil. Periksa koneksi Supabase dan coba kembali."
    );
  });

  it("menghentikan verifikasi yang tidak pernah selesai", async () => {
    await expect(withAuthTimeout(new Promise<never>(() => {}), 1)).rejects.toThrow("AUTH_TIMEOUT");
  });
});

describe("Tahap 10 — Integritas Kebijakan Akses Database & Klien Administrasi", () => {
  const schemaFile = path.resolve(
    process.cwd(),
    "supabase/migrations/20260923000007_clean_simple_schema.sql"
  );

  it("memastikan berkas migrasi skema bersih Supabase tersedia", () => {
    expect(fs.existsSync(schemaFile)).toBe(true);
    const sql = fs.readFileSync(schemaFile, "utf-8");
    expect(sql.length).toBeGreaterThan(500);
  });

  it("memvalidasi kebijakan RLS terproteksi dan pembagian hak akses terautentikasi", () => {
    const sql = fs.readFileSync(schemaFile, "utf-8");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("CREATE POLICY \"Izin baca gerai authenticated\"");
    expect(sql).toContain("CREATE POLICY \"Izin kelola rekap gerai authenticated\"");
    expect(sql).toContain("CREATE POLICY \"Izin baca tugas authenticated\"");
    expect(sql).toContain("GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_units TO authenticated, service_role");
  });

  it("createAdminClient menolak dijalankan di lingkungan browser/klien", () => {
    // Karena Vitest berjalan dengan jsdom, window terdefinisi dan wajib ditolak
    expect(() => createAdminClient()).toThrow(/createAdminClient dilarang dijalankan di lingkungan peramban/);
  });

  it("createAdminClient di server menolak dijalankan jika Service Role Key tidak tersedia", () => {
    const originalWindow = global.window;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    try {
      // @ts-expect-error simulasikan server murni tanpa window
      delete global.window;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      expect(() => createAdminClient()).toThrow(/Kredensial administrasi Supabase belum lengkap/);
    } finally {
      global.window = originalWindow;
      if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    }
  });
});

describe("Tahap 1 — Batas Akses Privat & Keamanan Aplikasi Pribadi Manajer", () => {
  it("memvalidasi deteksi alamat IP privat dan loopback", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("localhost")).toBe(true);
    expect(isPrivateIp("192.168.1.50")).toBe(true);
    expect(isPrivateIp("10.0.0.15")).toBe(true);
    expect(isPrivateIp("172.20.5.1")).toBe(true);

    // IP publik
    expect(isPrivateIp("8.8.8.8")).toBe(false);
    expect(isPrivateIp("103.25.10.1")).toBe(false);
    expect(isPrivateIp(null)).toBe(false);
  });

  it("memvalidasi deteksi hostname loopback komputer lokal", () => {
    expect(isLoopbackHost("localhost")).toBe(true);
    expect(isLoopbackHost("localhost:3000")).toBe(true);
    expect(isLoopbackHost("127.0.0.1:3000")).toBe(true);
    expect(isLoopbackHost("kopdes-ladanglaweh.vercel.app")).toBe(false);
    expect(isLoopbackHost("koperasi.id")).toBe(false);
  });

  it("mengizinkan akses lokal langsung tanpa login untuk loopback", () => {
    const req = new NextRequest("http://localhost:3000/dashboard");
    const result = verifyPrivateAccess(req);
    expect(result.allowed).toBe(true);
  });

  it("menolak akses publik jika kunci akses privat belum dikonfigurasi", () => {
    const originalKey = process.env.KOPDES_PRIVATE_ACCESS_KEY;
    try {
      delete process.env.KOPDES_PRIVATE_ACCESS_KEY;
      const req = new NextRequest("https://kopdes.nagari.id/dashboard", {
        headers: { host: "kopdes.nagari.id" },
      });
      const result = verifyPrivateAccess(req);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(403);
      expect(result.reason).toContain("Aplikasi pribadi ini belum dikonfigurasi");
    } finally {
      if (originalKey) process.env.KOPDES_PRIVATE_ACCESS_KEY = originalKey;
    }
  });

  it("mengizinkan akses publik saat kunci privat valid disertakan pada header", () => {
    const originalKey = process.env.KOPDES_PRIVATE_ACCESS_KEY;
    try {
      process.env.KOPDES_PRIVATE_ACCESS_KEY = "kunci-rahasia-manajer-123";
      const req = new NextRequest("https://kopdes.nagari.id/dashboard", {
        headers: {
          host: "kopdes.nagari.id",
          "x-kopdes-access-key": "kunci-rahasia-manajer-123",
        },
      });
      const result = verifyPrivateAccess(req);
      expect(result.allowed).toBe(true);
    } finally {
      if (originalKey) process.env.KOPDES_PRIVATE_ACCESS_KEY = originalKey;
      else delete process.env.KOPDES_PRIVATE_ACCESS_KEY;
    }
  });

  it("menolak mutasi lintas origin (anti-CSRF) pada endpoint API", () => {
    const req = new Request("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "https://evil-attacker.com",
      },
    });
    expect(isSameOriginMutation(req)).toBe(false);
    const result = verifyPrivateApiAccess(req);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("CSRF");
  });

  it("memastikan profil manajer Abdul Halim terdefinisi untuk aplikasi pribadi", () => {
    expect(PERSONAL_MANAGER_USER.fullName).toBe("Abdul Halim");
    expect(PERSONAL_MANAGER_USER.roles).toContain("manajer");
    expect(CURRENT_USER.name).toBe("Abdul Halim");
    expect(CURRENT_USER.role).toBe("manajer");
  });
});
