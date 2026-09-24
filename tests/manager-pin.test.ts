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
});
