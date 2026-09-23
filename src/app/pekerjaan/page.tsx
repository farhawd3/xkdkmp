"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Plus,
  Clock,
  MapPin,
  User,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  CalendarClock,
  Target,
  DollarSign,
  Briefcase,
  Layers,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMetric,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { formatRupiah } from "@/lib/utils";
import {
  TaskItem,
  AgendaItem,
  AgendaCategory,
  PoacCategory,
  TaskStatus,
  WorkPlanItem,
} from "@/types";

// Schema Form Buat Agenda Baru
const agendaSchema = z
  .object({
    title: z.string().min(5, "Judul agenda minimal 5 karakter"),
    category: z.enum(["rapat_pengurus", "audit", "operasional", "legalitas"]),
    date: z.string().min(1, "Tanggal agenda wajib diisi"),
    startTime: z.string().min(1, "Waktu mulai wajib diisi"),
    endTime: z.string().min(1, "Waktu selesai wajib diisi"),
    isAllDay: z.boolean().default(false),
    picName: z.string().min(3, "Nama PIC minimal 3 karakter"),
    locationType: z.enum(["fisik", "online"]),
    locationAddress: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isAllDay) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "Waktu selesai harus setelah waktu mulai",
      path: ["endTime"],
    }
  );

type AgendaFormData = z.infer<typeof agendaSchema>;

// Schema Form Buat Tugas Baru
const taskSchema = z.object({
  title: z.string().min(5, "Judul tugas minimal 5 karakter"),
  description: z.string().min(10, "Deskripsi tugas minimal 10 karakter"),
  poacCategory: z.enum(["planning", "organizing", "actuating", "controlling"]),
  priority: z.enum(["tinggi", "sedang", "rendah"]),
  picName: z.string().min(3, "Nama PIC minimal 3 karakter"),
  dueDate: z.string().min(1, "Batas waktu wajib diisi"),
  step1: z.string().optional(),
  step2: z.string().optional(),
  step3: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

// Schema Form Rencana Kerja Baru
const workPlanSchema = z.object({
  goal: z.string().min(5, "Sasaran strategis minimal 5 karakter"),
  indicator: z.string().min(5, "Indikator keberhasilan minimal 5 karakter"),
  targetValue: z.string().min(2, "Target opsional minimal 2 karakter"),
  program: z.string().min(5, "Program kerja minimal 5 karakter"),
  estimatedCost: z.coerce.number().min(0, "Estimasi biaya tidak boleh negatif"),
  picName: z.string().min(3, "Nama PIC minimal 3 karakter"),
  dueDate: z.string().min(1, "Tenggat waktu wajib diisi"),
});

type WorkPlanFormData = z.infer<typeof workPlanSchema>;

function PekerjaanContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"tugas" | "agenda" | "rencana">(
    tabParam === "agenda" || tabParam === "rencana" ? tabParam : "tugas"
  );

  useEffect(() => {
    if (tabParam === "agenda" || tabParam === "rencana" || tabParam === "tugas") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlanItem[]>([]);

  // Filter Tugas
  const [selectedPoac, setSelectedPoac] = useState<string>("all");
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>("all");

  // State Kalender Bulanan
  const [agendaViewMode, setAgendaViewMode] = useState<"kalender" | "daftar">("kalender");
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026

  // State Modal
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWorkPlanModalOpen, setIsWorkPlanModalOpen] = useState(false);
  const [selectedAgendaForDetail, setSelectedAgendaForDetail] = useState<AgendaItem | null>(null);
  const [selectedAgendaForReschedule, setSelectedAgendaForReschedule] = useState<AgendaItem | null>(null);
  const [selectedAgendaForCancel, setSelectedAgendaForCancel] = useState<AgendaItem | null>(null);

  // Form Reschedule
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // State Undo Tugas
  const [lastToggledTaskId, setLastToggledTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clashWarningNotice, setClashWarningNotice] = useState<string | null>(null);

  const { showToast } = useToast();

  const {
    register: registerAgenda,
    handleSubmit: handleSubmitAgenda,
    reset: resetAgenda,
    watch: watchAgenda,
    formState: { errors: errorsAgenda },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      category: "rapat_pengurus",
      picName: "Abdul Halim",
      locationType: "fisik",
      locationAddress: "Kantor Persiapan Desa Ladang Laweh",
      isAllDay: false,
      date: "2026-09-25",
      startTime: "09:00",
      endTime: "11:30",
    },
  });

  const {
    register: registerTask,
    handleSubmit: handleSubmitTask,
    reset: resetTask,
    formState: { errors: errorsTask },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      poacCategory: "actuating",
      priority: "tinggi",
      picName: "Abdul Halim",
      dueDate: "2026-10-15",
    },
  });

  const {
    register: registerWorkPlan,
    handleSubmit: handleSubmitWorkPlan,
    reset: resetWorkPlan,
    formState: { errors: errorsWorkPlan },
  } = useForm<WorkPlanFormData>({
    resolver: zodResolver(workPlanSchema),
    defaultValues: {
      picName: "Abdul Halim",
      estimatedCost: 2500000,
      dueDate: "2026-12-15",
      targetValue: "100% Siap",
    },
  });

  const loadAllData = async () => {
    const [t, a, w] = await Promise.all([
      preparationRepository.getTasks(),
      preparationRepository.getAgendas(),
      preparationRepository.getWorkPlans(),
    ]);
    setTasks(t);
    setAgendas(a);
    setWorkPlans(w);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchPoac = selectedPoac === "all" || t.poacCategory === selectedPoac;
      const matchStatus = selectedTaskStatus === "all" || t.status === selectedTaskStatus;
      return matchPoac && matchStatus;
    });
  }, [tasks, selectedPoac, selectedTaskStatus]);

  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "selesai").length, [tasks]);
  const activeAgendas = useMemo(() => agendas.filter((a) => a.status === "terjadwal").length, [agendas]);
  const totalEstimatedCost = useMemo(
    () => workPlans.reduce((sum, w) => sum + (w.estimatedCost || 0), 0),
    [workPlans]
  );

  // Submit Buat Agenda Baru
  const onSubmitAgenda = async (data: AgendaFormData) => {
    setIsSubmitting(true);
    setClashWarningNotice(null);
    try {
      const res = await preparationRepository.addAgenda({
        title: data.title,
        category: data.category,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        isAllDay: data.isAllDay,
        timeZone: "Asia/Jakarta",
        picName: data.picName,
        locationType: data.locationType,
        locationAddress: data.locationAddress || "Kantor Koperasi",
        description: data.description || "",
      });

      if (!res.success) {
        showToast("error", "Gagal Menjadwalkan Agenda", res.warning || "Waktu agenda tidak valid");
        return;
      }

      if (res.warning) {
        setClashWarningNotice(res.warning);
        showToast("warning", "Peringatan Bentrok Jadwal", res.warning);
      } else {
        showToast("success", "Agenda Terjadwal", `Agenda "${data.title}" berhasil ditambahkan.`);
      }

      await loadAllData();
      if (!res.warning) {
        setIsAgendaModalOpen(false);
        resetAgenda();
      }
    } catch {
      showToast("error", "Gagal", "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Buat Tugas Baru
  const onSubmitTask = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const steps = [];
      if (data.step1) steps.push({ id: `st-1`, text: data.step1, isDone: false });
      if (data.step2) steps.push({ id: `st-2`, text: data.step2, isDone: false });
      if (data.step3) steps.push({ id: `st-3`, text: data.step3, isDone: false });

      await preparationRepository.addTask({
        title: data.title,
        description: data.description,
        poacCategory: data.poacCategory,
        priority: data.priority,
        status: "rencana",
        picName: data.picName,
        dueDate: data.dueDate,
        checklistSteps: steps,
      });

      showToast("success", "Tugas Ditambahkan", `Tugas "${data.title}" telah dicatat ke POAC.`);
      setIsTaskModalOpen(false);
      resetTask();
      await loadAllData();
    } catch {
      showToast("error", "Gagal", "Gagal menambahkan tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Rencana Kerja Baru
  const onSubmitWorkPlan = async (data: WorkPlanFormData) => {
    setIsSubmitting(true);
    try {
      await preparationRepository.addWorkPlan({
        goal: data.goal,
        indicator: data.indicator,
        targetValue: data.targetValue,
        program: data.program,
        estimatedCost: data.estimatedCost,
        picName: data.picName,
        dueDate: data.dueDate,
        status: "draft",
      });

      showToast(
        "success",
        "Rencana Kerja Dicatat",
        "Program kerja berhasil didaftarkan ke draf RAPB 2027 (non-akuntansi)."
      );
      setIsWorkPlanModalOpen(false);
      resetWorkPlan();
      await loadAllData();
    } catch {
      showToast("error", "Gagal", "Gagal menyimpan rencana kerja.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Selesai Tugas + Fitur Undo
  const handleToggleTaskStatus = async (taskId: string) => {
    const res = await preparationRepository.toggleTaskStatus(taskId);
    if (res.task) {
      setLastToggledTaskId(taskId);
      showToast(
        "info",
        `Status Diperbarui`,
        `Tugas ditandai "${res.task.status === "selesai" ? "Selesai" : "Dalam Proses"}". Klik 'Urungkan' jika tidak sengaja.`
      );
      await loadAllData();
    }
  };

  const handleUndoTaskStatus = async (taskId: string) => {
    const restored = await preparationRepository.undoTaskStatus(taskId);
    if (restored) {
      setLastToggledTaskId(null);
      showToast("success", "Status Dipulihkan", `Tugas dikembalikan ke status "${restored.status}".`);
      await loadAllData();
    }
  };

  // Toggle Sub-step Checklist pada Tugas
  const handleToggleChecklistStep = async (task: TaskItem, stepId: string) => {
    if (!task.checklistSteps) return;
    const updatedSteps = task.checklistSteps.map((st) =>
      st.id === stepId ? { ...st, isDone: !st.isDone } : st
    );
    await preparationRepository.updateTask(task.id, { checklistSteps: updatedSteps });
    await loadAllData();
  };

  // Reschedule Agenda
  const handleRescheduleSubmit = async () => {
    if (!selectedAgendaForReschedule || !rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      showToast("error", "Gagal", "Lengkapi tanggal dan jam baru.");
      return;
    }
    const res = await preparationRepository.rescheduleAgenda(
      selectedAgendaForReschedule.id,
      rescheduleDate,
      rescheduleStart,
      rescheduleEnd
    );
    if (!res.success) {
      showToast("error", "Gagal Menjadwalkan Ulang", res.warning || "Waktu tidak valid.");
      return;
    }
    showToast(
      "success",
      "Jadwal Berhasil Diperbarui",
      `Agenda "${selectedAgendaForReschedule.title}" diubah ke tanggal ${rescheduleDate}.`
    );
    setSelectedAgendaForReschedule(null);
    await loadAllData();
  };

  // Batal Agenda
  const handleCancelAgendaSubmit = async () => {
    if (!selectedAgendaForCancel || !cancelReason.trim()) {
      showToast("error", "Gagal", "Alasan pembatalan agenda wajib diisi.");
      return;
    }
    await preparationRepository.cancelAgenda(selectedAgendaForCancel.id, cancelReason);
    showToast("info", "Agenda Dibatalkan", `Agenda telah ditandai batal dengan alasan yang tercatat.`);
    setSelectedAgendaForCancel(null);
    setCancelReason("");
    await loadAllData();
  };

  // Helpers Kalender
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Minggu

  const calendarCells = useMemo(() => {
    const cells = [];
    // Padding hari kosong sebelum tanggal 1
    const padDays = (firstDayIndex + 6) % 7; // Sesuaikan agar Senin = 0
    for (let i = 0; i < padDays; i++) {
      cells.push({ dayNumber: null, dateStr: "" });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      cells.push({ dayNumber: d, dateStr });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex]);

  const changeMonth = (delta: number) => {
    setCurrentCalendarDate(new Date(year, month + delta, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Baku */}
      <PageHeader
        breadcrumbItems={[
          { label: "Manajemen" },
          { label: "Tugas, Agenda & Rencana Kerja", active: true },
        ]}
        title="Tugas, Agenda & Rencana Kerja"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Koordinasi fungsi manajemen POAC pengurus, musyawarah nagari, kalender kerja bulanan, dan draf estimasi anggaran persiapan menuju Awal 2027."
        actions={
          <>
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsTaskModalOpen(true)}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              Tambah Tugas POAC
            </Button>
            <Button
              variant="primary"
              size="default"
              onClick={() => {
                setClashWarningNotice(null);
                setIsAgendaModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Buat Agenda Baru
            </Button>
          </>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Pekerjaan (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Tugas POAC Terkoordinasi"
          value={`${completedTasks} / ${tasks.length}`}
          subtitle={`${tasks.length - completedTasks} tugas aktif persiapan 2027`}
          icon={<CheckSquare className="h-4 w-4 text-emerald-600" />}
          trend={{
            label: `${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% tuntas`,
            positive: true,
          }}
          accentColor="emerald"
          progress={tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}
         action={{ label: "Lihat daftar tugas", onClick: () => { setActiveTab("tugas"); } }}/>
        <CardMetric
          title="Agenda Terjadwal"
          value={activeAgendas.toString()}
          subtitle="Musyawarah nagari & rapat pengurus"
          icon={<CalendarDays className="h-4 w-4 text-sky-600" />}
          trend={{ label: "WIB (Asia/Jakarta)", positive: true }}
          accentColor="sky"
         action={{ label: "Buka agenda", onClick: () => { setActiveTab("agenda"); } }}/>
        <CardMetric
          title="Estimasi Anggaran Rencana"
          value={formatRupiah(totalEstimatedCost)}
          subtitle={`${workPlans.length} program kerja draf strategis`}
          icon={<DollarSign className="h-4 w-4 text-amber-600" />}
          trend={{ label: "Draf Biaya", positive: false }}
          accentColor="amber"
         action={{ label: "Tinjau rencana anggaran", onClick: () => { setActiveTab("rencana"); } }}/>
      </div>

      {/* Navigasi Sub-Tab */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("tugas")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "tugas"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          Tugas POAC
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {tasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "agenda"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
          Kalender & Agenda Musyawarah
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {agendas.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("rencana")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "rencana"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Target className="h-4 w-4" />
          Rencana Kerja & RAPB 2027
          <span className="ml-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs font-semibold">
            Estimasi
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TUGAS POAC                                                        */}
      {/* ========================================================================= */}
      {activeTab === "tugas" && (
        <div className="space-y-6">
          {/* Banner Informasi & Undo */}
          {lastToggledTaskId && (
            <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-xs text-sky-900 dark:text-sky-200 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Perubahan status tugas berhasil disimpan.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUndoTaskStatus(lastToggledTaskId)}
                className="gap-1.5 border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Urungkan (Undo)
              </Button>
            </div>
          )}

          {/* Bar Filter POAC & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
                Kategori POAC:
              </span>
              {[
                { id: "all", label: "Semua" },
                { id: "planning", label: "Planning" },
                { id: "organizing", label: "Organizing" },
                { id: "actuating", label: "Actuating" },
                { id: "controlling", label: "Controlling" },
              ].map((poac) => (
                <button
                  key={poac.id}
                  onClick={() => setSelectedPoac(poac.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedPoac === poac.id
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {poac.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <select
                value={selectedTaskStatus}
                onChange={(e) => setSelectedTaskStatus(e.target.value)}
                aria-label="Filter status tugas"
                className="text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="rencana">Rencana</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Grid Kartu Tugas */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="h-7 w-7 text-slate-400 dark:text-slate-500" />}
              title="Tidak Ada Tugas"
              description="Tidak ada tugas operasional yang sesuai dengan kriteria filter yang dipilih."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((tsk) => {
                const isCompleted = tsk.status === "selesai";
                return (
                  <Card
                    key={tsk.id}
                    className={`transition-all border ${
                      isCompleted
                        ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {tsk.poacCategory}
                            </span>
                            <Badge
                              variant={
                                tsk.priority === "tinggi"
                                  ? "danger"
                                  : tsk.priority === "sedang"
                                  ? "warning"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              Prioritas {tsk.priority}
                            </Badge>
                            <Badge
                              variant={
                                isCompleted
                                  ? "success"
                                  : tsk.status === "dalam_proses"
                                  ? "info"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {tsk.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardTitle
                            className={`text-base font-bold ${
                              isCompleted ? "line-through text-slate-500 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {tsk.title}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {tsk.description}
                      </CardDescription>
                    </CardHeader>

                    {/* Sub-Checklist Steps */}
                    {tsk.checklistSteps && tsk.checklistSteps.length > 0 && (
                      <CardContent className="py-2">
                        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Langkah Eksekusi:
                          </span>
                          {tsk.checklistSteps.map((st) => (
                            <label
                              key={st.id}
                              className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={st.isDone}
                                onChange={() => handleToggleChecklistStep(tsk, st.id)}
                                className="mt-0.5 rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className={st.isDone ? "line-through text-slate-400 dark:text-slate-500" : ""}>
                                {st.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    )}

                    <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          {tsk.picName}
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          {tsk.dueDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isCompleted ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleToggleTaskStatus(tsk.id)}
                          className="text-xs h-8 px-3"
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Buka Kembali
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Tandai Selesai
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KALENDER & AGENDA                                                 */}
      {/* ========================================================================= */}
      {activeTab === "agenda" && (
        <div className="space-y-6">
          {/* Bar Kontrol Kalender */}
          {/* Bar Kontrol Kalender yang Menarik */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(-1)}
                className="h-9 w-9 p-0 rounded-xl"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[170px]">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize block">
                  {monthName}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {agendas.filter((a) => a.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length} Agenda Bulan Ini
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(1)}
                className="h-9 w-9 p-0 rounded-xl"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentCalendarDate(new Date())}
                className="text-xs text-primary-container dark:text-rose-400 font-semibold ml-1"
              >
                Hari Ini
              </Button>
            </div>

            {/* Toggle Tampilan */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setAgendaViewMode("kalender")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  agendaViewMode === "kalender"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5 text-primary-container" />
                Kalender Bulan
              </button>
              <button
                onClick={() => setAgendaViewMode("daftar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  agendaViewMode === "daftar"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Daftar Agenda ({agendas.length})
              </button>
            </div>
          </div>

          {/* MODE 1: KALENDER BULANAN (MONTH VIEW) MODERN */}
          {agendaViewMode === "kalender" && (
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-200/90 dark:border-slate-800 shadow-sm">
                <CardContent className="p-0">
                  {/* Header Hari dengan Pembeda Akhir Pekan */}
                  <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-xs font-bold">
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((day) => (
                      <div key={day} className="py-3 text-slate-700 dark:text-slate-300">
                        {day}
                      </div>
                    ))}
                    {["Sabtu", "Minggu"].map((day) => (
                      <div key={day} className="py-3 text-rose-800 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/30">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid Tanggal Interaktif */}
                  <div className="grid grid-cols-7 border-collapse">
                    {calendarCells.map((cell, idx) => {
                      if (!cell.dayNumber) {
                        return (
                          <div
                            key={`empty-${idx}`}
                            className="min-h-[90px] md:min-h-[110px] border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2"
                          />
                        );
                      }

                      const dayAgendas = agendas.filter((a) => a.date === cell.dateStr);
                      const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);
                      const isToday =
                        cell.dateStr === new Date().toISOString().split("T")[0];

                      return (
                        <div
                          key={cell.dateStr}
                          className={`min-h-[90px] md:min-h-[110px] border-b border-r border-slate-200/80 dark:border-slate-800 p-2 transition-colors flex flex-col justify-between ${
                            isToday
                              ? "bg-rose-50/30 dark:bg-rose-950/30 ring-1 ring-inset ring-rose-300 dark:ring-rose-800"
                              : isWeekend
                              ? "bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                              : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            {isToday ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-white font-bold text-xs shadow-sm">
                                {cell.dayNumber}
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-semibold ${
                                  isWeekend ? "text-rose-700 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {cell.dayNumber}
                              </span>
                            )}

                            {dayAgendas.length > 0 && (
                              <Badge
                                variant={dayAgendas.length > 1 ? "crimson" : "neutral"}
                                size="sm"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {dayAgendas.length}
                              </Badge>
                            )}
                          </div>

                          {/* List Agenda Mini Bergaya Pill */}
                          <div className="space-y-1 flex-1 overflow-hidden">
                            {dayAgendas.map((agd) => (
                              <button
                                key={agd.id}
                                onClick={() => setSelectedAgendaForDetail(agd)}
                                className={`w-full text-left p-1.5 rounded-lg text-xs truncate block font-medium transition-all shadow-sm ${
                                  agd.status === "dibatalkan"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 line-through"
                                    : agd.category === "rapat_pengurus"
                                    ? "bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60"
                                    : agd.category === "audit"
                                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                                    : agd.category === "operasional"
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                                    : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                                }`}
                              >
                                <span className="font-bold mr-1 text-[11px] opacity-80">
                                  {agd.startTime}
                                </span>
                                {agd.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Panel Agenda Mendatang Bulan Ini */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary-container" />
                    Agenda Terdekat Bulan Ini ({monthName})
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Pemberitahuan resmi musyawarah & rapat pra-RAT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agendas
                    .filter((a) => a.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
                    .slice(0, 3)
                    .map((agd) => (
                      <div
                        key={agd.id}
                        onClick={() => setSelectedAgendaForDetail(agd)}
                        className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                            {agd.title}
                          </span>
                          <Badge
                            variant={
                              agd.category === "rapat_pengurus"
                                ? "info"
                                : agd.category === "audit"
                                ? "warning"
                                : "success"
                            }
                            size="sm"
                          >
                            {agd.category.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                            {agd.date} • {agd.startTime}-{agd.endTime}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <span>PIC: <strong className="text-slate-700 dark:text-slate-300">{agd.picName}</strong></span>
                          <span className="text-primary-container dark:text-rose-400 font-semibold hover:underline">
                            Tinjau Detail
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: DAFTAR AGENDA LENGKAP */}
          {agendaViewMode === "daftar" && (
            <div className="space-y-3">
              {agendas.map((agd) => {
                const isCancelled = agd.status === "dibatalkan";
                return (
                  <Card
                    key={agd.id}
                    className={`transition-all ${
                      isCancelled ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              agd.category === "rapat_pengurus"
                                ? "info"
                                : agd.category === "audit"
                                ? "warning"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {agd.category.replace("_", " ")}
                          </Badge>
                          {isCancelled && (
                            <Badge variant="danger" size="sm">
                              Dibatalkan
                            </Badge>
                          )}
                          {agd.rescheduledFrom && (
                            <Badge variant="warning" size="sm">
                              Rescheduled dari {agd.rescheduledFrom}
                            </Badge>
                          )}
                        </div>

                        <h3
                          className={`text-base font-bold ${
                            isCancelled ? "line-through text-slate-500 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {agd.title}
                        </h3>

                        {agd.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{agd.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {agd.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {agd.startTime} - {agd.endTime} WIB
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {agd.locationAddress || "Pertemuan Fisik"}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            PIC: {agd.picName}
                          </span>
                        </div>

                        {agd.cancellationReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-md">
                            <strong>Alasan Dibatalkan:</strong> {agd.cancellationReason}
                          </p>
                        )}
                      </div>

                      {/* Tombol Aksi Agenda */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAgendaForDetail(agd)}
                        >
                          Detail
                        </Button>
                        {!isCancelled && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgendaForReschedule(agd);
                                setRescheduleDate(agd.date);
                                setRescheduleStart(agd.startTime);
                                setRescheduleEnd(agd.endTime);
                              }}
                              className="gap-1 text-slate-700 dark:text-slate-200"
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                              Jadwal Ulang
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAgendaForCancel(agd)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              Batalkan
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RENCANA KERJA & RAPB 2027                                         */}
      {/* ========================================================================= */}
      {activeTab === "rencana" && (
        <div className="space-y-6">
          {/* Banner Penting Regulasi Akuntansi */}
          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Peringatan Integritas Akuntansi Persiapan</p>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                Rencana kerja dan estimasi anggaran biaya di bawah ini merupakan estimasi draf (RAPB 2027).{" "}
                <strong>Pembuatan rencana kerja TIDAK menciptakan jurnal pembukuan debit/kredit</strong> dan{" "}
                <strong>TIDAK memotong saldo kas/bank</strong> sampai terdapat transaksi riil pembelian yang
                disertai bukti sah.
              </p>
            </div>
          </div>

          {/* Ringkasan & Tombol Tambah */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Program Terdaftar</span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{workPlans.length} Program</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Estimasi Kebutuhan Biaya</span>
                <span className="text-lg font-bold text-primary dark:text-rose-400">
                  {formatRupiah(
                    workPlans.reduce((sum, wp) => sum + (wp.estimatedCost || 0), 0)
                  )}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="default"
              onClick={() => setIsWorkPlanModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Rencana Kerja
            </Button>
          </div>

          {/* Tabel Program Kerja */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Program Kerja</th>
                    <th className="py-3 px-4">Sasaran Strategis</th>
                    <th className="py-3 px-4">Target Indikator</th>
                    <th className="py-3 px-4">Estimasi Biaya</th>
                    <th className="py-3 px-4">PIC</th>
                    <th className="py-3 px-4">Tenggat</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {workPlans.map((wp) => (
                    <tr key={wp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {wp.program}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px]">
                        {wp.goal}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{wp.indicator}</span>
                        <span className="block text-xs text-slate-400 dark:text-slate-500">({wp.targetValue})</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(wp.estimatedCost)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{wp.picName}</td>
                      <td className="py-3.5 px-4 text-amber-700 dark:text-amber-400 font-medium">{wp.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            wp.status === "disetujui"
                              ? "success"
                              : wp.status === "ditinjau"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {wp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT AGENDA BARU (ACT-TSK-03 & Validasi Bentrok)                  */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAgendaModalOpen}
        onClose={() => {
          setIsAgendaModalOpen(false);
          setClashWarningNotice(null);
        }}
        title="Buat Agenda Musyawarah / Koordinasi"
        description="Jadwalkan rapat koordinasi pengurus atau peninjauan lapangan persiapan."
        maxWidth="lg"
      >
        {clashWarningNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Peringatan Jadwal Bersinggungan:</span>
              <span>{clashWarningNotice}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitAgenda(onSubmitAgenda)} className="space-y-4">
          <Input
            label="Nama Agenda / Musyawarah"
            placeholder="Contoh: Rapat Pleno Penetapan Pengurus Gerai"
            {...registerAgenda("title")}
            error={errorsAgenda.title?.message}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Kategori Agenda"
              {...registerAgenda("category")}
              options={[
                { value: "rapat_pengurus", label: "Rapat Pengurus" },
                { value: "audit", label: "Audit & Pemeriksaan" },
                { value: "operasional", label: "Peninjauan Operasional" },
                { value: "legalitas", label: "Koordinasi Legalitas" },
              ]}
              error={errorsAgenda.category?.message}
            />

            <DateInput
              label="Tanggal Pertemuan"
              {...registerAgenda("date")}
              error={errorsAgenda.date?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Waktu Mulai (WIB)"
              type="time"
              {...registerAgenda("startTime")}
              error={errorsAgenda.startTime?.message}
              required
            />
            <Input
              label="Waktu Selesai (WIB)"
              type="time"
              {...registerAgenda("endTime")}
              error={errorsAgenda.endTime?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Penanggung Jawab (PIC)"
              {...registerAgenda("picName")}
              error={errorsAgenda.picName?.message}
              required
            />
            <Select
              label="Tipe Pertemuan"
              {...registerAgenda("locationType")}
              options={[
                { value: "fisik", label: "Tatap Muka (Fisik)" },
                { value: "online", label: "Daring (Online)" },
              ]}
            />
          </div>

          <Input
            label="Lokasi Fisik / Tautan Pertemuan"
            placeholder="Contoh: Kantor Wali Nagari Ladang Laweh"
            {...registerAgenda("locationAddress")}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAgendaModalOpen(false);
                setClashWarningNotice(null);
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Agenda
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH TUGAS POAC                                                 */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Tambah Tugas POAC Baru"
        description="Catat tugas fungsi manajemen persiapan pembukaan gerai sembako."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitTask(onSubmitTask)} className="space-y-4">
          <Input
            label="Judul Tugas"
            placeholder="Contoh: Pengadaan Rak Gondola & Timbangan Digital"
            {...registerTask("title")}
            error={errorsTask.title?.message}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Fungsi Manajemen (POAC)"
              {...registerTask("poacCategory")}
              options={[
                { value: "planning", label: "Planning (Perencanaan)" },
                { value: "organizing", label: "Organizing (Pengorganisasian)" },
                { value: "actuating", label: "Actuating (Pelaksanaan)" },
                { value: "controlling", label: "Controlling (Pengawasan)" },
              ]}
              error={errorsTask.poacCategory?.message}
            />

            <Select
              label="Tingkat Prioritas"
              {...registerTask("priority")}
              options={[
                { value: "tinggi", label: "Tinggi (Segera)" },
                { value: "sedang", label: "Sedang" },
                { value: "rendah", label: "Rendah" },
              ]}
              error={errorsTask.priority?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Penanggung Jawab (PIC)"
              {...registerTask("picName")}
              error={errorsTask.picName?.message}
              required
            />
            <DateInput
              label="Batas Waktu (Due Date)"
              {...registerTask("dueDate")}
              error={errorsTask.dueDate?.message}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat & Sasaran
            </label>
            <textarea
              {...registerTask("description")}
              rows={3}
              placeholder="Jelaskan kebutuhan dan output yang diharapkan dari tugas ini..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errorsTask.description && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errorsTask.description.message}</p>
            )}
          </div>

          {/* Sub-steps opsional */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Langkah Checklist (Opsional):
            </span>
            <Input placeholder="Langkah 1 (contoh: Survei harga pemasok)" {...registerTask("step1")} />
            <Input placeholder="Langkah 2 (contoh: Konfirmasi spesifikasi barang)" {...registerTask("step2")} />
            <Input placeholder="Langkah 3 (contoh: Serah terima fisik barang)" {...registerTask("step3")} />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTaskModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH RENCANA KERJA                                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isWorkPlanModalOpen}
        onClose={() => setIsWorkPlanModalOpen(false)}
        title="Tambah Rencana Kerja & RAPB 2027"
        description="Pendaftaran program kerja dan estimasi kebutuhan biaya non-akuntansi."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitWorkPlan(onSubmitWorkPlan)} className="space-y-4">
          <Input
            label="Nama Program Kerja"
            placeholder="Contoh: Renovasi & Penyiapan Etalase Toko"
            {...registerWorkPlan("program")}
            error={errorsWorkPlan.program?.message}
            required
          />

          <Input
            label="Sasaran Strategis"
            placeholder="Contoh: Memastikan gerai fisik siap layani warga desa"
            {...registerWorkPlan("goal")}
            error={errorsWorkPlan.goal?.message}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Indikator Kinerja"
              placeholder="Contoh: Kesiapan fisik gerai"
              {...registerWorkPlan("indicator")}
              error={errorsWorkPlan.indicator?.message}
              required
            />
            <Input
              label="Target Output"
              placeholder="Contoh: 100% Siap"
              {...registerWorkPlan("targetValue")}
              error={errorsWorkPlan.targetValue?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Estimasi Kebutuhan Biaya (Rp)"
              type="number"
              {...registerWorkPlan("estimatedCost")}
              error={errorsWorkPlan.estimatedCost?.message}
              required
            />
            <Input
              label="Penanggung Jawab (PIC)"
              {...registerWorkPlan("picName")}
              error={errorsWorkPlan.picName?.message}
              required
            />
            <DateInput
              label="Tenggat Waktu"
              {...registerWorkPlan("dueDate")}
              error={errorsWorkPlan.dueDate?.message}
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWorkPlanModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Rencana
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL AGENDA                                                     */}
      {/* ========================================================================= */}
      {selectedAgendaForDetail && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedAgendaForDetail(null)}
          title="Detail Agenda Musyawarah"
          description="Informasi waktu dan lokasi pertemuan resmi."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="info">{selectedAgendaForDetail.category.replace("_", " ")}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                {selectedAgendaForDetail.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">{selectedAgendaForDetail.description || "Tidak ada deskripsi khusus."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Tanggal Pertemuan:</span>
                <span className="font-semibold">{selectedAgendaForDetail.date}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Waktu:</span>
                <span className="font-semibold">
                  {selectedAgendaForDetail.startTime} - {selectedAgendaForDetail.endTime} WIB
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Penanggung Jawab:</span>
                <span className="font-semibold">{selectedAgendaForDetail.picName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Tipe:</span>
                <span className="font-semibold capitalize">{selectedAgendaForDetail.locationType}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-400 dark:text-slate-500 block text-xs">Lokasi / Tautan:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {selectedAgendaForDetail.locationAddress || "Kantor Persiapan Nagari Ladang Laweh"}
              </span>
            </div>

            {selectedAgendaForDetail.cancellationReason && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-700 dark:text-red-300">
                <span className="font-bold block text-xs">Alasan Pembatalan:</span>
                <span>{selectedAgendaForDetail.cancellationReason}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedAgendaForDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESCHEDULE AGENDA                                                 */}
      {/* ========================================================================= */}
      {selectedAgendaForReschedule && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedAgendaForReschedule(null)}
          title="Jadwal Ulang Agenda"
          description={`Ubah tanggal atau jam pelaksanaan untuk agenda: ${selectedAgendaForReschedule.title}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <DateInput
              label="Tanggal Baru"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Jam Mulai (WIB)"
                type="time"
                value={rescheduleStart}
                onChange={(e) => setRescheduleStart(e.target.value)}
                required
              />
              <Input
                label="Jam Selesai (WIB)"
                type="time"
                value={rescheduleEnd}
                onChange={(e) => setRescheduleEnd(e.target.value)}
                required
              />
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedAgendaForReschedule(null)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleRescheduleSubmit}>
                Simpan Jadwal Baru
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATALKAN AGENDA                                                   */}
      {/* ========================================================================= */}
      {selectedAgendaForCancel && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedAgendaForCancel(null)}
          title="Batalkan Agenda Musyawarah"
          description={`Apakah Anda yakin ingin membatalkan agenda "${selectedAgendaForCancel.title}"?`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Pembatalan (Wajib Dicatat)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Ditunda atas arahan Wali Nagari menunggu kelengkapan berkas legalitas..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedAgendaForCancel(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleCancelAgendaSubmit}>
                Konfirmasi Batalkan
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function PekerjaanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat modul pekerjaan...</div>}>
      <PekerjaanContent />
    </Suspense>
  );
}
