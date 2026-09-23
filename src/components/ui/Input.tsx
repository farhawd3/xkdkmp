import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  fieldMessageClass,
} from "./fieldStyles";

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
            className={fieldLabelClass}
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
              fieldControlClass,
              "h-12 px-3.5 py-2.5",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && fieldErrorClass,
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
          <p id={descriptionId} role="alert" className={cn(fieldMessageClass, "font-medium text-red-600 dark:text-red-300")}>
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className={cn(fieldMessageClass, "text-slate-500 dark:text-slate-400")}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
