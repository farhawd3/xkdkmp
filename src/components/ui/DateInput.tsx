"use client";

import React, { useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getTodayWIB } from "@/lib/utils";
import { Dialog } from "./Dialog";
import { fieldControlClass, fieldErrorClass, fieldLabelClass, fieldMessageClass } from "./fieldStyles";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const isoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const dateParts = (value?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1 } : null;
};

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, helperText, error, id, disabled, value, defaultValue, onChange, min, max, ...props }, forwardedRef) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const descriptionId = `${inputId}-description`;
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState(String(defaultValue ?? ""));
    const selected = String(value ?? localValue);
    const today = getTodayWIB();
    const [view, setView] = useState(() => dateParts(selected) ?? dateParts(today)!);
    const openCalendar = () => {
      if (disabled) return;
      setView(dateParts(selected) ?? dateParts(today)!);
      setOpen(true);
    };
    const choose = (next: string) => {
      const input = inputRef.current;
      if (!input) return;
      input.value = next;
      if (value === undefined) setLocalValue(next);
      onChange?.({ target: input, currentTarget: input } as React.ChangeEvent<HTMLInputElement>);
      setOpen(false);
      triggerRef.current?.focus();
    };
    const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
    const count = new Date(view.year, view.month + 1, 0).getDate();
    const monthTitle = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(view.year, view.month, 1));
    const selectedLabel = selected && dateParts(selected)
      ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${selected}T12:00:00`))
      : "Pilih tanggal";
    const shiftMonth = (delta: number) => {
      const next = new Date(view.year, view.month + delta, 1);
      setView({ year: next.getFullYear(), month: next.getMonth() });
    };

    return <div className="w-full space-y-1.5 text-left">
      {label && <label htmlFor={inputId} className={fieldLabelClass}>{label}{props.required && <span className="ml-1 text-red-500">*</span>}</label>}
      <div className="relative">
        <input id={inputId} type="date" ref={(node) => { inputRef.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }} value={value} defaultValue={defaultValue} onChange={onChange} min={min} max={max} disabled={disabled} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" {...props} />
        <button ref={triggerRef} type="button" disabled={disabled} onClick={openCalendar} aria-label={`${label ?? "Tanggal"}: ${selectedLabel}`} aria-expanded={open} aria-haspopup="dialog" aria-invalid={error ? true : undefined} aria-describedby={error || helperText ? descriptionId : undefined} className={cn(fieldControlClass, "flex h-12 min-w-0 items-center justify-between gap-3 px-3.5 py-2.5 text-left", !selected && "text-slate-500 dark:text-slate-400", error && fieldErrorClass, className)}>
          <span className="truncate">{selectedLabel}</span><CalendarDays className="h-5 w-5 shrink-0 text-primary-container dark:text-rose-300" aria-hidden="true" />
        </button>
      </div>
      {error ? <p id={descriptionId} role="alert" className={cn(fieldMessageClass, "font-medium text-red-600 dark:text-red-400")}>⚠ {error}</p> : helperText ? <p id={descriptionId} className={cn(fieldMessageClass, "text-slate-500 dark:text-slate-400")}>{helperText}</p> : null}
      <Dialog isOpen={open} onClose={() => setOpen(false)} title={`Kalender ${label ?? "tanggal"}`} description="Pilih hari, geser bulan, atau gunakan tanggal hari ini." icon={<CalendarDays className="h-5 w-5" />} maxWidth="sm" position="center" bodyClassName="!p-4">
        <div className="mb-3 flex items-center justify-between"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button><span className="text-sm font-semibold capitalize">{monthTitle}</span><button type="button" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button></div>
        <div className="grid grid-cols-7 gap-1 text-center">{weekdays.map((day) => <span key={day} className="py-2 text-xs font-bold text-slate-500 dark:text-slate-400">{day}</span>)}{Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => { const day = isoDate(view.year, view.month, i + 1); const unavailable = Boolean((min && day < String(min)) || (max && day > String(max))); return <button key={day} type="button" onClick={() => choose(day)} disabled={unavailable} aria-label={day} aria-pressed={day === selected} className={cn("flex h-11 min-w-0 items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container", day === selected ? "bg-primary-container text-white" : day === today ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" : "hover:bg-rose-50 dark:hover:bg-slate-700", unavailable && "cursor-not-allowed opacity-30")}>{i + 1}</button>; })}</div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700"><button type="button" onClick={() => choose("")} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Kosongkan</button><button type="button" onClick={() => choose(today)} disabled={Boolean((min && today < String(min)) || (max && today > String(max)))} className="min-h-11 rounded-xl bg-rose-50 px-4 text-sm font-bold text-primary-container hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-950/50 dark:text-rose-200">Hari ini</button></div>
      </Dialog>
    </div>;
  }
);

DateInput.displayName = "DateInput";
