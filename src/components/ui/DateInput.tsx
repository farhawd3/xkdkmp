import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, helperText, error, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="date"
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container",
              "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20",
              className
            )}
            {...props}
          />
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
