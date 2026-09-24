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
  const displayBadge = statusBadge ?? badgeText;
  return (
    <div className={cn("space-y-3", className)}>
      {/* Remah Roti (Breadcrumb) Seragam */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}

      {/* Baris Judul & Aksi Utama yang Terstandarisasi */}
      <div className="flex flex-col gap-4 rounded-[22px] border border-slate-200/75 bg-white/90 px-5 py-5 shadow-[var(--card-shadow)] dark:border-slate-700/65 dark:bg-[#252F40] md:px-6 md:py-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-[1.75rem]">
              {title}
            </h1>
            {displayBadge && (
              <Badge variant={badgeVariant} size="default">
                {displayBadge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="max-w-[68ch] text-[15px] leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 xl:shrink-0">
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
