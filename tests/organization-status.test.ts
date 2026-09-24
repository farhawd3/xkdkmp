import { describe, expect, it } from "vitest";
import { businessStatusLabel } from "@/lib/organization-status";

describe("Status organisasi dari Pengaturan", () => {
  it("membedakan keempat status di banner dan sidebar", () => {
    expect(businessStatusLabel("persiapan")).toBe("Mode Persiapan");
    expect(businessStatusLabel("siap_buka")).toBe("Siap Buka Fisik");
    expect(businessStatusLabel("aktif")).toBe("Operasional Aktif");
    expect(businessStatusLabel("ditutup_sementara")).toBe("Ditutup Sementara");
  });
});
