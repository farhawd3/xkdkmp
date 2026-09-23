"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getActiveNavigationHref, PRODUCTION_READY_ROUTES, SEARCH_MODULES } from "@/lib/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const RELATED: Record<string, string[]> = {
  "/dashboard": ["/pekerjaan", "/monitoring", "/laporan"],
  "/pekerjaan": ["/monitoring", "/dashboard", "/unit-usaha"],
  "/monitoring": ["/unit-usaha", "/dashboard", "/keuangan"],
  "/unit-usaha": ["/monitoring", "/stok", "/pekerjaan"],
  "/stok": ["/monitoring", "/unit-usaha", "/keuangan"],
  "/keuangan": ["/laporan", "/monitoring", "/anggota"],
  "/laporan": ["/keuangan", "/monitoring", "/dashboard"],
  "/anggota": ["/keuangan", "/tata-kelola"],
  "/persiapan": ["/pekerjaan", "/tata-kelola", "/unit-usaha"],
  "/tata-kelola": ["/persiapan", "/pekerjaan", "/pengaturan"],
  "/pengaturan": ["/tata-kelola", "/bantuan"],
  "/bantuan": ["/dashboard", "/monitoring", "/pengaturan"],
};

export function RelatedPages() {
  const pathname = usePathname();
  const routes = (RELATED[getActiveNavigationHref(pathname) ?? ""] ?? []).filter(
    (href) => !isSupabaseConfigured() || PRODUCTION_READY_ROUTES.has(href)
  );
  if (routes.length === 0) return null;
  return (
    <nav aria-label="Halaman terkait" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200/70 pt-2 dark:border-slate-700/70">
      <span className="text-xs text-slate-500 dark:text-slate-400">Lanjutkan ke</span>
      {routes.map((href) => (
        <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-container dark:text-slate-300">
          {SEARCH_MODULES.find((item) => item.href === href)?.title}
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      ))}
    </nav>
  );
}
