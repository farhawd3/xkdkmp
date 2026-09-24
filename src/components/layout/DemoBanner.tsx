"use client";

import React from "react";
import { Info, ShieldCheck } from "lucide-react";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { businessStatusLabel } from "@/lib/organization-status";

/** Status organisasi berbeda dari kemampuan prototipe. */
const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const DemoBanner: React.FC = () => {
  const { profile } = useOrganizationProfile();
  return (
  <aside
    aria-label="Status aplikasi"
    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-rose-100 dark:border-slate-700 bg-rose-50 dark:bg-slate-800 px-4 py-2 text-xs text-slate-600 dark:text-slate-300"
  >
    <span className="flex items-center gap-2">
      <Info className="h-4 w-4 shrink-0 text-primary-container dark:text-rose-400" />
      <strong>{businessStatusLabel(profile.business_status)}</strong>
      <span className="hidden md:inline">{profile.region || "Wilayah kerja belum diisi"}</span>
    </span>
    <span className="flex items-center gap-1.5 font-medium">
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>
        {hasSupabase
          ? "Aplikasi Pribadi Manajer · Supabase Dikonfigurasi"
          : "Aplikasi Pribadi Manajer · Akses Privat Lokal"}
      </span>
    </span>
  </aside>
  );
};
