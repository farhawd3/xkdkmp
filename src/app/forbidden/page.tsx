import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-primary-container dark:text-rose-400 mb-6 shadow-sm border border-rose-200 dark:border-rose-900/60">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">403 — Akses Dibatasi</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Maaf, Anda tidak memiliki izin hak akses (*role*) untuk membuka modul ini. Hubungi
        Administrator Sistem atau Pengurus Koperasi Desa Ladang Laweh jika membutuhkan otorisasi.
      </p>
      <div className="mt-8">
        <ButtonLink href="/dashboard" variant="primary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Utama
          </ButtonLink>
      </div>
    </div>
  );
}
