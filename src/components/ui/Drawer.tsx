"use client";

import React, { useEffect, useState, useRef } from "react";
import { useModalFocus } from "@/lib/useModalFocus";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideHeader?: boolean;
  noPadding?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = "left",
  children,
  footer,
  hideHeader = false,
  noPadding = false,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      setIsRendered(true);
      // Picu animasi masuk di frame berikutnya
      timeoutId = setTimeout(() => {
        setIsActive(true);
      }, 10);

    } else {
      setIsActive(false);
      // Tunggu animasi keluar selesai sebelum unmount
      timeoutId = setTimeout(() => {
        setIsRendered(false);
      }, 300);

    }

    return () => {
      clearTimeout(timeoutId);

    };
  }, [isOpen]);

  const panelRef = useRef<HTMLDivElement>(null);
  useModalFocus(isOpen && isRendered, panelRef, onClose);

  if (!isRendered) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Menu navigasi"}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative flex h-full w-full max-w-xs md:max-w-sm flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out",
          side === "left"
            ? isActive
              ? "translate-x-0"
              : "-translate-x-full"
            : isActive
            ? "ml-auto translate-x-0"
            : "ml-auto translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title || "Menu Navigasi"}</h2>
            <button
              onClick={onClose}
              aria-label="Tutup menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div
          className={cn(
            "flex-1 min-h-0",
            noPadding ? "overflow-hidden p-0 flex flex-col" : "overflow-y-auto p-4 md:p-5"
          )}
        >
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">{footer}</div>
        )}
      </div>
    </div>, document.body
  );
};
