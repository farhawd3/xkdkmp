import React, { useId } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  fieldMessageClass,
} from "./fieldStyles";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, helperText, error, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className={fieldLabelClass}
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
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? descriptionId : undefined}
            className={cn(
              fieldControlClass,
              "h-12 px-3.5 py-2.5 pr-11 [color-scheme:light] dark:[color-scheme:dark]",
              error && fieldErrorClass,
              className
            )}
            {...props}
          />
          <div className="pointer-events-none absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Calendar className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {error ? (
          <p id={descriptionId} role="alert" className={cn(fieldMessageClass, "font-medium text-red-600 dark:text-red-400")}>
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className={cn(fieldMessageClass, "text-slate-500 dark:text-slate-400")}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
