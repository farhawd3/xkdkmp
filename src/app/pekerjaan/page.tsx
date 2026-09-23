"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  RotateCcw,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TaskCalendarView } from "@/components/pekerjaan/TaskCalendarView";
import { TaskFormModal } from "@/components/pekerjaan/TaskFormModal";
import { TaskList } from "@/components/pekerjaan/TaskList";
import { TaskItem, UnitOption } from "@/types/models";
import { TaskStatus } from "@/lib/validations/simple-schemas";
import { getTodayWIB, formatTanggal } from "@/lib/utils";
import { downloadCsvFile } from "@/lib/csv";

export default function PekerjaanPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterPriority, setFilterPriority] = useState("semua");

  // Tab & Kalender
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayWIB());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newTaskDate, setNewTaskDate] = useState("");

  // Dialog Konfirmasi Hapus
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, unitsRes] = await Promise.all([
        fetch("/api/tasks", { cache: "no-store" }),
        fetch("/api/units", { cache: "no-store" }),
      ]);

      if (!tasksRes.ok) throw new Error("Gagal mengambil daftar tugas dari database.");
      const tasksData = await tasksRes.json();
      setTasks(tasksData.tasks || []);

      if (!unitsRes.ok) throw new Error("Daftar gerai gagal dimuat. Coba lagi sebelum membuat tugas.");
      const unitsData = await unitsRes.json();
      setUnits(unitsData.units || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setNewTaskDate("");
    setIsModalOpen(true);
  };

  const openCreateModalForDate = (dateStr: string) => {
    setEditingTask(null);
    setNewTaskDate(dateStr);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengubah status.");

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      showToast("info", "Status Diperbarui", "Status tugas berhasil diubah.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status.";
      showToast("error", "Kesalahan", msg);
    }
  };

  const handleOpenDeleteConfirm = (task: TaskItem) => {
    setTaskToDelete({ id: task.id, title: task.title });
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks?id=${taskToDelete.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus tugas.");

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      showToast("success", "Tugas Dihapus", `Tugas "${taskToDelete.title}" telah dihapus.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus tugas.";
      showToast("error", "Kesalahan", msg);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  // Filter Tugas
  const isFilterActive =
    filterUnit !== "semua" ||
    filterStatus !== "semua" ||
    filterPriority !== "semua" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setFilterUnit("semua");
    setFilterStatus("semua");
    setFilterPriority("semua");
    setSearchQuery("");
  };

  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter((t) => {
      if (filterUnit !== "semua" && t.unit_id !== filterUnit) return false;
      if (filterStatus !== "semua" && t.status !== filterStatus) return false;
      if (filterPriority !== "semua" && t.priority !== filterPriority) return false;
      if (q) {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || "").toLowerCase().includes(q);
        const picMatch = t.pic_name.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !picMatch) return false;
      }
      return true;
    });
  }, [tasks, filterUnit, filterStatus, filterPriority, searchQuery]);

  // Ekspor CSV
  const handleExportCsv = () => {
    if (filteredTasks.length === 0) {
      showToast("error", "Tidak Ada Data", "Tidak ada daftar tugas untuk diekspor.");
      return;
    }

    const headers = [
      "Judul Tugas",
      "Prioritas",
      "Status",
      "Unit Usaha",
      "Penanggung Jawab (PIC)",
      "Tenggat Waktu",
      "Deskripsi / Instruksi",
      "Catatan",
      "Tanggal Dibuat",
    ];

    const rows = filteredTasks.map((t) => [
      t.title,
      t.priority.toUpperCase(),
      t.status,
      t.business_units?.name || "Umum",
      t.pic_name,
      t.due_date || "Fleksibel",
      t.description || "",
      t.notes || "",
      formatTanggal(t.created_at),
    ]);

    downloadCsvFile(`daftar-tugas-koperasi-${getTodayWIB()}.csv`, [headers, ...rows]);
    showToast("success", "Ekspor Berhasil", "Berkas CSV tugas telah diunduh.");
  };

  // Statistik Metrik
  const urgentCount = tasks.filter((t) => (t.priority === "mendesak" || t.priority === "tinggi") && t.status !== "selesai").length;
  const inProgressCount = tasks.filter((t) => t.status === "sedang_proses").length;
  const doneCount = tasks.filter((t) => t.status === "selesai").length;

  if (loading) return <LoadingState label="Memuat tugas & pekerjaan tim…" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Manajer" },
          { label: "Manajemen Tugas & Kalender", active: true },
        ]}
        title="Manajemen Tugas & Kalender Kerja"
        description="Pusat instruksi kerja tim operasional gerai, pemantauan tenggat waktu, dan kalender kegiatan manajer."
        badgeText="Task & Agenda Hub"
        actions={
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="min-h-11 px-5 shadow-sm font-bold gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tugas Baru</span>
          </Button>
        }
      />

      {/* 4 Kartu Metrik Ringkasan Tugas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Total Tugas Aktif"
          value={tasks.length}
          icon={<ClipboardList className="h-4 w-4" />}
          subtitle="Seluruh penugasan terdaftar"
        />
        <CardMetric
          title="Perlu Tindakan Cepat"
          value={urgentCount}
          icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
          accent="crimson"
          subtitle="Prioritas mendesak & tinggi"
        />
        <CardMetric
          title="Sedang Dikerjakan"
          value={inProgressCount}
          icon={<Clock className="h-4 w-4 text-sky-600" />}
          accent="sky"
          subtitle="Instruksi dalam proses"
        />
        <CardMetric
          title="Tugas Diselesaikan"
          value={doneCount}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          accent="emerald"
          subtitle="Pekerjaan tuntas"
        />
      </div>

      {/* Bilah Filter dan Pencarian Terpadu */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Cari tugas, PIC, atau instruksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-600 dark:bg-[#1D2533] dark:text-slate-100"
              />
            </div>
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="min-h-11 shrink-0 flex items-center justify-center gap-2 shadow-sm font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Tugas Baru</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Select
              label="Filter Gerai / Unit"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              options={[
                { value: "semua", label: "Semua Unit Usaha" },
                ...units.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />
            <Select
              label="Filter Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "semua", label: "Semua Status" },
                { value: "belum_mulai", label: "Belum Dimulai" },
                { value: "sedang_proses", label: "Sedang Proses" },
                { value: "selesai", label: "Selesai" },
                { value: "tertunda", label: "Tertunda" },
              ]}
            />
            <Select
              label="Filter Prioritas"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: "semua", label: "Semua Prioritas" },
                { value: "mendesak", label: "Mendesak (Tinggi Sekali)" },
                { value: "tinggi", label: "Tinggi" },
                { value: "sedang", label: "Sedang" },
                { value: "rendah", label: "Rendah" },
              ]}
            />
          </div>

          {/* Status Hasil & Tombol Ekspor CSV */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan <strong>{filteredTasks.length}</strong> dari {tasks.length} tugas.
              </span>
              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filter
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredTasks.length === 0}
              className="min-h-11 sm:min-h-9 gap-1.5 font-bold text-xs"
            >
              <Download className="h-3.5 w-3.5 text-primary-container" />
              Ekspor CSV ({filteredTasks.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Switcher: Daftar Tugas vs Kalender Agenda */}
      <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "list"
              ? "bg-[#A64768] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Daftar Tugas &amp; Instruksi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === "list" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}>
            {filteredTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "calendar"
              ? "bg-[#A64768] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Kalender Agenda &amp; Event</span>
        </button>
      </div>

      {/* Konten Tab 1: Daftar Tugas */}
      {activeTab === "list" && (
        <TaskList
          tasks={filteredTasks}
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          onOpenCreateModal={openCreateModal}
          onEditTask={openEditModal}
          onQuickStatusChange={handleQuickStatusChange}
          onDeleteTask={handleOpenDeleteConfirm}
        />
      )}

      {/* Konten Tab 2: Kalender Agenda & Event */}
      {activeTab === "calendar" && (
        <TaskCalendarView
          tasks={filteredTasks}
          selectedDateStr={selectedDateStr}
          onSelectDate={setSelectedDateStr}
          onOpenCreateModalForDate={openCreateModalForDate}
          onOpenEditModal={openEditModal}
          onQuickStatusChange={handleQuickStatusChange}
          onDeleteClick={(id, title) => handleOpenDeleteConfirm({ id, title } as TaskItem)}
        />
      )}

      {/* Modal Tambah / Edit Tugas */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        defaultDueDate={newTaskDate}
        units={units}
        onTaskSaved={loadData}
      />

      {/* Dialog Konfirmasi Hapus Tugas */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Hapus Tugas Operasional?"
        message={
          taskToDelete
            ? `Anda akan menghapus tugas "${taskToDelete.title}" secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`
            : "Konfirmasi penghapusan tugas."
        }
        confirmText="Ya, Hapus Tugas"
        cancelText="Batal"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleExecuteDelete}
      />
    </div>
  );
}
