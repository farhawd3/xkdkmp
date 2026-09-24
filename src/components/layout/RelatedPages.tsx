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
    <nav aria-label="Halaman terkait" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">Terkait</span>
      {routes.map((href) => (
        <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:text-primary dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:text-rose-200">
          {SEARCH_MODULES.find((item) => item.href === href)?.title}
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      ))}
    </nav>
  );
}
