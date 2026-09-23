"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isDestructive
              ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              : "bg-rose-50 text-primary-container dark:bg-rose-950/40 dark:text-rose-400"
          }`}
        >
          {isDestructive ? (
            <AlertTriangle className="h-6 w-6" />
          ) : (
            <Info className="h-6 w-6" />
          )}
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>
    </Dialog>
  );
};
