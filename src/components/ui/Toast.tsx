"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Floating Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
          };

          const borderColors = {
            success: "border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900",
            error: "border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900",
            info: "border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900",
            warning: "border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900",
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5",
                borderColors[toast.type]
              )}
              role="alert"
            >
              <div className="mt-0.5">{icons[toast.type]}</div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{toast.title}</h4>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
