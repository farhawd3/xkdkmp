import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">404 — Halaman Tidak Ditemukan</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Tautan rute yang Anda tuju tidak tersedia atau telah dipindahkan dalam restrukturisasi modul
        Kopdes Ladang Laweh.
      </p>
      <div className="mt-8">
        <ButtonLink href="/dashboard" variant="primary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </ButtonLink>
      </div>
    </div>
  );
}
