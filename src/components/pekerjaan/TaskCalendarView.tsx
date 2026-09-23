"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Store,
  CheckCircle2,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TaskPriority, TaskStatus } from "@/lib/validations/simple-schemas";
import { cn, getTodayWIB } from "@/lib/utils";
import { TaskItem } from "@/types/models";
export type { TaskItem };

export interface TaskCalendarViewProps {
  tasks: TaskItem[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onOpenCreateModalForDate: (dateStr: string) => void;
  onOpenEditModal: (task: TaskItem) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteClick: (taskId: string, title: string) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  selectedDateStr,
  onSelectDate,
  onOpenCreateModalForDate,
  onOpenEditModal,
  onQuickStatusChange,
  onDeleteClick,
}) => {
  // Parsing tanggal hari ini
  const todayStr = getTodayWIB();
  const today = useMemo(() => new Date(`${todayStr}T12:00:00`), [todayStr]);

  // State tampilan bulan & tahun kalender
  const initialYear = useMemo(() => {
    if (selectedDateStr && /^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)) {
      return parseInt(selectedDateStr.slice(0, 4), 10);
    }
    return today.getFullYear();
  }, [selectedDateStr, today]);

  const initialMonth = useMemo(() => {
    if (selectedDateStr && /^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)) {
      return parseInt(selectedDateStr.slice(5, 7), 10) - 1;
    }
    return today.getMonth();
  }, [selectedDateStr, today]);

  const [calYear, setCalYear] = useState(initialYear);
  const [calMonth, setCalMonth] = useState(initialMonth);
  const [showUndated, setShowUndated] = useState(true);

  const prevMonth = () => {
    const previous = new Date(calYear, calMonth - 1, 1);
    onSelectDate(`${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-01`);
    if (calMonth === 0) {
      setCalYear((prev) => prev - 1);
      setCalMonth(11);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    const next = new Date(calYear, calMonth + 1, 1);
    onSelectDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
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
    onSelectDate(todayStr);
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
  const { tasksByDate, undatedTasks } = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    const undated: TaskItem[] = [];

    for (const t of tasks) {
      if (t.due_date && /^\d{4}-\d{2}-\d{2}$/.test(t.due_date)) {
        const existing = map.get(t.due_date) || [];
        existing.push(t);
        map.set(t.due_date, existing);
      } else {
        undated.push(t);
      }
    }
    return { tasksByDate: map, undatedTasks: undated };
  }, [tasks]);

  // Tugas pada tanggal terpilih
  const selectedDateTasks = useMemo(() => {
    return tasksByDate.get(selectedDateStr) || [];
  }, [tasksByDate, selectedDateStr]);

  const selectedDateLabel = useMemo(() => {
    try {
      const value = new Date(`${selectedDateStr}T00:00:00`);
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(value);
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <div className="space-y-6">
      {/* Grid Utama: Kalender di Kiri/Atas & Panel Detail di Kanan/Bawah */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        {/* Kolom Kalender Bulanan (2 Kolom di Desktop) */}
        <div className="2xl:col-span-2 space-y-4">
          <Card className="overflow-hidden border-slate-200/90 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Bilah Kontrol Navigasi Bulan */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-primary-container dark:bg-rose-950/60 dark:text-rose-300">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {tasks.length} total agenda pada filter aktif
                    </p>
                  </div>
                </div>

                {/* Tombol Navigasi dengan Touch Target yang Nyaman */}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="text-xs font-semibold h-11 px-3.5"
                  >
                    Hari Ini
                  </Button>

                  <div className="flex items-center border rounded-xl overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="flex h-11 w-11 items-center justify-center text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Bulan sebelumnya"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="flex h-11 w-11 items-center justify-center text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Bulan berikutnya"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenCreateModalForDate(selectedDateStr)}
                    className="text-xs font-semibold h-11 gap-1.5 px-3.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agenda Baru</span>
                  </Button>
                </div>
              </div>

              {/* Kontainer Grid Kalender yang Responsif */}
              <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-2">
                <div className="min-w-[620px]">
                  {/* Baris Nama Hari (Senin s/d Minggu) */}
                  <div className="grid grid-cols-7 gap-1 border-b border-slate-100 dark:border-slate-800 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Sen</span>
                    <span>Sel</span>
                    <span>Rab</span>
                    <span>Kam</span>
                    <span>Jum</span>
                    <span className="text-rose-600 dark:text-rose-400">Sab</span>
                    <span className="text-rose-600 dark:text-rose-400">Min</span>
                  </div>

                  {/* Grid Tanggal Hari dalam Bulan */}
                  <div className="grid grid-cols-7 gap-1.5 pt-2">
                    {/* Kotak kosong sebelum tanggal 1 */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="min-h-[75px] sm:min-h-[90px] rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border border-transparent"
                      />
                    ))}

                    {/* Hari-hari dalam bulan aktif */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                      const dayTasks = tasksByDate.get(dateStr) || [];
                      const isSelected = selectedDateStr === dateStr;
                      const isToday = todayStr === dateStr;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => onSelectDate(dateStr)}
                          aria-label={`${dayNum} ${MONTH_NAMES[calMonth]} ${calYear}, ${dayTasks.length} agenda`}
                          aria-pressed={isSelected}
                          aria-current={isToday ? "date" : undefined}
                          className={cn(
                            "min-h-[75px] sm:min-h-[90px] p-2 rounded-xl text-left border transition-all flex flex-col justify-between select-none",
                            isSelected
                              ? "border-primary-container bg-rose-50/70 dark:border-rose-400 dark:bg-rose-950/40 ring-2 ring-primary-container/40 shadow-sm"
                              : isToday
                              ? "border-sky-300 bg-sky-50/50 dark:border-sky-700 dark:bg-sky-950/30"
                              : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={cn(
                                "text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full",
                                isToday && !isSelected && "bg-sky-600 text-white font-black",
                                isSelected && "bg-primary-container text-white font-black",
                                !isToday && !isSelected && "text-slate-700 dark:text-slate-300"
                              )}
                            >
                              {dayNum}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>

                          {/* Cuplikan Event Ringkas */}
                          <div className="space-y-1 mt-1 w-full overflow-hidden">
                            {dayTasks.slice(0, 2).map((t) => (
                              <div
                                key={t.id}
                                className={cn(
                                  "text-[10px] truncate px-1.5 py-0.5 rounded font-medium",
                                  t.status === "selesai"
                                    ? "line-through text-slate-400 bg-slate-100 dark:bg-slate-800"
                                    : t.priority === "mendesak"
                                    ? "bg-rose-100 text-rose-900 font-semibold dark:bg-rose-950 dark:text-rose-200"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                )}
                              >
                                {t.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium block pl-0.5">
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

        {/* Kolom Samping (Desktop) / Kolom Bawah (Tablet): Panel Rincian Tanggal Terpilih */}
        <div className="space-y-4">
          <Card className="border-rose-100/90 bg-gradient-to-br from-white to-rose-50/40 dark:border-slate-800 dark:from-[#252F40] dark:to-[#2B2332] shadow-sm">
            <CardHeader className="p-4 sm:p-5 border-b border-rose-100/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary-container dark:text-rose-400 uppercase tracking-wider">
                    Agenda Terpilih
                  </span>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    <span className="capitalize">{selectedDateLabel}</span>
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenCreateModalForDate(selectedDateStr)}
                  className="text-xs h-10 px-3 gap-1 border-rose-200 text-primary-container hover:bg-rose-100/60 dark:border-rose-900 dark:text-rose-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Jadwalkan</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-9 w-9 text-rose-300 dark:text-rose-700/60 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada agenda pada tanggal ini
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Klik tombol &ldquo;Jadwalkan&rdquo; di atas untuk menetapkan instruksi atau tugas kerja pada hari ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-white dark:border-slate-700/80 dark:bg-slate-900/60 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
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
                            {task.priority === "mendesak" ? "🔥 Mendesak" : task.priority.toUpperCase()}
                          </Badge>
                          <Badge variant={task.status === "selesai" ? "success" : "info"}>
                            {task.status === "selesai"
                              ? "✓ Selesai"
                              : task.status === "sedang_proses"
                              ? "Proses"
                              : "Belum Mulai"}
                          </Badge>
                        </div>

                        {task.business_units?.name && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <Store className="h-3 w-3" />
                            {task.business_units.name}
                          </span>
                        )}
                      </div>

                      <h5
                        className={cn(
                          "text-sm font-bold text-slate-900 dark:text-slate-100",
                          task.status === "selesai" && "line-through text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {task.title}
                      </h5>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>PIC: <strong>{task.pic_name}</strong></span>
                        </span>

                        <div className="flex items-center gap-1">
                          {task.status !== "selesai" ? (
                            <button
                              type="button"
                              onClick={() => onQuickStatusChange(task.id, "selesai")}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 min-h-[44px] inline-flex items-center gap-1"
                              title="Tandai Selesai"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Selesai
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onQuickStatusChange(task.id, "sedang_proses")}
                              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline px-2 py-1 min-h-[44px] inline-flex items-center gap-1"
                              title="Buka Kembali"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Buka
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenEditModal(task)}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 min-h-[44px] min-w-[44px] rounded-lg inline-flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label={`Edit tugas ${task.title}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteClick(task.id, task.title)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 min-h-[44px] min-w-[44px] rounded-lg inline-flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            aria-label={`Hapus tugas ${task.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kotak Petunjuk Kalender Kerja */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4 text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Clock className="h-4 w-4 text-primary-container dark:text-rose-400" />
                <span>Petunjuk Kalender Kerja Manajer</span>
              </div>
              <p className="leading-relaxed">
                Agenda yang memiliki tanggal tenggat otomatis dipetakan di kalender ini. Warna biru menandai hari ini, dan warna rose menandai tanggal yang sedang aktif Anda buka.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bagian Khusus: Tugas Fleksibel Tanpa Tenggat Waktu */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                <CalendarOff className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Tugas Fleksibel (Tanpa Tenggat Waktu)
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {undatedTasks.length} tugas belum ditentukan tanggal pelaksanaannya
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUndated((prev) => !prev)}
              className="text-xs h-9 px-3"
            >
              {showUndated ? "Sembunyikan" : "Tampilkan Daftar"}
            </Button>
          </div>
        </CardHeader>

        {showUndated && (
          <CardContent className="p-4 sm:p-5">
            {undatedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                Semua tugas operasional saat ini sudah memiliki tanggal tenggat waktu yang terencana.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {undatedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900/50 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
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
                          {task.status === "selesai"
                            ? "✓ Selesai"
                            : task.status === "sedang_proses"
                            ? "Proses"
                            : "Belum Mulai"}
                        </Badge>
                      </div>

                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h5>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>PIC: <strong>{task.pic_name}</strong></span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenEditModal(task)}
                        className="text-[11px] h-8 px-2.5 font-semibold text-primary-container dark:text-rose-400 border-rose-200 dark:border-rose-900"
                      >
                        Atur Tanggal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
