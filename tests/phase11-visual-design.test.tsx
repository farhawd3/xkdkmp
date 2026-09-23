// @vitest-environment jsdom
import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TaskCalendarView, TaskItem } from "@/components/pekerjaan/TaskCalendarView";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

afterEach(cleanup);

describe("Tahap 4 — Desain Visual, Kalender Modular, & Dialog Konfirmasi", () => {
  const mockTasks: TaskItem[] = [
    {
      id: "t1",
      title: "Cek Stok Beras",
      description: "Periksa persediaan fisik di gudang",
      unit_id: "u1",
      pic_name: "Abdul Halim",
      due_date: "2026-09-25",
      priority: "mendesak",
      status: "sedang_proses",
      notes: "Prioritas tinggi",
      created_at: "2026-09-23T10:00:00Z",
      business_units: { name: "Gerai Sembako" },
    },
    {
      id: "t2",
      title: "Rapat Anggaran",
      description: "Koordinasi bersama pengurus",
      unit_id: null,
      pic_name: "Abdul Halim",
      due_date: "2026-09-25",
      priority: "tinggi",
      status: "belum_mulai",
      notes: null,
      created_at: "2026-09-23T11:00:00Z",
    },
    {
      id: "t3",
      title: "Tinjau Lokasi Gerai Baru",
      description: "Cek fisik lokasi rencana unit simpan pinjam",
      unit_id: null,
      pic_name: "Budi Santoso",
      due_date: null, // Tugas fleksibel tanpa tenggat
      priority: "sedang",
      status: "belum_mulai",
      notes: null,
      created_at: "2026-09-23T12:00:00Z",
    },
  ];

  describe("1. Komponen Kalender Modular (TaskCalendarView)", () => {
    it("merender kalender dengan nama bulan dan tahun yang sesuai", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      expect(screen.getByRole("heading", { name: /^September 2026$/i, level: 3 })).toBeDefined();
      expect(screen.getByText(/3 total agenda pada filter aktif/i)).toBeDefined();
    });

    it("memetakan tugas bertanggal pada sel kalender yang tepat", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      // Tanggal 25 September memiliki 2 tugas
      const day25Button = screen.getByLabelText(/25 September 2026, 2 agenda/i);
      expect(day25Button).toBeDefined();
      expect(day25Button.getAttribute("aria-pressed")).toBe("true");
    });

    it("menampilkan rincian agenda pada panel samping untuk tanggal terpilih", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      expect(screen.getAllByText("Cek Stok Beras").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Rapat Anggaran").length).toBeGreaterThan(0);
    });

    it("menampilkan tugas tanpa tenggat waktu pada panel tugas fleksibel", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      expect(screen.getByText(/Tugas Fleksibel \(Tanpa Tenggat Waktu\)/i)).toBeDefined();
      expect(screen.getByText(/1 tugas belum ditentukan tanggal pelaksanaannya/i)).toBeDefined();
      expect(screen.getByText("Tinjau Lokasi Gerai Baru")).toBeDefined();
    });

    it("dapat menyembunyikan dan menampilkan kembali panel tugas fleksibel", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      const toggleButton = screen.getByText("Sembunyikan");
      fireEvent.click(toggleButton);

      expect(screen.queryByText("Tinjau Lokasi Gerai Baru")).toBeNull();
      expect(screen.getByText("Tampilkan Daftar")).toBeDefined();

      fireEvent.click(screen.getByText("Tampilkan Daftar"));
      expect(screen.getByText("Tinjau Lokasi Gerai Baru")).toBeDefined();
    });

    it("navigasi bulan berikutnya dan bulan sebelumnya mengubah tampilan bulan", () => {
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={vi.fn()}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      const nextButton = screen.getByLabelText("Bulan berikutnya");
      fireEvent.click(nextButton);
      expect(screen.getByRole("heading", { name: /^Oktober 2026$/i, level: 3 })).toBeDefined();

      const prevButton = screen.getByLabelText("Bulan sebelumnya");
      fireEvent.click(prevButton);
      expect(screen.getByRole("heading", { name: /^September 2026$/i, level: 3 })).toBeDefined();
    });

    it("memanggil onSelectDate saat pengguna mengklik tanggal lain di kalender", () => {
      const handleSelectDate = vi.fn();
      render(
        <TaskCalendarView
          tasks={mockTasks}
          selectedDateStr="2026-09-25"
          onSelectDate={handleSelectDate}
          onOpenCreateModalForDate={vi.fn()}
          onOpenEditModal={vi.fn()}
          onQuickStatusChange={vi.fn()}
          onDeleteClick={vi.fn()}
        />
      );

      const day10Button = screen.getByLabelText(/10 September 2026/i);
      fireEvent.click(day10Button);
      expect(handleSelectDate).toHaveBeenCalledWith("2026-09-10");
    });
  });

  describe("2. Dialog Konfirmasi Modal (ConfirmDialog)", () => {
    it("merender modal konfirmasi dengan teks instruktif dan tombol yang jelas", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Hapus Tugas Operasional"
          message='Apakah Anda yakin ingin menghapus tugas "Cek Stok Beras"?'
          confirmText="Hapus Tugas"
          cancelText="Batal"
          isDestructive={true}
        />
      );

      expect(screen.getByText("Hapus Tugas Operasional")).toBeDefined();
      expect(screen.getByText('Apakah Anda yakin ingin menghapus tugas "Cek Stok Beras"?')).toBeDefined();

      const cancelBtn = screen.getByText("Batal");
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleConfirm).not.toHaveBeenCalled();

      const confirmBtn = screen.getByText("Hapus Tugas");
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("tidak merender apa pun saat isOpen bernilai false", () => {
      render(
        <ConfirmDialog
          isOpen={false}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Konfirmasi"
          message="Pesan"
        />
      );

      expect(screen.queryByText("Konfirmasi")).toBeNull();
    });
  });
});
