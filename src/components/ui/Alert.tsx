"use client";

import React from "react";
import { Info, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "amber" | "sky" | "rose" | "emerald";

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    title: string;
    text: string;
    defaultIcon: React.ReactNode;
  }
> = {
  amber: {
    container: "border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-900 dark:text-amber-200",
    text: "text-amber-800 dark:text-amber-300",
    defaultIcon: <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />,
  },
  sky: {
    container: "border-sky-200/80 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-900 dark:text-sky-200",
    text: "text-sky-800 dark:text-sky-300",
    defaultIcon: <Info className="h-4 w-4 shrink-0 mt-0.5" />,
  },
  rose: {
    container: "border-rose-200/80 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200",
    icon: "text-rose-600 dark:text-rose-400",
    title: "text-rose-950 dark:text-rose-200",
    text: "text-rose-900 dark:text-rose-300",
    defaultIcon: <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />,
  },
  emerald: {
    container: "border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-900 dark:text-emerald-200",
    text: "text-emerald-800 dark:text-emerald-300",
    defaultIcon: <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "amber",
  title,
  children,
  icon,
  className,
  ...props
}) => {
  const config = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border p-4 text-xs flex items-start gap-3 shadow-sm transition-all",
        config.container,
        className
      )}
      {...props}
    >
      <div className={cn("shrink-0", config.icon)}>
        {icon !== undefined ? icon : config.defaultIcon}
      </div>
      <div className="flex-1 min-w-0 leading-relaxed">
        {title && (
          <p className={cn("font-semibold mb-1 text-xs sm:text-sm", config.title)}>
            {title}
          </p>
        )}
        <div className={cn("text-xs leading-relaxed", config.text)}>
          {children}
        </div>
      </div>
    </div>
  );
};
