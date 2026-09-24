"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Activity, ClipboardList, Download, Package, RefreshCw, Store, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardMetric } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useResource } from "@/lib/useResource";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import { formatRupiah } from "@/lib/utils";
import { downloadCsvFile } from "@/lib/csv";
import { managerActions, managerSnapshotRows, reportingProgress, type DashboardSummary, type FocusCategory } from "@/lib/manager-summary";

async function loadSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/executive", { cache: "no-store" });
  if (!response.ok) throw new Error("Ringkasan manajemen belum dapat diakses.");
  return response.json();
}

function RevenueTrend({ data }: { data: DashboardSummary["dailyTrend"] }) {
  const maximum = Math.max(1, ...data.map((day) => day.revenue));
  const total = data.reduce((sum, day) => sum + day.revenue, 0);
  const hasRevenue = data.some((day) => day.revenue > 0);
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Omset tujuh hari terakhir</CardTitle>
        <CardDescription>Total tercatat {formatRupiah(total)}. Hari tanpa rekap belum tentu berarti tidak ada penjualan.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {hasRevenue ? <div className="flex h-40 items-end gap-2 sm:gap-4" aria-hidden="true">
          {data.map((day) => (
            <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div title={formatRupiah(day.revenue)} className="w-full max-w-12 rounded-t-lg bg-rose-200 dark:bg-rose-400/60" style={{ height: `${day.revenue / maximum * 80}%`, minHeight: day.revenue > 0 ? 3 : 0 }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{day.date.slice(8)}/{day.date.slice(5, 7)}</span>
            </div>
          ))}
        </div> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Belum ada omset yang tercatat dalam tujuh hari ini</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bila gerai sudah beroperasi, periksa apakah rekap harian sudah diisi.</p>
          <Link href="/monitoring" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">Buka pemantauan gerai <ArrowUpRight className="h-4 w-4" /></Link>
        </div>}
        <details className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">Rincian angka per hari</summary>
          <dl className="space-y-2 border-t border-slate-100 px-4 py-4 text-sm dark:border-slate-700">
            {data.map((day) => <div key={day.date} className="flex flex-wrap justify-between gap-2"><dt>{day.date}</dt><dd className="font-semibold tabular-nums">{formatRupiah(day.revenue)}</dd></div>)}
          </dl>
        </details>
      </CardContent>
    </Card>
  );
}

function ReportingTrend({ data }: { data: NonNullable<DashboardSummary["reportingTrend"]> }) {
  const total = data[0]?.total ?? 0;
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Keterisian rekap tujuh hari</CardTitle>
        <CardDescription>Jumlah gerai aktif saat ini yang memiliki rekap pada tiap tanggal. Bukan penilaian hari operasional.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {total === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
            Belum ada gerai aktif. Grafik keterisian akan tersedia setelah ada gerai berstatus aktif.
          </div>
        ) : (
          <div className="flex h-40 items-end gap-2 sm:gap-4" aria-label="Grafik keterisian rekap tujuh hari">
            {data.map((day) => (
              <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${day.date}: ${day.reported} dari ${day.total} gerai aktif`}>
                <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">{day.reported}/{day.total}</span>
                <div className="flex h-24 w-full max-w-12 items-end rounded-t-lg bg-sky-50 dark:bg-slate-800">
                  <div className="w-full rounded-t-lg bg-sky-500/75 dark:bg-sky-400/70" style={{ height: `${day.percent ?? 0}%` }} />
                </div>
                <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{day.date.slice(8)}/{day.date.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Hitungan per gerai unik; rekap ganda pada satu tanggal tidak menambah jumlah. Jadwal hari tutup belum tercatat.</p>
        <Link href="/kinerja-gerai" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">Lihat kinerja gerai <ArrowUpRight className="h-4 w-4" /></Link>
      </CardContent>
    </Card>
  );
}

export function ProductionDashboard() {
  const { data, loading, error, reload } = useResource(loadSummary);
  const { profile, error: profileError } = useOrganizationProfile();
  const [category, setCategory] = useState<FocusCategory>("semua");
  if (error) return <ErrorState message="Ringkasan belum dapat dimuat. Periksa koneksi dan akses database, lalu coba lagi." onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Membaca ringkasan manajemen koperasi…" />;

  const progress = reportingProgress(data);
  const actions = managerActions(data).filter((item) => category === "semua" || item.category === category);
  const dateLabel = data.businessDate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date(`${data.businessDate}T00:00:00+07:00`)) : "Ringkasan hari ini";
  const updated = data.generatedAt ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(data.generatedAt)) : null;

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-5 shadow-sm dark:border-slate-700/70 dark:bg-[#252F40] md:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ruang kerja manajer · {dateLabel}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">Selamat bekerja, {profile.manager_name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.display_name} · {updated ? `Diperbarui ${updated} WIB` : "Berdasarkan rekap tersimpan"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Button variant="outline" onClick={reload}><RefreshCw className="mr-2 h-4 w-4" />Perbarui</Button>
          <Button onClick={() => downloadCsvFile(`ringkasan-manajer-${data.businessDate ?? "terbaru"}`, managerSnapshotRows(data, profile.display_name))}><Download className="mr-2 h-4 w-4" />Unduh CSV</Button>
        </div>
      </header>
      {profileError && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{profileError} Identitas yang ditampilkan mungkin belum terbaru.</p>}

      <section aria-label="Indikator utama" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CardMetric title="Omset bulan berjalan" value={formatRupiah(data.monthRevenue)} subtitle="Akumulasi rekap sampai hari ini" icon={<Activity className="h-5 w-5" />} accent="crimson" action={{ href: "/monitoring", label: "Lihat rekap" }} />
        <CardMetric title="Pelaporan hari ini" value={`${progress.reported} / ${progress.total}`} subtitle={progress.total ? "Gerai aktif yang sudah melapor" : "Belum ada gerai aktif"} progress={progress.percent ?? undefined} icon={<Store className="h-5 w-5" />} accent="sky" action={{ href: "/monitoring", label: "Catat laporan" }} />
        <CardMetric title="Tugas belum selesai" value={data.activeTasks} subtitle={`${data.overdueTaskCount ?? 0} lewat tenggat · ${data.todayDueTaskCount ?? 0} jatuh tempo hari ini`} icon={<ClipboardList className="h-5 w-5" />} accent="amber" action={{ href: "/pekerjaan", label: "Kelola tugas" }} />
        <CardMetric title="Stok perlu perhatian" value={data.lowStockCount ?? 0} subtitle="Barang pada atau di bawah batas minimum" icon={<Package className="h-5 w-5" />} accent="emerald" action={{ href: "/stok", label: "Periksa stok" }} />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><CardTitle>Fokus & tindak lanjut</CardTitle><CardDescription>Tugas mendesak, laporan gerai, dan stok yang perlu ditinjau.</CardDescription></div>
              <div className="w-full shrink-0 sm:w-48"><Select aria-label="Kategori tindak lanjut" value={category} onChange={(event) => setCategory(event.target.value as FocusCategory)} options={[{ value: "semua", label: "Semua kategori" }, { value: "tugas", label: "Tugas" }, { value: "gerai", label: "Pelaporan gerai" }, { value: "stok", label: "Stok barang" }]} /></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">{actions.length} tindak lanjut ditampilkan. Cuplikan prioritas cepat.</p>
              <Link href="/meja-kerja" className="inline-flex min-h-8 items-center gap-1 text-xs font-bold text-primary hover:underline">
                Buka Meja Kerja Lengkap <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {actions.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Tidak ada tindak lanjut pada kategori ini berdasarkan data yang tercatat. Tetap periksa kelengkapan rekap gerai.</div> :
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {actions.map((item) => <li key={item.id}><Link href={item.href} className="group flex min-h-16 items-start justify-between gap-3 rounded-xl px-2 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="min-w-0 space-y-1.5"><div className="flex flex-wrap items-center gap-2"><span className="break-words text-sm font-semibold">{item.title}</span><Badge variant={item.category === "gerai" ? "info" : "warning"}>{item.label}</Badge></div><p className="text-sm text-slate-500 dark:text-slate-400">{item.detail}</p><span className="text-xs font-semibold text-primary">Buka {item.category === "tugas" ? "daftar tugas" : item.category === "gerai" ? "pemantauan gerai" : "stok barang"}</span></div>
                  <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                </Link></li>)}
              </ul>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Catatan bulan berjalan</CardTitle><CardDescription>Rekap operasional, bukan laporan akuntansi lengkap.</CardDescription></CardHeader><CardContent className="space-y-4 pt-2">
            <dl className="space-y-4 text-sm"><div><dt className="text-slate-500 dark:text-slate-400">Pengeluaran tercatat</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{formatRupiah(data.monthExpenses)}</dd></div><div><dt className="text-slate-500 dark:text-slate-400">Selisih omset & pengeluaran</dt><dd className={`mt-1 text-xl font-semibold tabular-nums ${data.monthProfit < 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>{formatRupiah(data.monthProfit)}</dd></div></dl>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Belum memperhitungkan seluruh HPP, aset, atau kewajiban. Selisih ini bukan saldo kas, laba bersih, maupun SHU resmi.</p><ButtonLink href="/keuangan" variant="outline" className="w-full">Tinjau catatan keuangan</ButtonLink>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Data & persiapan</CardTitle></CardHeader><CardContent className="space-y-2 pt-2">
            {[{ href: "/unit-usaha", label: `${data.totalUnits} gerai terdaftar`, icon: Store }, { href: "/anggota", label: `${data.totalMembers} anggota terdaftar`, icon: Users }, { href: "/pengaturan", label: "Profil & cadangan data", icon: Download }].map((item) => <Link key={item.href} href={item.href} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><item.icon className="h-4 w-4 text-primary" />{item.label}<ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" /></Link>)}
          </CardContent></Card>
        </div>
      </div>
      <section aria-label="Tren tujuh hari" className="grid items-start gap-4 lg:grid-cols-2">
        <RevenueTrend data={data.dailyTrend} />
        {data.reportingTrend && <ReportingTrend data={data.reportingTrend} />}
      </section>
    </div>
  );
}
