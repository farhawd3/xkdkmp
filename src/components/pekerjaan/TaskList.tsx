"use client";

import React from "react";
import {
  ClipboardList,
  Store,
  User,
  Calendar,
  Play,
  CheckCircle2,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TaskItem } from "@/types/models";
import { TaskStatus } from "@/lib/validations/simple-schemas";

export interface TaskListProps {
  tasks: TaskItem[];
  isFilterActive: boolean;
  onResetFilters: () => void;
  onOpenCreateModal: () => void;
  onEditTask: (task: TaskItem) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (task: TaskItem) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isFilterActive,
  onResetFilters,
  onOpenCreateModal,
  onEditTask,
  onQuickStatusChange,
  onDeleteTask,
}) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
          {isFilterActive ? "Tidak ada tugas yang cocok dengan filter" : "Belum ada tugas operasional"}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {isFilterActive
            ? "Coba ubah kriteria filter unit, status, prioritas, atau kata pencarian."
            : "Silakan tambahkan instruksi kerja baru untuk mulai memonitor penugasan tim."}
        </p>
        <div className="mt-4">
          {isFilterActive ? (
            <Button variant="outline" size="sm" onClick={onResetFilters}>
              Reset Semua Filter
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onOpenCreateModal}>
              <Plus className="h-4 w-4 mr-1.5" /> Tambah Tugas Sekarang
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tasks.map((task) => {
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
                    onClick={() => onQuickStatusChange(task.id, "sedang_proses")}
                    className="text-xs h-8 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" /> Mulai Kerjakan
                  </Button>
                )}
                {task.status === "sedang_proses" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onQuickStatusChange(task.id, "selesai")}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Tandai Selesai
                  </Button>
                )}
                {task.status === "selesai" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickStatusChange(task.id, "sedang_proses")}
                    className="text-xs h-8 text-slate-600 dark:text-slate-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Buka Kembali
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  aria-label={`Edit tugas ${task.title}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task)}
                  aria-label={`Hapus tugas ${task.title}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
