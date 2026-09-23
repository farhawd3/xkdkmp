import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Terjadi Kendala Teknis",
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 p-8 md:p-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="max-w-md text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Muat Ulang
        </Button>
      )}
    </div>
  );
};
