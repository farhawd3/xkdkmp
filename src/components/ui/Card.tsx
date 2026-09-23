import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-card transition-colors duration-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 md:p-6 pb-2 md:pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-base md:text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-5 md:p-6", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 md:p-6 pt-3 md:pt-4 border-t border-slate-100/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl mt-2",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export interface CardMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: { label: string; positive?: boolean };
  progress?: number;
  accent?: "crimson" | "emerald" | "sky" | "amber" | "indigo" | "neutral";
  accentColor?: "crimson" | "emerald" | "sky" | "amber" | "indigo" | "neutral";
  action?: { label: string } & (
    | { href: string; onClick?: never }
    | { href?: never; onClick: () => void }
  );
}

export const CardMetric: React.FC<CardMetricProps> = ({
  title,
  value,
  subtitle,
  subtext,
  icon,
  badge,
  trend,
  progress,
  accent,
  accentColor,
  action,
  className,
  ...props
}) => {
  const effectiveAccent = accentColor ?? accent ?? "crimson";
  const effectiveSubtitle = subtext ?? subtitle;
  
  const accentStyles = {
    crimson: {
      border: "bg-gradient-to-br from-rose-50/70 to-white dark:from-slate-900 dark:to-slate-900",
      bar: "bg-primary-container",
      badgeVariant: "crimson" as const,
    },
    emerald: {
      border: "bg-gradient-to-br from-emerald-50/70 to-white dark:from-slate-900 dark:to-slate-900",
      bar: "bg-emerald-600",
      badgeVariant: "success" as const,
    },
    sky: {
      border: "bg-gradient-to-br from-sky-50/70 to-white dark:from-slate-900 dark:to-slate-900",
      bar: "bg-sky-600",
      badgeVariant: "info" as const,
    },
    amber: {
      border: "bg-gradient-to-br from-amber-50/70 to-white dark:from-slate-900 dark:to-slate-900",
      bar: "bg-amber-500",
      badgeVariant: "warning" as const,
    },
    indigo: {
      border: "bg-gradient-to-br from-indigo-50/70 to-white dark:from-slate-900 dark:to-slate-900",
      bar: "bg-indigo-600",
      badgeVariant: "neutral" as const,
    },
    neutral: {
      border: "hover:border-slate-300 dark:hover:border-slate-700",
      bar: "bg-slate-400 dark:bg-slate-500",
      badgeVariant: "neutral" as const,
    },
  };

  const style = accentStyles[effectiveAccent];

  // Indikator hanya ditampilkan ketika nilai progres benar-benar tersedia.
  const hasProgress = typeof progress === "number" && Number.isFinite(progress);
  const barWidth = hasProgress ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <Card
      className={cn(
        "flex min-w-0 flex-col overflow-hidden",
        style.border,
        className
      )}
      {...props}
    >
      <CardContent className="flex-1 p-5 md:p-6 space-y-3">
        {/* Baris 1: Header Atas (Kategori di Kiri, Badge / Status di Kanan) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/70 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{icon}</span>}
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {title}
            </span>
          </div>
          {badge ? (
            <div className="shrink-0">{badge}</div>
          ) : trend ? (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                trend.positive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
              )}
            >
              {trend.label}
            </span>
          ) : hasProgress ? (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                barWidth >= 70
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
              )}
            >
              {barWidth}%
            </span>
          ) : null}
        </div>

        {/* Baris 2: Nilai Utama / Judul */}
        <div className="break-words text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight tabular-nums">
          {value}
        </div>

        {/* Baris 3: Horizontal Indicator / Progress Bar persis pilar /persiapan */}
        {hasProgress && (
          <div role="progressbar" aria-label={title} aria-valuenow={barWidth} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", style.bar)} style={{ width: `${barWidth}%` }} />
          </div>
        )}

        {/* Baris 4: Deskripsi / Penjelas */}
        {effectiveSubtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            {effectiveSubtitle}
          </p>
        )}
      </CardContent>
      {action && (
        <div className="border-t border-slate-200/60 dark:border-slate-700/60 px-5 md:px-6">
          {action.href ? (
            <Link href={action.href} className="flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-primary-container">
              {action.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm font-semibold text-primary-container">
              {action.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
