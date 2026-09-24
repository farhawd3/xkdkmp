"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Database, FilePenLine, Link2Off, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatRupiah } from "@/lib/utils";
import type { FinanceSummaryResponse } from "@/lib/finance-insights";
import { useOrganizationProfile } from "@/lib/OrganizationContext";

export default function KeuanganPage() {
  const { profile } = useOrganizationProfile();
  const [data, setData] = useState<FinanceSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/finance/summary", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Data keuangan belum dapat dibaca.");
      setData(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data keuangan belum dapat dibaca.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState label="Membaca rekap keuangan gerai…" />;
  if (error || !data) return <ErrorState message={error || "Data belum tersedia."} onRetry={load} />;

  const { summary } = data;
  const max = Math.max(1, ...summary.dailyTrend.map((day) => day.revenue));
  const hasReports = summary.dailyTrend.some((day) => day.reports > 0);

  return <div className="space-y-5 pb-6">
    <PageHeader
      breadcrumbItems={[{ label: "Keuangan & Laporan" }, { label: "Pemantauan Keuangan", active: true }]}
      title="Pemantauan Keuangan"
      description="Angka operasional dari rekap gerai. Belum menjadi buku besar, saldo kas, atau laporan keuangan resmi."
      actions={<Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Perbarui</Button>}
    />

    <section aria-label="Sumber data keuangan" className="grid gap-3 md:grid-cols-2">
      <Card className="border-rose-200 dark:border-rose-800"><CardContent className="flex items-start gap-3 p-5">
        <FilePenLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div><p className="font-semibold">Input manual · aktif</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Rekap diisi dan diperbarui melalui Pemantauan Gerai, lalu tersimpan di Supabase.</p>
          <Link href="/monitoring" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Buka formulir rekap <ArrowUpRight className="h-4 w-4" /></Link>
        </div></CardContent></Card>
      <Card className="bg-slate-50/80 opacity-70 dark:bg-slate-800/40"><CardContent className="flex items-start gap-3 p-5">
        <Link2Off className="mt-0.5 h-5 w-5 shrink-0" />
        <div><p className="font-semibold">API gerai · belum aktif</p><p className="mt-1 text-sm">Kunci dapat disiapkan di Pengaturan, tetapi format dan konektor gerai belum tersedia. Input manual tetap aktif agar angka tidak terputus.</p><Link href="/pengaturan" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Lihat persiapan API <ArrowUpRight className="h-4 w-4" /></Link></div>
      </CardContent></Card>
    </section>

    {profile.bank_name && <p className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-200">Rekening referensi: <strong>{profile.bank_name}</strong>{profile.bank_account_number ? ` · •••• ${profile.bank_account_number.replace(/\D/g, "").slice(-4)}` : ""}. Ini data profil, <strong>bukan saldo bank yang sudah diverifikasi</strong>.</p>}

    <section aria-label="Ringkasan rekap gerai" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CardMetric title="Omset tercatat" value={formatRupiah(summary.totalGrossRevenue)} subtitle="Seluruh rekap yang terbaca" accent="sky" />
      <CardMetric title="Pengeluaran tercatat" value={formatRupiah(summary.totalExpenses)} subtitle="Belum termasuk seluruh biaya akuntansi" accent="crimson" />
      <CardMetric title="Selisih operasional" value={formatRupiah(summary.netOperationalMargin)} subtitle="Bukan laba bersih atau SHU" accent="emerald" />
      <CardMetric title="Setoran dilaporkan" value={formatRupiah(summary.reportedCashTotal)} subtitle={`${summary.cashReportsCount} rekap mencantumkan setoran; belum direkonsiliasi`} accent="amber" />
    </section>

    <Card><CardHeader><CardTitle>Tren omset tujuh hari</CardTitle><CardDescription>Hanya rekap yang tersimpan. Hari tanpa rekap bukan berarti omset nol.</CardDescription></CardHeader><CardContent>
      {hasReports ? <div className="grid grid-cols-7 items-end gap-2" aria-label="Grafik omset tujuh hari">
        {summary.dailyTrend.map((day) => <div key={day.date} className="flex min-w-0 flex-col items-center gap-2">
          <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">{day.reports} rekap</span>
          <div className="flex h-36 w-full max-w-14 items-end rounded-t-lg bg-rose-50 dark:bg-slate-800"><div className="w-full rounded-t-lg bg-rose-300 dark:bg-rose-400/70" style={{ height: `${Math.max(0, day.revenue / max * 100)}%` }} /></div>
          <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{day.date.slice(8)}/{day.date.slice(5, 7)}</span>
        </div>)}
      </div> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Belum ada rekap tujuh hari terakhir.</p>}
      <details className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700"><summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">Lihat angka per hari</summary><dl className="border-t border-slate-200 p-4 text-sm dark:border-slate-700">{summary.dailyTrend.map((day) => <div key={day.date} className="flex flex-wrap justify-between gap-2 py-1"><dt>{day.date} · {day.reports} rekap</dt><dd className="font-semibold tabular-nums">{formatRupiah(day.revenue)}</dd></div>)}</dl></details>
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Batas data akuntansi</CardTitle></CardHeader><CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data.accountingReadiness.reason} <Link href="/laporan" className="font-semibold text-primary underline underline-offset-4">Lihat kesiapan Neraca & SHU</Link>.</CardContent></Card>
  </div>;
}
