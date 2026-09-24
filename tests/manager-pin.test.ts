import { describe, it, expect, vi } from "vitest";
import {
  DEFAULT_PIN,
  DEFAULT_RECOVERY_PHONE,
  PIN_COOKIE_NAME,
  generateSessionToken,
  buildWhatsAppResetUrl,
} from "@/lib/security/pin-service";

describe("Keamanan PIN Manajer & Integrasi WhatsApp", () => {
  it("memiliki konstanta default PIN dan nomor pemulihan yang tepat", () => {
    expect(DEFAULT_PIN).toBe("1234");
    expect(DEFAULT_RECOVERY_PHONE).toBe("081267890123");
    expect(PIN_COOKIE_NAME).toBe("kopdes_pin_session");
  });

  it("menghasilkan token sesi privat yang konsisten dan terproteksi salt", () => {
    const token1 = generateSessionToken("1234");
    const token2 = generateSessionToken("1234");
    const tokenDiff = generateSessionToken("9999");

    expect(token1).toMatch(/^kpd_[a-z0-9]+$/);
    expect(token1).toBe(token2);
    expect(token1).not.toBe(tokenDiff);
  });

  it("memformat nomor WhatsApp ke standar internasional Indonesia (62)", () => {
    // Format awalan 08...
    const url1 = buildWhatsAppResetUrl("081234567890");
    expect(url1).toContain("https://wa.me/6281234567890");

    // Format dengan spasi atau tanda sambung
    const url2 = buildWhatsAppResetUrl("0812-3456-7890");
    expect(url2).toContain("https://wa.me/6281234567890");

    // Format yang sudah berawalan 62...
    const url3 = buildWhatsAppResetUrl("6281234567890");
    expect(url3).toContain("https://wa.me/6281234567890");
  });

  it("menyusun pesan permohonan reset PIN yang sopan dan resmi", () => {
    const url = buildWhatsAppResetUrl("081267890123");
    const decodedUrl = decodeURIComponent(url);

    expect(decodedUrl).toContain("Kopdes Merah Putih Ladang Laweh");
    expect(decodedUrl).toContain("Abdul Halim");
    expect(decodedUrl).toContain("reset PIN akses aplikasi Kopdes");
  });

  it("mengizinkan akses API jika cookie sesi PIN disertakan tanpa KOPDES_PRIVATE_ACCESS_KEY", async () => {
    const { verifyPrivateApiAccess } = await import("@/lib/security/private-access");
    const originalEnv = process.env.KOPDES_PRIVATE_ACCESS_KEY;
    const originalVercel = process.env.VERCEL;

    try {
      delete process.env.KOPDES_PRIVATE_ACCESS_KEY;
      process.env.VERCEL = "1"; // Simulasikan environment Vercel cloud

      // 1. Request tanpa cookie PIN -> ditolak
      const reqNoPin = new Request("https://kopdes.vercel.app/api/dashboard/executive", {
        headers: { host: "kopdes.vercel.app" },
      });
      const resNoPin = verifyPrivateApiAccess(reqNoPin);
      expect(resNoPin.allowed).toBe(false);

      // 2. Request DENGAN cookie PIN -> diizinkan langsung!
      const reqWithPin = new Request("https://kopdes.vercel.app/api/dashboard/executive", {
        headers: {
          host: "kopdes.vercel.app",
          cookie: `${PIN_COOKIE_NAME}=kpd_valid123; other=abc`,
        },
      });
      const resWithPin = verifyPrivateApiAccess(reqWithPin);
      expect(resWithPin.allowed).toBe(true);
    } finally {
      if (originalEnv) process.env.KOPDES_PRIVATE_ACCESS_KEY = originalEnv;
      else delete process.env.KOPDES_PRIVATE_ACCESS_KEY;

      if (originalVercel) process.env.VERCEL = originalVercel;
      else delete process.env.VERCEL;
    }
  });
});
