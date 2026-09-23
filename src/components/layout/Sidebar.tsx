"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Store,
  Package,
  Archive,
  ShoppingBag,
  CreditCard,
  Wallet,
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Building2,
  Truck,
  Activity,
  ClipboardList,
  Scale,
  X,
  LucideIcon,
} from "lucide-react";
import { NAVIGATION_GROUPS, APP_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { getActiveNavigationHref, PRODUCTION_READY_ROUTES } from "@/lib/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CheckSquare,
  Users,
  Store,
  Package,
  Archive,
  ShoppingBag,
  CreditCard,
  Wallet,
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Truck,
  Activity,
  ClipboardList,
  Scale,
};

export interface SidebarProps {
  onItemClick?: () => void;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, onClose, className }) => {
  const pathname = usePathname();
  const activeHref = getActiveNavigationHref(pathname);
  const productionMode = isSupabaseConfigured();
  const { profile } = useOrganizationProfile();

  const orgName = profile.display_name || APP_CONFIG.shortName;
  const statusLabel = profile.business_status === "aktif" ? "Operasional Aktif" : "Mode Persiapan";
  const managerName = profile.manager_name || "Abdul Halim";
  const managerTitle = profile.manager_title || "Manajer Koperasi";
  const initials = managerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "AH";

  const visibleGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: productionMode ? group.items.filter((item) => PRODUCTION_READY_ROUTES.has(item.href)) : group.items,
  })).filter((group) => group.items.length > 0);

  return (
    <div
      className={cn(
        "flex h-full w-64 xl:w-72 flex-col border-r border-slate-200/80 dark:border-slate-700/70 bg-white/95 dark:bg-[#252F40] select-none shrink-0 transition-colors",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white shadow-md shadow-rose-900/20 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {orgName}
            </h1>
            <p className="text-xs font-bold text-primary-container dark:text-rose-400 uppercase tracking-wider mt-0.5">
              {statusLabel}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Tutup navigasi"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups - dengan pb-5 agar item paling bawah (Pengaturan) selalu terangkat naik dan terlihat jelas */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-3.5 pr-2.5 pt-4 pb-5 space-y-5 scrollbar-thin scrollbar-gutter-stable">
        {visibleGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <h2 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.groupName}
            </h2>
            <nav aria-label={group.groupName} className="space-y-1">
              {group.items.map((item) => {
                const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                const isActive =
                  activeHref === item.href;

                const badgeVariantMap = {
                  crimson: "crimson" as const,
                  amber: "warning" as const,
                  info: "info" as const,
                  neutral: "neutral" as const,
                };

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors min-h-[48px]",
                      isActive
                        ? "bg-rose-50 dark:bg-rose-400/10 text-primary dark:text-rose-200 font-bold ring-1 ring-rose-100 dark:ring-rose-300/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                      <IconComponent
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-primary-container dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <div className="shrink-0 ml-2">
                        <Badge
                          variant={item.badgeType ? badgeVariantMap[item.badgeType] : "neutral"}
                          size="default"
                        >
                          {item.badge}
                        </Badge>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        {productionMode && (
          <p className="mx-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            Menu transaksi dan administrasi akan tampil setelah integrasi Supabase serta pemeriksaan izinnya selesai.
          </p>
        )}
      </div>

      {/* Manager Profile Footer — Aplikasi Pribadi */}
      <div className="px-4 py-3.5 border-t border-slate-100 dark:border-slate-700/70 bg-slate-50/60 dark:bg-[#252F40] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm bg-primary-container text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{managerName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {managerTitle}
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
              Pribadi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
