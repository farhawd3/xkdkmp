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
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[1.5rem] border border-rose-100/80 bg-gradient-to-br from-white via-white to-rose-50/70 p-5 shadow-sm dark:border-slate-700/70 dark:from-[#252F40] dark:via-[#252F40] dark:to-[#303B4F] md:p-7 2xl:flex-row 2xl:items-start 2xl:justify-between">
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
