"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User,
  Store,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TaskPriority, TaskStatus } from "@/lib/validations/simple-schemas";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  unit_id: string | null;
  pic_name: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  business_units?: { name: string } | null;
}

interface UnitOption {
  id: string;
  name: string;
}

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

  // Modal Dialog Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUnitId, setFormUnitId] = useState("");
  const [formPicName, setFormPicName] = useState("Abdul Halim");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState<TaskPriority>("sedang");
  const [formStatus, setFormStatus] = useState<TaskStatus>("belum_mulai");
  const [formNotes, setFormNotes] = useState("");

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

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.units || []);
      }
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
    setFormTitle("");
    setFormDescription("");
    setFormUnitId(units[0]?.id || "");
    setFormPicName("Abdul Halim");
    setFormDueDate("");
    setFormPriority("sedang");
    setFormStatus("belum_mulai");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormUnitId(task.unit_id || "");
    setFormPicName(task.pic_name);
    setFormDueDate(task.due_date || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormNotes(task.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("error", "Judul Wajib Diisi", "Masukkan judul tugas.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingTask?.id,
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
      const method = editingTask ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan tugas.");

      showToast(
        "success",
        editingTask ? "Tugas Diperbarui" : "Tugas Ditambahkan",
        `Tugas "${formTitle}" berhasil disimpan.`
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
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
      showToast("success", "Status Tugas Diperbarui", "Status tugas berhasil disesuaikan.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal", msg);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Hapus tugas "${title}"?`)) return;
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus tugas.");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("success", "Tugas Dihapus", `Tugas "${title}" telah dihapus.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal Menghapus", msg);
    }
  };

  // Tab View: List vs Kalender
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  // State Kalender Interaktif
  const today = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((prev) => prev - 1);
      setCalMonth(11);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((prev) => prev + 1);
      setCalMonth(0);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const goToToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  const daysInMonth = useMemo(() => {
    return new Date(calYear, calMonth + 1, 0).getDate();
  }, [calYear, calMonth]);

  const firstDayIndex = useMemo(() => {
    // 0: Minggu -> 6, 1: Senin -> 0, dst.
    const day = new Date(calYear, calMonth, 1).getDay();
    return (day + 6) % 7;
  }, [calYear, calMonth]);

  // Petakan tugas per tanggal YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    for (const t of tasks) {
      if (t.due_date) {
        const existing = map.get(t.due_date) || [];
        existing.push(t);
        map.set(t.due_date, existing);
      }
    }
    return map;
  }, [tasks]);

  // Tugas pada tanggal terpilih
  const selectedDateTasks = useMemo(() => {
    return tasksByDate.get(selectedDateStr) || [];
  }, [tasksByDate, selectedDateStr]);

  const selectedDateLabel = useMemo(() => {
    const value = new Date(`${selectedDateStr}T00:00:00`);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(value);
  }, [selectedDateStr]);

  // Buka modal dengan tanggal terpilih otomatis
  const openCreateModalForDate = (dateStr: string) => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormUnitId(units[0]?.id || "");
    setFormPicName("Abdul Halim");
    setFormDueDate(dateStr);
    setFormPriority("sedang");
    setFormStatus("belum_mulai");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === "sedang_proses").length;
  const urgentTasks = tasks.filter((t) => t.priority === "mendesak" && t.status !== "selesai").length;
  const completedTasks = tasks.filter((t) => t.status === "selesai").length;

  // Filter List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesUnit = filterUnit === "semua" || t.unit_id === filterUnit;
      const matchesStatus = filterStatus === "semua" || t.status === filterStatus;
      const matchesPriority = filterPriority === "semua" || t.priority === filterPriority;

      return matchesSearch && matchesUnit && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterUnit, filterStatus, filterPriority]);

  if (loading) return <LoadingState label="Memuat manajemen tugas koperasi…" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Menu Utama" },
          { label: "Tugas & Agenda", active: true },
        ]}
        title="Manajemen Tugas & Agenda Koperasi"
        badgeText="Operasional Manajer"
        badgeVariant="crimson"
        description="Pantau seluruh instruksi kerja, agenda kalender, tenggat waktu, dan penanggung jawab operasional gerai koperasi secara terpadu."
      />

      {/* 4 Kartu Ringkasan Metrik Ber-Gradient Pastel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 bg-gradient-to-br from-white to-slate-100/90 dark:border-slate-800 dark:from-[#252F40] dark:to-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tugas</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalTasks}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seluruh instruksi kerja</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100/80 bg-gradient-to-br from-white to-sky-50/90 dark:border-sky-950/60 dark:from-[#252F40] dark:to-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">Sedang Proses</p>
                <h3 className="text-2xl font-bold text-sky-900 dark:text-sky-200 mt-1">{inProgressTasks}</h3>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80 mt-1">Dalam pengerjaan tim</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100/80 bg-gradient-to-br from-white to-rose-50/90 dark:border-rose-950/60 dark:from-[#252F40] dark:to-[#38232F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">Perhatian / Mendesak</p>
                <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">{urgentTasks}</h3>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">Prioritas tinggi manajer</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/90 dark:border-emerald-950/60 dark:from-[#252F40] dark:to-[#1B3329]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Selesai</p>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{completedTasks}</h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">Target terlaksana</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <span>Daftar Tugas & Instruksi</span>
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
          <span>Kalender Agenda & Event</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === "calendar" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          }`}>
            {Array.from(tasksByDate.keys()).length} Hari
          </span>
        </button>
      </div>

      {/* KONTEN TAB 1: DAFTAR TUGAS */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Bilah Aksi & Filter Ramah Tablet */}
          <Card>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Input
                    type="search"
                    aria-label="Cari tugas"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tugas, PIC, atau kata kunci..."
                    startIcon={<Search className="h-5 w-5" />}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={openCreateModal}
                  className="min-h-11 shrink-0 flex items-center justify-center gap-2 shadow-sm"
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
            </CardContent>
          </Card>

          {/* Daftar Kartu Tugas */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada tugas yang cocok</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Tidak ditemukan tugas dengan filter yang dipilih. Silakan ubah filter atau tambah tugas baru.
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-1.5" /> Tambah Tugas Sekarang
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((task) => {
                  const isUrgent = task.priority === "mendesak";
                  const isDone = task.status === "selesai";
                  const isInProgress = task.status === "sedang_proses";

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between ${
                        isDone
                          ? "border-emerald-100 bg-white/70 dark:border-emerald-950/40 dark:bg-[#1E293B]/60 opacity-80"
                          : isUrgent
                          ? "border-rose-200 bg-gradient-to-br from-white to-rose-50/50 dark:border-rose-900/50 dark:from-[#252F40] dark:to-[#38232F]"
                          : "border-slate-200/90 bg-white dark:border-slate-700/80 dark:bg-[#252F40]"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header Kartu: Status & Prioritas */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                task.priority === "mendesak"
                                  ? "danger"
                                  : task.priority === "tinggi"
                                  ? "warning"
                                  : task.priority === "sedang"
                                  ? "info"
                                  : "neutral"
                              }
                            >
                              {task.priority === "mendesak" ? "🔥 Mendesak" : `Prioritas: ${task.priority.toUpperCase()}`}
                            </Badge>

                            <Badge
                              variant={
                                isDone ? "success" : isInProgress ? "info" : "neutral"
                              }
                            >
                              {task.status === "belum_mulai"
                                ? "Belum Mulai"
                                : task.status === "sedang_proses"
                                ? "Sedang Dikerjakan"
                                : task.status === "selesai"
                                ? "✓ Selesai"
                                : "Tertunda"}
                            </Badge>
                          </div>

                          {task.business_units?.name && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <Store className="h-3.5 w-3.5" />
                              {task.business_units.name}
                            </span>
                          )}
                        </div>

                        {/* Judul & Deskripsi */}
                        <div>
                          <h4 className={`text-base font-bold text-slate-900 dark:text-slate-100 ${isDone ? "line-through text-slate-500 dark:text-slate-400" : ""}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Meta Informasi (PIC & Due Date) */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">PIC: <strong>{task.pic_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Tenggat: <strong>{task.due_date || "Fleksibel"}</strong></span>
                          </div>
                        </div>

                        {task.notes && (
                          <p className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic">
                            Catatan: {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Tombol Aksi Cepat Bawah */}
                      <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          {task.status === "belum_mulai" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusChange(task.id, "sedang_proses")}
                              className="text-xs h-8 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50"
                            >
                              <Play className="h-3.5 w-3.5 mr-1" /> Mulai Kerjakan
                            </Button>
                          )}
                          {task.status === "sedang_proses" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleQuickStatusChange(task.id, "selesai")}
                              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Tandai Selesai
                            </Button>
                          )}
                          {task.status === "selesai" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusChange(task.id, "sedang_proses")}
                              className="text-xs h-8 text-slate-600 dark:text-slate-400"
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Buka Kembali
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(task)}
                            aria-label="Edit tugas"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            aria-label="Hapus tugas"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KONTEN TAB 2: KALENDER AGENDA & EVENT */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kalender Bulanan (2 Span Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-5 space-y-5">
                {/* Navigasi Bulan */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#A64768]" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-8">
                      Hari Ini
                    </Button>
                    <div className="flex items-center border rounded-xl overflow-hidden border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="flex h-11 w-11 items-center justify-center text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Bulan sebelumnya"
                        title="Bulan Sebelumnya"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="flex h-11 w-11 items-center justify-center text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Bulan berikutnya"
                        title="Bulan Berikutnya"
                      >
                        ▶
                      </button>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openCreateModalForDate(selectedDateStr)}
                      className="text-xs h-8 gap-1 ml-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agenda Baru</span>
                    </Button>
                  </div>
                </div>

                <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-2">
                <div className="min-w-[620px]">
                {/* Grid Nama Hari (Senin s/d Minggu) */}
                <div className="grid grid-cols-7 gap-1 border-b border-slate-100 py-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span className="text-rose-600 dark:text-rose-400">Sab</span>
                  <span className="text-rose-600 dark:text-rose-400">Min</span>
                </div>

                {/* Grid Tanggal Bulanan */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Padding hari kosong di awal bulan */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-slate-50/40 dark:bg-slate-900/20" />
                  ))}

                  {/* Hari-hari dalam bulan */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const dayTasks = tasksByDate.get(dateStr) || [];
                    const isSelected = selectedDateStr === dateStr;
                    const isToday =
                      today.getFullYear() === calYear &&
                      today.getMonth() === calMonth &&
                      today.getDate() === dayNum;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDateStr(dateStr)}
                        aria-label={`${dayNum} ${MONTH_NAMES[calMonth]} ${calYear}, ${dayTasks.length} agenda`}
                        aria-pressed={isSelected}
                        className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-[#A64768] bg-rose-50/60 dark:border-rose-500 dark:bg-rose-950/30 ring-2 ring-[#A64768]/30"
                            : isToday
                            ? "border-sky-300 bg-sky-50/40 dark:border-sky-800 dark:bg-sky-950/20"
                            : "border-slate-100 hover:border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              isToday
                                ? "bg-sky-600 text-white"
                                : isSelected
                                ? "bg-[#A64768] text-white"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {dayNum}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        {/* Indikator Cuplikan Event */}
                        <div className="space-y-0.5 mt-1 w-full overflow-hidden">
                          {dayTasks.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              className={`text-[9px] sm:text-[10px] truncate px-1 py-0.5 rounded font-medium ${
                                t.status === "selesai"
                                  ? "line-through text-slate-400 bg-slate-100 dark:bg-slate-800"
                                  : t.priority === "mendesak"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <span className="text-[9px] text-slate-400 font-medium block">
                              +{dayTasks.length - 2} lainnya
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Samping: Rincian Agenda pada Tanggal Terpilih */}
          <div className="space-y-4">
            <Card className="border-rose-100/90 bg-gradient-to-br from-white to-rose-50/50 dark:border-rose-950/60 dark:from-[#252F40] dark:to-[#2A2333]">
              <CardHeader className="p-4 sm:p-5 border-b border-rose-100/60 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                      Agenda Terpilih
                    </span>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      <span className="capitalize">{selectedDateLabel}</span>
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateModalForDate(selectedDateStr)}
                    className="text-xs h-8 gap-1 border-rose-200 text-rose-700 hover:bg-rose-100/60 dark:border-rose-800 dark:text-rose-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Jadwalkan</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-8 w-8 text-rose-300 dark:text-rose-800 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Tidak ada agenda pada tanggal ini
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Klik tombol &ldquo;Jadwalkan&rdquo; untuk menetapkan tugas atau rapat di tanggal ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <Badge
                            variant={
                              task.priority === "mendesak"
                                ? "danger"
                                : task.priority === "tinggi"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge variant={task.status === "selesai" ? "success" : "info"}>
                            {task.status === "selesai" ? "✓ Selesai" : task.status === "sedang_proses" ? "Proses" : "Belum Mulai"}
                          </Badge>
                        </div>
                        <h5 className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${task.status === "selesai" ? "line-through text-slate-400" : ""}`}>
                          {task.title}
                        </h5>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>PIC: <strong>{task.pic_name}</strong></span>
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-[#A64768] hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kotak Info Event Bulanan */}
            <Card>
              <CardContent className="p-4 text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Clock className="h-4 w-4 text-[#A64768]" />
                  <span>Keterangan Kalender Koperasi</span>
                </div>
                <p className="leading-relaxed">
                  Semua tugas operasional dengan tenggat waktu otomatis tampil pada kalender kerja ini. Manajer dapat memantau jadwal peninjauan stok, tanggal pelaporan kas gerai, koordinasi kelompok tani, dan agenda rapat pengurus bulanan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Dialog Form Tambah / Edit Tugas */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Rincian Tugas" : "Tambah Tugas / Agenda Operasional"}
        description="Tetapkan judul instruksi, penanggung jawab, skala prioritas, dan batas waktu pelaksanaan."
        icon={<ClipboardList className="h-5 w-5" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            type="text"
            label="Judul Instruksi / Agenda"
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Contoh: Koordinasi pasokan beras dengan mitra kelompok tani"
          />

          <Textarea
            rows={3}
            label="Rincian Deskripsi Tugas / Agenda"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Jelaskan langkah kerja, target hasil, atau instruksi khusus..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Unit Usaha Terkait"
              value={formUnitId}
              onChange={(e) => setFormUnitId(e.target.value)}
              options={[
                { value: "", label: "Lintas Unit / Manajemen Umum" },
                ...units.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />

            <Input
              type="text"
              label="Penanggung Jawab (PIC)"
              required
              value={formPicName}
              onChange={(e) => setFormPicName(e.target.value)}
              placeholder="Nama pelaksana tugas"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DateInput
              label="Tenggat Waktu / Tanggal Agenda"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />

            <Select
              label="Skala Prioritas"
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
              options={[
                { value: "mendesak", label: "🔥 Mendesak (Harus Segera)" },
                { value: "tinggi", label: "Tinggi" },
                { value: "sedang", label: "Sedang" },
                { value: "rendah", label: "Rendah" },
              ]}
            />

            <Select
              label="Status Pekerjaan"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
              options={[
                { value: "belum_mulai", label: "Belum Dimulai" },
                { value: "sedang_proses", label: "Sedang Proses" },
                { value: "selesai", label: "Selesai" },
                { value: "tertunda", label: "Tertunda" },
              ]}
            />
          </div>

          <Input
            type="text"
            label="Catatan / Evaluasi Manajer"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Catatan tambahan hasil evaluasi"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : editingTask ? "Simpan Perubahan" : "Simpan Tugas"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
