import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, startIcon, endIcon, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? descriptionId : undefined}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container",
              "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={descriptionId} role="alert" className="text-sm font-medium text-red-600 dark:text-red-300 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
