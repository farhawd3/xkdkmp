import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        crimson: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60",
        success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60",
        warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60",
        info: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60",
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        danger: "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/60",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        md: "text-xs px-3 py-1",
        lg: "text-sm px-3.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}) => {
  const dotColor = {
    crimson: "bg-rose-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    info: "bg-sky-600",
    neutral: "bg-slate-500",
    danger: "bg-red-600",
  }[variant || "neutral"];

  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />}
      {children}
    </span>
  );
};
