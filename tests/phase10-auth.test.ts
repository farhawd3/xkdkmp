import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { sanitizeRedirectUrl } from "@/lib/supabase/middleware";
import { sanitizeAuthError, withAuthTimeout } from "@/lib/auth/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENT_USER } from "@/lib/constants";

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
    expect(sanitizeRedirectUrl(null, "/login")).toBe("/login");
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

describe("Tahap 10 — Perlindungan Identitas Belum Login", () => {
  it("memastikan nilai default CURRENT_USER tidak mengekspos nama Abdul Halim sebelum login", () => {
    expect(CURRENT_USER.name).not.toBe("Abdul Halim");
    expect(CURRENT_USER.name).toBe("Tamu Sistem");
    expect(CURRENT_USER.role).toBe("anggota");
  });

  it("jalur login tamu tidak tersedia dan middleware mengabaikan cookie pratinjau lama", () => {
    const root = process.cwd();
    expect(fs.existsSync(path.resolve(root, "src/app/auth/preview/route.ts"))).toBe(false);
    const middleware = fs.readFileSync(path.resolve(root, "src/lib/supabase/middleware.ts"), "utf8");
    const login = fs.readFileSync(path.resolve(root, "src/app/login/page.tsx"), "utf8");
    expect(middleware).not.toContain("kopdes_preview_mode");
    expect(login).not.toContain("/auth/preview");
  });
});

