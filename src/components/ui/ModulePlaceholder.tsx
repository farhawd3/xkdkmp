import { ButtonLink } from "@/components/ui/Button";
import React from "react";
import Link from "next/link";
import { Hammer, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

export interface ModulePlaceholderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  category: string;
  description: string;
  targetPhase: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  breadcrumbs,
  title,
  category,
  description,
  targetPhase,
}) => {
  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <Badge variant="warning">Tahap Pengembangan</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <ButtonLink href="/dashboard" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </ButtonLink>
      </div>

      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <CardContent className="flex flex-col items-center justify-center p-8 md:p-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4 shadow-sm border border-amber-200 dark:border-amber-800/60">
            <Hammer className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            Modul {title} Dijadwalkan pada {targetPhase}
          </h2>
          <p className="max-w-lg text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Sesuai dokumen rencana kerja <em>docs/STATUS.md</em>, fondasi arsitektur modul {title} telah
            disiapkan. Antarmuka operasional penuh dan validasi data server-side akan diaktifkan
            secara bertahap menjelang operasional awal 2027.
          </p>
          <div className="flex items-center gap-3">
            <ButtonLink href="/persiapan" variant="primary" className="gap-2">
                Lihat Kesiapan Pembukaan
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
