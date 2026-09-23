import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const trail = items.filter((item) => item.href !== "/" && item.href !== "/dashboard");
  return (
    <nav
      aria-label="Lokasi halaman"
      className={cn("flex items-center text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium", className)}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary-container dark:hover:text-rose-400 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {trail.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            {item.active || !item.href ? (
              <span className="text-slate-900 dark:text-slate-100 font-semibold" aria-current={index === trail.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-500 dark:text-slate-400 hover:text-primary-container dark:hover:text-rose-400 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
