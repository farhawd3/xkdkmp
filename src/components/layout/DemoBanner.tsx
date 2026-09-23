import React from "react";
import { Info } from "lucide-react";

/** Status organisasi berbeda dari kemampuan prototipe. */
export const DemoBanner: React.FC = () => (
  <aside aria-label="Status aplikasi" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-rose-100 dark:border-slate-700 bg-rose-50 dark:bg-slate-800 px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
    <span className="flex items-center gap-2"><Info className="h-4 w-4 shrink-0" /><strong>Persiapan · Target awal 2027</strong><span className="hidden md:inline">Tanggal pembukaan belum ditetapkan.</span></span>
    <span>Prototipe · Data contoh sesi, belum permanen</span>
  </aside>
);
