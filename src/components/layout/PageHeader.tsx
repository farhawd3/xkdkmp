"use client";

import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RelatedPages } from "./RelatedPages";

export interface PageHeaderProps {
  breadcrumbItems?: BreadcrumbItem[];
  title: string;
  badgeText?: string;
  statusBadge?: string;
  badgeVariant?: "crimson" | "success" | "warning" | "info" | "neutral";
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbItems,
  title,
  badgeText,
  statusBadge,
  badgeVariant = "crimson",
  description,
  actions,
  children,
  className,
}) => {
  const displayBadge = statusBadge ?? badgeText ?? "Mode Persiapan";
  return (
    <div className={cn("space-y-4", className)}>
      {/* Remah Roti (Breadcrumb) Seragam */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}

      {/* Baris Judul & Aksi Utama yang Terstandarisasi */}
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-rose-50/60 p-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 md:p-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              {title}
            </h1>
            {displayBadge && (
              <Badge variant={badgeVariant} size="default">
                {displayBadge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:pt-1">
            {actions}
          </div>
        )}
      </div>

      <RelatedPages />

      {/* Konten Tambahan (Tab Bar, Alert Disclaimer, atau Filter Khusus) */}
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
};
