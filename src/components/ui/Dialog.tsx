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

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-[3px] animate-in fade-in duration-200 sm:items-center sm:p-4"
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
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200 dark:border-slate-700 dark:bg-[#252F40] sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl sm:zoom-in-95",
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
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Konten dengan Scroll Internal (Aman untuk keyboard tablet/ponsel) */}
        <div className={cn("scrollbar-thin flex-1 overflow-y-auto p-5 text-slate-700 dark:text-slate-200 md:p-6", bodyClassName)}>
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="flex shrink-0 flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40 sm:flex-row sm:items-center md:px-6 md:py-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};
