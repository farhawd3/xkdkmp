"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { useModalFocus } from "@/lib/useModalFocus";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  bodyClassName?: string;
  closeOnBackdrop?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  position?: "bottom" | "top" | "center";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  bodyClassName,
  closeOnBackdrop = true,
  maxWidth = "md",
  position = "bottom",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useModalFocus(isOpen && mounted, panelRef, onClose);

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  const overlayPositionClass =
    position === "top"
      ? "items-start justify-center p-3 pt-6 sm:items-center sm:p-4"
      : position === "center"
      ? "items-center justify-center p-3 sm:p-4"
      : "items-end justify-center p-0 sm:items-center sm:p-4";

  const panelPositionClass =
    position === "top"
      ? "rounded-2xl border border-slate-200/90 dark:border-slate-700 animate-in slide-in-from-top-4 duration-200 sm:rounded-3xl sm:zoom-in-95"
      : position === "center"
      ? "rounded-2xl border border-slate-200/90 dark:border-slate-700 animate-in zoom-in-95 duration-200 sm:rounded-3xl"
      : "rounded-t-3xl border border-slate-200/90 dark:border-slate-700 animate-in slide-in-from-bottom-3 duration-200 sm:rounded-3xl sm:zoom-in-95";

  const dialogContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-slate-950/45 dark:bg-slate-950/70 backdrop-blur-[3px] animate-in fade-in duration-200",
        overlayPositionClass
      )}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden border-t-[3px] border-t-primary-container bg-white shadow-[0_28px_90px_rgba(30,41,59,0.24)] dark:border-t-rose-400 dark:bg-[#252F40] sm:max-h-[calc(100dvh-2.5rem)]",
          panelPositionClass,
          maxWidthClasses
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 bg-gradient-to-r from-white via-white to-rose-50/60 p-5 dark:border-slate-700 dark:from-[#252F40] dark:via-[#252F40] dark:to-[#302534] md:p-6">
          <div className="flex min-w-0 items-start gap-3 pr-4">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-primary-container dark:bg-rose-950/60 dark:text-rose-300">
                {icon}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <h2 id={titleId} className="text-base font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-xs leading-relaxed text-slate-500 dark:text-slate-300 sm:text-sm">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Konten dengan Scroll Internal (Aman untuk keyboard tablet/ponsel) */}
        <div className={cn("scrollbar-thin flex-1 overflow-y-auto p-5 text-slate-700 dark:text-slate-200 md:p-6", bodyClassName)}>
          {children}
        </div>

        {/* Footer Modal (Opsional) */}
        {footer && (
          <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/80 sm:flex-row sm:justify-end md:px-6 md:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};
