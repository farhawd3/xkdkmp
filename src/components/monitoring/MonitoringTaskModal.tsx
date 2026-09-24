"use client";

import React, { useState, useEffect, useMemo, useId } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { getTomorrowWIB, getTodayWIB } from "@/lib/utils";
import { DailyReportRecord, UnitOption } from "@/types/models";

export interface ExistingTask {
  id: string;
  title: string;
  unit_id: string | null;
  status: string;
}

export interface MonitoringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReportRecord | null;
  units: UnitOption[];
  existingTasks: ExistingTask[];
  onTaskCreated: () => void;
}

export const MonitoringTaskModal: React.FC<MonitoringTaskModalProps> = ({
  isOpen,
  onClose,
  report,
  units,
  existingTasks,
  onTaskCreated,
}) => {
  const formId = useId();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskUnitId, setTaskUnitId] = useState("");
  const [taskPic, setTaskPic] = useState("Abdul Halim");
  const [taskDueDate, setTaskDueDate] = useState(() => getTomorrowWIB());
  const [taskPriority, setTaskPriority] = useState<"rendah" | "sedang" | "tinggi" | "mendesak">("tinggi");
  const [savingTask, setSavingTask] = useState(false);

  const { showToast } = useToast();
  const { profile } = useOrganizationProfile();

  useEffect(() => {
    if (report) {
      const unitName = report.business_units?.name || "Gerai";
      const snippet = report.operational_notes ? report.operational_notes.slice(0, 45) : "Kendala operasional";
      setTaskTitle(`[Kendala ${unitName}] ${snippet}`);
      setTaskDescription(
        `Dilaporkan pada rekapitulasi harian tanggal ${report.report_date} untuk unit ${unitName}:\n\n"${report.operational_notes || ""}"`
      );
      setTaskUnitId(report.unit_id);
      setTaskPic(profile.manager_name);
      setTaskDueDate(getTomorrowWIB());
      setTaskPriority("tinggi");
    }
  }, [report, profile.manager_name]);

  const potentialDuplicateTask = useMemo(() => {
    if (!report || !report.operational_notes) return null;
    const noteWords = report.operational_notes.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return existingTasks.find((t) => {
      if (t.status === "selesai") return false;
      if (t.unit_id && t.unit_id !== report.unit_id) return false;
      const titleLower = t.title.toLowerCase();
      return noteWords.some((w) => titleLower.includes(w));
    });
  }, [report, existingTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTask) return;
    if (!taskTitle.trim()) {
      showToast("error", "Judul Wajib Diisi", "Tuliskan judul tugas tindak lanjut kendala.");
      return;
    }

    setSavingTask(true);
    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        unit_id: taskUnitId || null,
        pic_name: taskPic.trim() || profile.manager_name,
        due_date: taskDueDate || null,
        priority: taskPriority,
        status: "belum_mulai",
        notes: `Tugas otomatis dibuat dari rekap gerai tanggal ${report?.report_date || getTodayWIB()}.`,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat tugas tindak lanjut.");

      showToast(
        "success",
        "Tugas Berhasil Dibuat",
        "Kendala lapangan telah didaftarkan ke modul Pekerjaan & Tugas."
      );
      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal", msg);
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => { if (!savingTask) onClose(); }}
      title="Buat Tugas dari Kendala Lapangan"
      description="Alihkan catatan kendala gerai menjadi penugasan operasional yang terukur dan memiliki PIC."
      maxWidth="xl"
      footer={<div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={savingTask}>Batal</Button>
        <Button type="submit" form={formId} isLoading={savingTask}>{savingTask ? "Menyimpan Tugas..." : "Simpan Penugasan"}</Button>
      </div>}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {potentialDuplicateTask && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Peringatan Potensi Duplikasi:</strong>
              <p className="mt-0.5">
                Sudah ada tugas aktif dengan konteks serupa: &ldquo;<strong>{potentialDuplicateTask.title}</strong>&rdquo;. Pastikan Anda tidak membuat penugasan ganda.
              </p>
            </div>
          </div>
        )}

        <Input
          label="Judul Tugas Operasional"
          required
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Contoh: [Kendala Gerai Sembako] Restok Beras Medium Segera"
        />

        <Textarea
          label="Rincian Instruksi & Deskripsi Kendala"
          rows={4}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Terkait Gerai / Unit Usaha"
            value={taskUnitId}
            onChange={(e) => setTaskUnitId(e.target.value)}
            options={[
              { value: "", label: "Umum / Semua Unit" },
              ...units.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />

          <Input
            label="Nama Penanggung Jawab (PIC)"
            required
            value={taskPic}
            onChange={(e) => setTaskPic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput label="Tenggat Waktu Penyelesaian" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />

          <Select
            label="Skala Prioritas"
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as typeof taskPriority)}
            options={[
              { value: "rendah", label: "Rendah" },
              { value: "sedang", label: "Sedang" },
              { value: "tinggi", label: "Tinggi" },
              { value: "mendesak", label: "🔥 Mendesak" },
            ]}
          />
        </div>

      </form>
    </Dialog>
  );
};
