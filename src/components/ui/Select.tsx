import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  fieldMessageClass,
} from "./fieldStyles";

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
            className={fieldLabelClass}
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
              fieldControlClass,
              "kopdes-select h-12 appearance-none px-3.5 py-2.5 pr-11",
              error && fieldErrorClass,
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
          <div className="pointer-events-none absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {error ? (
          <p id={`${selectId}-description`} role="alert" className={cn(fieldMessageClass, "font-medium text-red-600 dark:text-red-400")}>
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-description`} className={cn(fieldMessageClass, "text-slate-500 dark:text-slate-400")}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
