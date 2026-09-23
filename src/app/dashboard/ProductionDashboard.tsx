"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Store,
  ClipboardList,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useResource } from "@/lib/useResource";
import { formatRupiah } from "@/lib/utils";

interface TrendDay {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface UrgentTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  pic_name: string;
  business_units?: { name: string } | null;
}

interface UnreportedUnit {
  id: string;
  name: string;
}

interface DashboardSummary {
  totalUnits: number;
  activeUnits: number;
  totalMembers: number;
  activeTasks: number;
  urgentTasks: number;
  urgentTaskList: UrgentTask[];
  todayReports: number;
  monthRevenue: number;
  monthExpenses: number;
  monthProfit: number;
  dailyTrend: TrendDay[];
  unreportedUnits: UnreportedUnit[];
  businessStatus: string;
}

async function loadSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/executive", { cache: "no-store" });
  if (!response.ok) throw new Error("Ringkasan manajemen belum dapat diakses.");
  return response.json() as Promise<DashboardSummary>;
}

/** Mini bar chart CSS murni untuk tren omset 7 hari */
function MiniTrendChart({ data }: { data: TrendDay[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((day) => {
        const heightPercent = Math.max((day.revenue / maxRevenue) * 100, 4);
        const dayOfWeek = new Date(day.date).getDay();
        const dayLabel = HARI[dayOfWeek];
        const dayNum = day.date.split("-")[2];

        return (
          <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex flex-col items-center justify-end h-20">
              {day.revenue > 0 && (
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5 truncate w-full text-center">
                  {(day.revenue / 1_000_000).toFixed(1)}jt
                </span>
              )}
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-rose-400 to-rose-300 dark:from-rose-600 dark:to-rose-500 transition-all duration-500"
                style={{ height: `${heightPercent}%`, minHeight: "3px" }}
              />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">{dayLabel}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">{dayNum}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductionDashboard() {
  const { data, loading, error, reload } = useResource(loadSummary);

  if (error) {
    return (
      <ErrorState
        message="Ringkasan pemantauan database belum dapat dimuat. Periksa sesi masuk dan izin Supabase."
        onRetry={reload}
      />
    );
  }

  if (loading || !data) {
    return <LoadingState label="Membaca ringkasan manajemen koperasi dari Supabase…" />;
  }

  const totalWeekRevenue = data.dailyTrend.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Menu Utama" },
          { label: "Dashboard Manajer", active: true },
        ]}
        title="Dashboard Pemantauan Manajer"
        badgeText="Panel Eksekutif"
        badgeVariant="crimson"
        description="Pantau kinerja seluruh gerai, rekapitulasi omset, tugas operasional prioritas, dan kesiapan pembukaan koperasi Ladang Laweh."
      />

      {/* 4 Kartu Metrik Utama Ber-Gradient Pastel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Kartu 1: Gerai Koperasi */}
        <Card className="border-rose-100/80 bg-gradient-to-br from-white to-rose-50/80 dark:border-rose-950/60 dark:from-[#252F40] dark:to-[#38232F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">Unit Usaha & Gerai</p>
                <h3 className="text-2xl font-bold text-rose-950 dark:text-rose-100 mt-1">
                  {data.totalUnits} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Unit</span>
                </h3>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                  {data.activeUnits > 0 ? `${data.activeUnits} unit aktif` : "Tahap persiapan & rencana"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300">
                <Store className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-slate-700">
              <Link href="/unit-usaha" className="text-xs font-bold text-primary-container dark:text-rose-300 flex items-center gap-1 hover:underline">
                Kelola data gerai <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kartu 2: Omset Bulan Berjalan */}
        <Card className="border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/80 dark:border-emerald-950/60 dark:from-[#252F40] dark:to-[#1B3329]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Omset Bulan Ini</p>
                <h3 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 mt-1">
                  {formatRupiah(data.monthRevenue)}
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                  Laba: {formatRupiah(data.monthProfit)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/60 dark:border-slate-700">
              <Link href="/monitoring" className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 hover:underline">
                Buka pemantauan gerai <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kartu 3: Tugas Prioritas */}
        <Card className="border-amber-100/80 bg-gradient-to-br from-white to-amber-50/80 dark:border-amber-950/60 dark:from-[#252F40] dark:to-[#382D1D]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Tugas Operasional</p>
                <h3 className="text-2xl font-bold text-amber-950 dark:text-amber-100 mt-1">
                  {data.activeTasks} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Aktif</span>
                </h3>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                  {data.urgentTasks > 0 ? `⚠️ ${data.urgentTasks} tugas mendesak` : "Semua prioritas terkendali"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/60 dark:border-slate-700">
              <Link href="/pekerjaan" className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline">
                Atur tugas & instruksi <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kartu 4: Data Anggota */}
        <Card className="border-sky-100/80 bg-gradient-to-br from-white to-sky-50/80 dark:border-sky-950/60 dark:from-[#252F40] dark:to-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">Data Anggota</p>
                <h3 className="text-2xl font-bold text-sky-950 dark:text-sky-100 mt-1">
                  {data.totalMembers} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Jiwa</span>
                </h3>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80 mt-1">
                  Warga nagari terdaftar
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-100/60 dark:border-slate-700">
              <Link href="/anggota" className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1 hover:underline">
                Lihat daftar anggota <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Informasi & Aksi Manajer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 Span): Tren & Operasional */}
        <div className="lg:col-span-2 space-y-5">

          {/* Grafik Tren Omset 7 Hari */}
          <Card className="border-rose-100/60 bg-gradient-to-br from-white to-rose-50/40 dark:border-slate-700 dark:from-[#252F40] dark:to-[#2D2535]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                  Tren Omset 7 Hari Terakhir
                </CardTitle>
                <CardDescription>
                  Total minggu ini: <strong className="text-slate-900 dark:text-slate-100">{formatRupiah(totalWeekRevenue)}</strong>
                </CardDescription>
              </div>
              <Link href="/monitoring">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                  Lihat Detail
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              <MiniTrendChart data={data.dailyTrend} />
            </CardContent>
          </Card>

          {/* Kartu Status Pelaporan Gerai Hari Ini */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  Kepatuhan Pelaporan Gerai Hari Ini
                </CardTitle>
                <CardDescription>
                  {data.todayReports} dari {data.totalUnits} gerai sudah menyetor rekap hari ini.
                </CardDescription>
              </div>
              <Link href="/monitoring">
                <Button variant="primary" size="sm" className="h-8 text-xs font-semibold gap-1">
                  + Input Rekap
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {/* Progress kepatuhan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Tingkat Kepatuhan
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {data.totalUnits > 0 ? Math.round((data.todayReports / data.totalUnits) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${data.totalUnits > 0 ? (data.todayReports / data.totalUnits) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Daftar gerai belum lapor */}
              {data.unreportedUnits.length > 0 && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                      {data.unreportedUnits.length} Gerai Belum Lapor Hari Ini:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.unreportedUnits.map((unit) => (
                      <span
                        key={unit.id}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                      >
                        {unit.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.unreportedUnits.length === 0 && data.totalUnits > 0 && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    Semua gerai sudah menyetor rekapitulasi hari ini. Bagus!
                  </span>
                </div>
              )}

              {/* Ringkasan keuangan operasional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Omset Bulan Ini:</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {formatRupiah(data.monthRevenue)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pengeluaran Kas:</span>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {formatRupiah(data.monthExpenses)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Estimasi Laba Kotor:</span>
                  <p className={`text-lg font-bold mt-1 ${data.monthProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                    {formatRupiah(data.monthProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daftar Tugas Mendesak Langsung di Dashboard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  Tugas Prioritas Tinggi & Mendesak
                </CardTitle>
                <CardDescription>
                  {data.urgentTaskList.length > 0
                    ? `${data.urgentTaskList.length} tugas memerlukan perhatian segera`
                    : "Belum ada tugas dengan prioritas tinggi atau mendesak."}
                </CardDescription>
              </div>
              <Link href="/pekerjaan">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                  Kelola Semua Tugas
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2 space-y-2.5">
              {data.urgentTaskList.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Semua berjalan normal</p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">Total {data.activeTasks} tugas aktif terkendali.</p>
                  </div>
                </div>
              ) : (
                data.urgentTaskList.map((task) => (
                  <Link
                    key={task.id}
                    href="/pekerjaan"
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${
                      task.priority === "mendesak"
                        ? "border-rose-200 bg-gradient-to-r from-white to-rose-50/50 hover:border-rose-300 dark:border-rose-900/50 dark:from-[#252F40] dark:to-[#38232F]"
                        : "border-amber-200 bg-gradient-to-r from-white to-amber-50/40 hover:border-amber-300 dark:border-amber-900/50 dark:from-[#252F40] dark:to-[#382D1D]"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      task.priority === "mendesak"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300"
                    }`}>
                      {task.priority === "mendesak" ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{task.title}</h4>
                        <Badge variant={task.priority === "mendesak" ? "danger" : "warning"}>
                          {task.priority === "mendesak" ? "🔥 Mendesak" : "Tinggi"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {task.pic_name}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.due_date}
                          </span>
                        )}
                        {task.business_units?.name && (
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" /> {task.business_units.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan (1 Span): Akses Cepat */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#252F40]">
            <CardHeader>
              <CardTitle className="text-base">Aksi Cepat Manajer</CardTitle>
              <CardDescription>Pintas navigasi ke modul utama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/monitoring"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Activity className="h-4 w-4 text-rose-600" /> Input Rekap Gerai
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/unit-usaha"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Store className="h-4 w-4 text-primary-container" /> Edit &amp; Sesuaikan Gerai
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/pekerjaan"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" /> Tambah Instruksi / Tugas
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/stok"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-emerald-600" /> Pantau Angka Stok Barang
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/anggota"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-sky-600" /> Data &amp; Jumlah Anggota
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/keuangan"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 transition-all dark:border-slate-700 dark:hover:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-indigo-600" /> Kas & Buku Besar
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50/60 dark:border-slate-700 dark:from-[#252F40] dark:to-[#1E293B]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-600" />
                Panduan Sistem Manajer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>Pelajari SOP tata kelola, cara pengisian rekap harian gerai, dan manajemen penugasan.</p>
              <div className="pt-2">
                <Link href="/bantuan" className="font-semibold text-sky-700 dark:text-sky-300 hover:underline flex items-center gap-1">
                  Buka panduan lengkap <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100/60 bg-gradient-to-br from-white to-rose-50/40 dark:border-slate-700 dark:from-[#252F40] dark:to-[#38232F]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-primary-container shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 dark:text-rose-200 space-y-1">
                  <p className="font-bold">Sistem Pemantauan Terpusat:</p>
                  <p className="leading-relaxed">
                    Website ini bertindak sebagai pusat pemantauan berkala bagi manajer. Data operasional gerai dimasukkan setiap hari secara manual melalui menu <strong>Pemantauan Gerai</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
