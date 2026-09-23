import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { preparationRepository } from "@/lib/repository";
import { CardMetric } from "@/components/ui/Card";

describe("Tahap 08B — Verifikasi Logika & Komponen Kunci", () => {
  describe("Keanggotaan & Repositori Persiapan", () => {
    it("getMemberSummary menghitung calon dan verified (aktif + terverifikasi) secara akurat", async () => {
      // Daftarkan calon anggota uji
      await preparationRepository.addMember({
        fullName: "Warga Uji Calon",
        maskedNik: "1306**********11",
        phone: "081211112222",
        domicile: "Jorong Ladang Laweh Barat",
        status: "calon",
        simpananPokokPaid: false,
        simpananWajibPaid: false,
        simpananPokokAmount: 0,
        simpananWajibAmount: 0,
        documentStatus: "belum_unggah",
      });

      // Daftarkan anggota aktif uji
      await preparationRepository.addMember({
        fullName: "Warga Uji Aktif",
        maskedNik: "1306**********12",
        phone: "081211113333",
        domicile: "Jorong Pincuran Tujuah",
        status: "aktif",
        simpananPokokPaid: true,
        simpananWajibPaid: true,
        simpananPokokAmount: 100000,
        simpananWajibAmount: 20000,
        documentStatus: "terverifikasi",
      });

      const summary = await preparationRepository.getMemberSummary();
      expect(summary.total).toBeGreaterThanOrEqual(2);
      expect(summary.calon).toBeGreaterThanOrEqual(1);
      expect(summary.verified).toBeGreaterThanOrEqual(1);
      expect(summary.calon + summary.verified).toBeLessThanOrEqual(summary.total);
    });

    it("filter status 'verified' pada getMembers mengembalikan anggota dengan status 'terverifikasi' dan 'aktif'", async () => {
      const result = await preparationRepository.getMembers(undefined, "verified", 1, 50);
      result.members.forEach((m) => {
        expect(["terverifikasi", "aktif"]).toContain(m.status);
      });
    });

    it("importMembers memproses NIK valid dan menolak NIK tidak valid / format salah", async () => {
      const testImportRows = [
        {
          fullName: "Warga Uji Coba 1",
          phone: "081299998888",
          domicile: "Jorong Ladang Laweh Barat",
          nik: "1306010101900002",
        },
        {
          fullName: "Warga Tanpa NIK",
          phone: "081277776666",
          domicile: "Jorong Pincuran Tujuah",
        },
        {
          fullName: "Warga NIK Salah Format",
          phone: "081255554444",
          domicile: "Jorong Ladang Laweh Timur",
          nik: "130601", // Bukan 16 digit
        },
      ];

      const res = await preparationRepository.importMembers(testImportRows);
      expect(res.importedCount).toBe(2);
      expect(res.errors).toHaveLength(1);
      expect(res.errors[0].row).toBe(3);
      expect(res.errors[0].error).toContain("16 angka");

      // Cek anggota yang diimpor
      const searchRes = await preparationRepository.getMembers("Warga Uji Coba 1");
      expect(searchRes.members.length).toBeGreaterThan(0);
      const importedMember = searchRes.members[0];
      expect(importedMember.status).toBe("calon");
      expect(importedMember.simpananPokokPaid).toBe(false);
      expect(importedMember.maskedNik).toBe("1306**********02");
    });
  });

  describe("Integritas Master Produk & Stok", () => {
    it("updateProduct tidak mengizinkan manipulasi stok fisik (currentStock terlindungi)", async () => {
      const products = await preparationRepository.getProducts();
      expect(products.length).toBeGreaterThan(0);
      const targetProduct = products[0];
      const initialStock = targetProduct.currentStock;

      // Coba update nama produk sekaligus mencoba mengubah currentStock secara ilegal
      const updated = await preparationRepository.updateProduct(targetProduct.id, {
        name: `${targetProduct.name} (Revisi)`,
        currentStock: initialStock + 999, // Seharusnya diabaikan
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe(`${targetProduct.name} (Revisi)`);
      expect(updated?.currentStock).toBe(initialStock);

      // Verifikasi ulang dari fetch repository
      const freshProducts = await preparationRepository.getProducts();
      const freshProduct = freshProducts.find((p) => p.id === targetProduct.id);
      expect(freshProduct?.currentStock).toBe(initialStock);
    });
  });

  describe("Master Mitra Pemasok", () => {
    it("dapat menambah, memperbarui, dan mengarsipkan pemasok", async () => {
      const newSup = await preparationRepository.addSupplier({
        code: "SUP-TEST-01",
        name: "Distributor Beras Uji Coba",
        contactPerson: "Pak Haji Uji",
        phone: "081200001111",
        address: "Ladang Laweh",
        suppliedCategory: "Beras",
      });

      expect(newSup.id).toBeDefined();
      expect(newSup.isArchived).toBe(false);

      // Update
      const updated = await preparationRepository.updateSupplier(newSup.id, {
        name: "Distributor Beras Uji Coba (Update)",
      });
      expect(updated?.name).toBe("Distributor Beras Uji Coba (Update)");

      // Archive
      const archived = await preparationRepository.archiveSupplier(newSup.id);
      expect(archived).toBe(true);

      const activeSuppliers = await preparationRepository.getSuppliers();
      expect(activeSuppliers.some((s) => s.id === newSup.id)).toBe(false);
    });
  });

  describe("Komponen UI CardMetric dengan Aksi", () => {
    it("memanggil callback onClick saat tombol aksi CardMetric ditekan", () => {
      let clicked = false;
      render(
        <CardMetric
          title="Total Transaksi"
          value="15"
          subtitle="Pesanan tercatat"
          action={{
            label: "Lihat Semua",
            onClick: () => {
              clicked = true;
            },
          }}
        />
      );

      const actionButton = screen.getByRole("button", { name: /lihat semua/i });
      expect(actionButton).toBeDefined();
      fireEvent.click(actionButton);
      expect(clicked).toBe(true);
    });

    it("merender tautan href dengan benar saat action CardMetric berupa link navigasi", () => {
      render(
        <CardMetric
          title="Agenda Koperasi"
          value="3"
          subtitle="Jadwal pekan ini"
          action={{
            label: "Kelola Agenda",
            href: "/pekerjaan?tab=agenda",
          }}
        />
      );

      const actionLink = screen.getByRole("link", { name: /kelola agenda/i });
      expect(actionLink).toBeDefined();
      expect(actionLink.getAttribute("href")).toBe("/pekerjaan?tab=agenda");
    });
  });
});
