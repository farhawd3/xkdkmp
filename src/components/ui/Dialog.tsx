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
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalFocus(isOpen && mounted, panelRef, onClose);

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "w-full rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100dvh-2.5rem)] overflow-hidden animate-in zoom-in-95 duration-200",
          maxWidthClasses
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1 pr-4 min-w-0">
            <h2 id={titleId} className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Konten dengan Scroll Internal (Aman untuk keyboard tablet/ponsel) */}
        <div className="p-5 md:p-6 overflow-y-auto max-h-[60vh] text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};
