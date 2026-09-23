"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

export interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export const MemberAddModal: React.FC<MemberAddModalProps> = ({
  isOpen,
  onClose,
  onMemberAdded,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"calon" | "aktif">("calon");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setStatus("calon");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      showToast("error", "Nama Tidak Valid", "Nama lengkap anggota minimal 2 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      const memberNumber = `KOP-${Date.now().toString().slice(-5)}`;
      const payload = {
        member_number: memberNumber,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        status,
        join_date: new Date().toISOString().split("T")[0],
        notes: notes.trim() || null,
      };

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan anggota baru.");
      }

      showToast(
        "success",
        "Anggota Berhasil Ditambahkan",
        `${fullName} (${memberNumber}) telah terdaftar dalam database koperasi.`
      );
      resetForm();
      onMemberAdded();
      onClose();
    } catch (err) {
      showToast("error", "Pendaftaran Gagal", err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Pendaftaran Anggota Baru"
      description="Catat warga Nagari Ladang Laweh ke dalam database keanggotaan koperasi."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap Warga"
          required
          placeholder="Contoh: Siti Rahmah"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Nomor Telepon / WhatsApp (Opsional)"
          type="tel"
          placeholder="Contoh: 081234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helperText="Digunakan untuk koordinasi Rapat Anggota Tahunan (RAT) dan pengumuman SHU."
        />

        <Select
          label="Status Keanggotaan Awal"
          value={status}
          onChange={(e) => setStatus(e.target.value as "calon" | "aktif")}
          options={[
            { value: "calon", label: "Calon Anggota (Belum Verifikasi Berkas/Simpanan)" },
            { value: "aktif", label: "Anggota Aktif Penuh" },
          ]}
        />

        <Textarea
          label="Catatan Keanggotaan (Opsional)"
          rows={2}
          placeholder="Contoh: Warga Jorong Pincuran Tujuah, terdaftar sebagai perintis."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-11"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="min-h-11 px-5 font-bold"
          >
            {submitting ? "Mendaftarkan..." : "Daftarkan Anggota"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
