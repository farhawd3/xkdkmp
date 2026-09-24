"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, BookOpen, CheckCircle2, Scale, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardMetric } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatRupiah } from "@/lib/utils";
import type { FinanceSummaryResponse } from "@/lib/finance-insights";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { FinanceRegister } from "@/components/keuangan/FinanceRegister";

export default function LaporanPage() {
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
      if (!response.ok) throw new Error(body.error || "Laporan belum dapat dibaca.");
      setData(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Laporan belum dapat dibaca.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState label="Memeriksa kesiapan laporan keuangan…" />;
  if (error || !data) return <ErrorState message={error || "Data belum tersedia."} onRetry={load} />;

  const { summary, accountingReadiness } = data;
  const captured = Math.min(3, Number(summary.reportCount > 0) + Number(summary.cashReportsCount > 0) + Number(summary.totalMembers > 0));

  return <div className="space-y-5 pb-6">
    <PageHeader
      breadcrumbItems={[{ label: "Keuangan & Laporan" }, { label: "Neraca & SHU", active: true }]}
      title="Kesiapan Neraca & SHU"
      description={`Pantau data yang tersedia untuk tahun buku ${profile.fiscal_year || "belum ditetapkan"} dan kebutuhan sebelum menyusun laporan resmi koperasi.`}
    />

    <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div><h2 className="font-bold">Neraca dan SHU resmi belum dapat dihitung</h2><p className="mt-1 text-sm leading-relaxed">{accountingReadiness.reason} Angka di bawah adalah rekap operasional untuk pemantauan, bukan laporan yang siap disahkan Rapat Anggota.</p></div>
    </div>

    <section aria-label="Angka operasional tersedia" className="grid gap-3 sm:grid-cols-3">
      <CardMetric title="Omset tercatat" value={formatRupiah(summary.totalGrossRevenue)} subtitle={`${summary.reportCount} rekap gerai`} accent="sky" />
      <CardMetric title="Pengeluaran tercatat" value={formatRupiah(summary.totalExpenses)} subtitle="Belum mencakup seluruh biaya dan pajak" accent="amber" />
      <CardMetric title="Selisih operasional" value={formatRupiah(summary.netOperationalMargin)} subtitle="Bukan SHU atau laba bersih" accent="emerald" />
    </section>

    <FinanceRegister />

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Alur menuju buku besar dan Neraca resmi</CardTitle><CardDescription>Buku rekap di atas adalah bahan pemeriksaan awal, bukan saldo akun.</CardDescription></CardHeader><CardContent className="grid gap-3 text-sm md:grid-cols-3">
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><strong>1. Jurnal berpasangan</strong><p className="mt-1 text-slate-600 dark:text-slate-300">Setiap transaksi dicatat sebagai debit dan kredit dengan dokumen sumber; totalnya harus seimbang.</p></div>
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><strong>2. Buku besar per akun</strong><p className="mt-1 text-slate-600 dark:text-slate-300">Jurnal dikelompokkan ke akun kas, bank, persediaan, utang, modal, pendapatan, dan beban.</p></div>
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><strong>3. Neraca &amp; SHU</strong><p className="mt-1 text-slate-600 dark:text-slate-300">Saldo akhir dan penyesuaian menjadi dasar laporan posisi keuangan dan hasil usaha untuk ditinjau pengurus.</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200 md:col-span-3">Opsi tambah akun dan jurnal resmi memerlukan enam tabel baru. Draf SQL sudah disiapkan, tetapi belum dijalankan di Supabase; sistem akan memberi tahu sebelum perubahan database diterapkan.</p>
    </CardContent></Card>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />Neraca: data yang belum ada</CardTitle><CardDescription>Neraca mensyaratkan aset = liabilitas + ekuitas dari pencatatan lengkap, bukan angka penyeimbang buatan.</CardDescription></CardHeader><CardContent>
        <ul className="space-y-2 text-sm">{accountingReadiness.missingRecords.slice(0, 6).map((item) => <li key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />{item}</li>)}</ul>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />SHU: belum ada dasar pembagian</CardTitle><CardDescription>Persentase dan nominal pembagian tidak boleh ditetapkan otomatis oleh website.</CardDescription></CardHeader><CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>SHU tahunan memerlukan pendapatan dikurangi biaya, penyusutan, kewajiban lain, dan pajak pada tahun buku bersangkutan. Pembagian sesudah dana cadangan mengikuti keputusan Rapat Anggota.</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">Keputusan RAT tentang alokasi SHU dan data jasa anggota belum tercatat. Karena itu tidak ada simulasi persentase atau nilai Rp yang ditampilkan.</div>
        <Link href="/keuangan" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary">Lihat pemantauan keuangan <ArrowUpRight className="h-4 w-4" /></Link>
      </CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle>Jejak data yang sudah masuk</CardTitle><CardDescription>Indikator ketersediaan, bukan skor audit atau tingkat kepatuhan akuntansi.</CardDescription></CardHeader><CardContent className="space-y-4">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-label={`${captured} dari 3 kelompok data dasar terisi`}><div className="h-full rounded-full bg-sky-400" style={{ width: `${captured / 3 * 100}%` }} /></div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        {[
          { label: "Rekap gerai", ready: summary.reportCount > 0, detail: `${summary.reportCount} rekap` },
          { label: "Nilai setoran dilaporkan", ready: summary.cashReportsCount > 0, detail: `${summary.cashReportsCount} rekap; belum rekonsiliasi bank` },
          { label: "Daftar anggota", ready: summary.totalMembers > 0, detail: `${summary.totalMembers} anggota; belum buku simpanan` },
        ].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="flex items-center gap-2 font-semibold">{item.ready ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}{item.label}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p></div>)}
      </div>
    </CardContent></Card>
  </div>;
}
