import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, options, children, disabled, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? `${selectId}-description` : undefined}
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container",
              "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p id={`${selectId}-description`} role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-description`} className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
