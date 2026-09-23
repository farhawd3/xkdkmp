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
  X,
  LogOut,
  LogIn,
  LucideIcon,
} from "lucide-react";
import { NAVIGATION_GROUPS, APP_CONFIG } from "@/lib/constants";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Badge } from "@/components/ui/Badge";
import { getActiveNavigationHref } from "@/lib/navigation";
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
};

export interface SidebarProps {
  onItemClick?: () => void;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, onClose, className }) => {
  const pathname = usePathname();
  const activeHref = getActiveNavigationHref(pathname);
  const user = useCurrentUser();

  return (
    <div
      className={cn(
        "flex h-full w-64 xl:w-72 flex-col border-r border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 select-none shrink-0 transition-colors",
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
              {APP_CONFIG.shortName}
            </h1>
            <p className="text-xs font-bold text-primary-container dark:text-rose-400 uppercase tracking-wider mt-0.5">
              {APP_CONFIG.status}
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
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-3.5 pr-2.5 pt-3 pb-5 space-y-4 scrollbar-thin scrollbar-gutter-stable">
        {NAVIGATION_GROUPS.map((group) => (
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
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all min-h-[44px]",
                      isActive
                        ? "bg-rose-50/90 dark:bg-rose-950/50 text-primary dark:text-rose-300 font-bold shadow-sm"
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
      </div>

      {/* User Info Footer */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm transition-colors",
              user.isLoggedIn
                ? "bg-primary-container text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            )}
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.roleLabel}
            </p>
          </div>
          {user.isLoggedIn ? (
            <Link
              href="/auth/logout"
              title="Keluar dari sistem"
              aria-label="Keluar dari sistem"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              title="Masuk ke sistem"
              aria-label="Masuk ke sistem"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-container hover:bg-rose-50 dark:hover:bg-slate-800 dark:text-rose-300 transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
