"use client";

import React, { useState, useEffect, useId } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { TaskItem, UnitOption } from "@/types/models";
import { TaskPriority, TaskStatus } from "@/lib/validations/simple-schemas";

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  defaultDueDate?: string;
  units: UnitOption[];
  onTaskSaved: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  task,
  defaultDueDate = "",
  units,
  onTaskSaved,
}) => {
  const formId = useId();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUnitId, setFormUnitId] = useState("");
  const [formPicName, setFormPicName] = useState("Abdul Halim");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState<TaskPriority>("sedang");
  const [formStatus, setFormStatus] = useState<TaskStatus>("belum_mulai");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const { profile } = useOrganizationProfile();

  useEffect(() => {
    if (task) {
      setFormTitle(task.title);
      setFormDescription(task.description || "");
      setFormUnitId(task.unit_id || "");
      setFormPicName(task.pic_name);
      setFormDueDate(task.due_date || "");
      setFormPriority(task.priority);
      setFormStatus(task.status);
      setFormNotes(task.notes || "");
    } else {
      setFormTitle("");
      setFormDescription("");
      setFormUnitId(units[0]?.id || "");
      setFormPicName(profile.manager_name);
      setFormDueDate(defaultDueDate);
      setFormPriority("sedang");
      setFormStatus("belum_mulai");
      setFormNotes("");
    }
  }, [task, units, defaultDueDate, profile.manager_name, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formTitle.trim()) {
      showToast("error", "Judul Wajib Diisi", "Masukkan judul tugas operasional.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: task?.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        unit_id: formUnitId || null,
        pic_name: formPicName.trim(),
        due_date: formDueDate || null,
        priority: formPriority,
        status: formStatus,
        notes: formNotes.trim(),
      };

      const url = "/api/tasks";
      const method = task ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan tugas.");

      showToast(
        "success",
        task ? "Tugas Diperbarui" : "Tugas Ditambahkan",
        `Tugas "${formTitle}" berhasil disimpan.`
      );
      onTaskSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => { if (!submitting) onClose(); }}
      title={task ? "Edit Tugas & Instruksi" : "Tambah Tugas Baru"}
      description={
        task
          ? "Perbarui rincian instruksi kerja, PIC, atau tenggat waktu."
          : "Delegasikan pekerjaan baru kepada staf gerai atau jadwalkan aksi manajerial."
      }
      maxWidth="lg"
      footer={<div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Batal</Button>
        <Button type="submit" form={formId} isLoading={submitting}>{submitting ? "Menyimpan..." : task ? "Perbarui Tugas" : "Simpan Tugas"}</Button>
      </div>}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Tugas Operasional"
          required
          placeholder="Contoh: Stok Opname Bulanan Gerai Sembako"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />

        <Textarea
          label="Deskripsi / Petunjuk Pelaksanaan (Opsional)"
          rows={3}
          placeholder="Jelaskan detail instruksi kerja, dokumen yang disiapkan, atau hasil yang diharapkan..."
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Terkait Gerai / Unit Usaha"
            value={formUnitId}
            onChange={(e) => setFormUnitId(e.target.value)}
            options={[
              { value: "", label: "Umum (Seluruh Koperasi)" },
              ...units.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />

          <Input
            label="Penanggung Jawab (PIC)"
            required
            placeholder="Nama penanggung jawab"
            value={formPicName}
            onChange={(e) => setFormPicName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><DateInput label="Tenggat Waktu (Opsional)" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} /></div>

          <Select
            label="Skala Prioritas"
            value={formPriority}
            onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
            options={[
              { value: "mendesak", label: "🔥 Mendesak" },
              { value: "tinggi", label: "Tinggi" },
              { value: "sedang", label: "Sedang" },
              { value: "rendah", label: "Rendah" },
            ]}
          />

          <Select
            label="Status Pengerjaan"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
            options={[
              { value: "belum_mulai", label: "Belum Dimulai" },
              { value: "sedang_proses", label: "Sedang Dikerjakan" },
              { value: "selesai", label: "Selesai" },
              { value: "tertunda", label: "Tertunda" },
            ]}
          />
        </div>

        <Textarea
          label="Catatan Tambahan / Hasil Pelaksanaan (Opsional)"
          rows={2}
          placeholder="Catatan dari PIC saat menyelesaikan tugas..."
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
        />

      </form>
    </Dialog>
  );
};
