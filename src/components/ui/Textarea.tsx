import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  fieldMessageClass,
} from "./fieldStyles";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const descriptionId = `${textareaId}-description`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className={fieldLabelClass}>
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? descriptionId : undefined}
          className={cn(
            fieldControlClass,
            "min-h-28 resize-y px-3.5 py-3 leading-relaxed",
            error && fieldErrorClass,
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
