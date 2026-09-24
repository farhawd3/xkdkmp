import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getActiveNavigationHref, SEARCH_MODULES } from "@/lib/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { CardMetric } from "@/components/ui/Card";

afterEach(cleanup);

describe("Navigasi konsisten", () => {
  it("memilih sub-rute dan mengembalikan rute induk terdekat", () => {
    expect(getActiveNavigationHref("/keuangan/jurnal")).toBe("/keuangan");
    expect(getActiveNavigationHref("/anggota/123")).toBe("/anggota");
    expect(getActiveNavigationHref("/anggotanya")).toBeUndefined();
  });
  it("pencarian mencakup modul utama tanpa rute ganda", () => {
    expect(SEARCH_MODULES.some((item) => item.href === "/unit-usaha")).toBe(true);
    expect(SEARCH_MODULES.some((item) => item.href === "/dashboard")).toBe(true);
    expect(new Set(SEARCH_MODULES.map((item) => item.href)).size).toBe(SEARCH_MODULES.length);
  });
});

describe("Dialog keyboard", () => {
  it("menahan Tab, menutup dengan Escape, dan memulihkan fokus pemicu", () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Buka</button><Dialog isOpen={open} onClose={() => setOpen(false)} title="Form"><input aria-label="Nama" /><button>Simpan</button></Dialog></>;
    }
    render(<Example />);
    const trigger = screen.getByText("Buka");
    trigger.focus();
    fireEvent.click(trigger);
    const last = screen.getByText("Simpan");
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByLabelText("Tutup dialog"));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("dialog tertutup tidak membuka scroll yang dikunci dialog lain", () => {
    render(<><Dialog isOpen onClose={() => {}} title="Aktif">Isi</Dialog><Dialog isOpen={false} onClose={() => {}} title="Tertutup">Isi</Dialog></>);
    expect(document.body.style.overflow).toBe("hidden");
  });
  it("Escape saat fokus pada select tidak menutup formulir induk", () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose} title="Form tugas"><select aria-label="Gerai"><option>Gerai A</option></select></Dialog>);
    const select = screen.getByLabelText("Gerai") as HTMLSelectElement;
    select.focus();
    fireEvent.keyDown(select, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Form tugas" })).toBeDefined();
  });
  it("Escape saat fokus pada option popup juga tidak menutup formulir induk", () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose} title="Form tugas"><select aria-label="Gerai"><option>Gerai A</option></select></Dialog>);
    const option = screen.getByRole("option", { name: "Gerai A" });
    fireEvent.keyDown(option, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Form tugas" })).toBeDefined();
  });
});

describe("Metrik yang jujur", () => {
  it("tidak menampilkan bar penuh jika progres tidak tersedia", () => {
    render(<CardMetric title="Saldo" value="Belum diverifikasi" />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
  it("membatasi progres ke rentang 0 hingga 100", () => {
    render(<CardMetric title="Kesiapan" value="Selesai" progress={120} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });
});
