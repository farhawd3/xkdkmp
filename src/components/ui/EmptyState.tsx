import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-8 md:p-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 mb-4">
        {icon || <FolderOpen className="h-7 w-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="max-w-md text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};
