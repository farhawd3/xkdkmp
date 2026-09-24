"use client";

import React, { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentYearMonthWIB } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Dialog } from "./Dialog";
import { fieldControlClass, fieldLabelClass } from "./fieldStyles";

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export interface MonthPickerProps {
  label?: string;
  value: string;
  onChange: (month: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

export function MonthPicker({ label = "Bulan", value, onChange, min, max, disabled, className }: MonthPickerProps) {
  const currentMonth = getCurrentYearMonthWIB();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number((validMonth(value) ? value : currentMonth).slice(0, 4)));
  const selectedLabel = validMonth(value) ? `${monthNames[Number(value.slice(5, 7)) - 1]} ${value.slice(0, 4)}` : "Pilih bulan";
  const openPicker = () => { setYear(Number((validMonth(value) ? value : currentMonth).slice(0, 4))); setOpen(true); };
  const selectMonth = (month: string) => { onChange(month); setOpen(false); };
  const isUnavailable = (month: string) => Boolean((min && month < min) || (max && month > max));

  return <div className={cn("min-w-[190px] space-y-1.5", className)}>
    {label && <span className={fieldLabelClass}>{label}</span>}
    <button type="button" onClick={openPicker} disabled={disabled} aria-label={`${label}: ${selectedLabel}`} aria-haspopup="dialog" aria-expanded={open} className={cn(fieldControlClass, "flex h-12 w-full items-center justify-between gap-3 px-3.5 text-left font-semibold")}>
      <span className="truncate">{selectedLabel}</span><CalendarDays className="h-5 w-5 shrink-0 text-primary-container dark:text-rose-300" aria-hidden="true" />
    </button>
    <Dialog isOpen={open} onClose={() => setOpen(false)} title="Pilih bulan laporan" description="Pilih tahun, lalu bulan yang ingin ditampilkan." icon={<CalendarDays className="h-5 w-5" />} maxWidth="sm" position="center" bodyClassName="!p-4 sm:!p-5">
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 p-2 dark:bg-slate-800/70">
        <button type="button" onClick={() => setYear((value) => value - 1)} aria-label="Tahun sebelumnya" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700"><ChevronLeft className="h-5 w-5" /></button>
        <strong className="text-lg tabular-nums text-slate-900 dark:text-slate-100">{year}</strong>
        <button type="button" onClick={() => setYear((value) => value + 1)} aria-label="Tahun berikutnya" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2" aria-label={`Bulan tahun ${year}`}>
        {monthNames.map((name, index) => {
          const month = `${year}-${String(index + 1).padStart(2, "0")}`;
          const selected = month === value;
          return <button key={month} type="button" onClick={() => selectMonth(month)} disabled={isUnavailable(month)} aria-pressed={selected} aria-label={`${name} ${year}`} className={cn("min-h-12 rounded-xl border px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container", selected ? "border-primary-container bg-primary-container text-white" : month === currentMonth ? "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 dark:border-slate-700 dark:bg-[#202A39] dark:text-slate-200 dark:hover:border-rose-700 dark:hover:bg-rose-950/30", isUnavailable(month) && "cursor-not-allowed opacity-35")}>{name}</button>;
        })}
      </div>
      <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-700"><button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Batal</button><button type="button" onClick={() => { setYear(Number(currentMonth.slice(0, 4))); if (!isUnavailable(currentMonth)) selectMonth(currentMonth); }} disabled={isUnavailable(currentMonth)} className="min-h-11 rounded-xl bg-rose-50 px-4 text-sm font-bold text-primary-container hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-950/50 dark:text-rose-200">Bulan ini</button></div>
    </Dialog>
  </div>;
}
