"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  Scale,
  RotateCcw,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Store,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  AlertOctagon,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, formatTanggal, getTodayWIB } from "@/lib/utils";
import { downloadCsvFile } from "@/lib/csv";
import {
  UnitPerformanceMetric,
  UnitPerformanceSummary,
  PeriodMetadata,
  UnitPerformanceResponse,
} from "@/lib/unit-performance";

export default function KinerjaGeraiPage() {
  const todayWIB = getTodayWIB();
  const defaultMonth = todayWIB.slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [data, setData] = useState<UnitPerformanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { showToast } = useToast();

  const loadPerformanceData = async (monthToLoad = selectedMonth) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/manager/unit-performance?month=${monthToLoad}`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal memuat data kinerja gerai.");
      }
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memuat data kinerja.";
      setLoadError(msg);
      showToast("error", "Gagal Memuat Kinerja", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData(selectedMonth);
  }, [selectedMonth]);

  // Ekstrak daftar unik jenis usaha untuk filter
  const unitTypes = useMemo(() => {
    if (!data?.units) return [];
    return Array.from(new Set(data.units.map((u) => u.unitType))).filter(Boolean);
  }, [data?.units]);

  // Filter data gerai
  const filteredUnits = useMemo(() => {
    if (!data?.units) return [];
    return data.units.filter((unit) => {
      if (statusFilter !== "semua" && unit.status !== statusFilter) {
        return false;
      }
      if (unitTypeFilter !== "semua" && unit.unitType !== unitTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = unit.name.toLowerCase().includes(q);
        const matchCode = unit.code.toLowerCase().includes(q);
        const matchPic = unit.picName.toLowerCase().includes(q);
        const matchLoc = unit.location.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchPic && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [data?.units, statusFilter, unitTypeFilter, searchQuery]);

  const isFilterActive = statusFilter !== "semua" || unitTypeFilter !== "semua" || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter("semua");
    setUnitTypeFilter("semua");
    setSearchQuery("");
  };

  const handleExportCsv = () => {
    if (!data) return;
    const filename = `kinerja-gerai-${data.period.month}`;
    const rows = [
      ["Laporan Kinerja Unit Usaha Koperasi", "Kopdes Merah Putih — Ladang Laweh"],
      ["Periode", data.period.monthLabel],
      ["Hari Kalender Berjalan", `${data.period.calendarDaysElapsed} dari ${data.period.totalDaysInMonth} hari`],
      ["Waktu Ekspor (WIB)", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })],
      [],
      [
        "Kode Gerai",
        "Nama Gerai",
        "Jenis Usaha",
        "Status",
        "PIC",
        "Target Bulanan (Rp)",
        "Realisasi Omset (Rp)",
        "Capaian (%)",
        "Hari Rekap",
        "Keterisian Laporan (%)",
        "Pengeluaran (Rp)",
        "Selisih Operasional (Rp)",
        "Tren vs Bulan Lalu",
        "Kendala Terakhir",
      ],
      ...filteredUnits.map((u) => [
        u.code,
        u.name,
        u.unitType,
        u.status,
        u.picName,
        u.monthlyTarget,
        u.actualRevenue,
        u.targetAchievementPercent !== null ? `${u.targetAchievementPercent}%` : "Belum ditetapkan",
        u.reportedDays,
        u.reportingRatePercent !== null ? `${u.reportingRatePercent}%` : "-",
        u.totalExpenses,
        u.operationalMargin,
        u.comparison.note,
        u.latestIssue || "-",
      ]),
    ];
    downloadCsvFile(filename, rows);
    showToast("success", "Unduh CSV Berhasil", `Berkas ${filename}.csv berhasil diunduh.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge variant="success">Aktif Beroperasi</Badge>;
      case "persiapan":
        return <Badge variant="warning">Tahap Persiapan</Badge>;
      case "rencana":
        return <Badge variant="neutral">Rencana</Badge>;
      case "nonaktif":
        return <Badge variant="neutral">Non-Aktif</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (isLoading && !data) {
    return <LoadingState label="Menghimpun analisis kinerja gerai usaha…" />;
  }

  if (loadError && !data) {
    return <ErrorState message={loadError} onRetry={() => loadPerformanceData(selectedMonth)} />;
  }

  const period = data?.period;
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header Halaman Terpadu */}
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Gerai" },
          { label: "Kinerja Gerai", active: true },
        ]}
        title="Kinerja & Capaian Gerai"
        description="Analisis komparatif target bulanan, kedisiplinan rekapitulasi harian, serta selisih operasional seluruh unit usaha koperasi."
        badgeText="Operational Analytics"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pemilih Bulan */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
              <input
                id="month-selector"
                aria-label="Pilih Bulan Kinerja"
                type="month"
                min="2025-01"
                max="2030-12"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Tombol Refresh */}
            <Button
              variant="outline"
              onClick={() => loadPerformanceData(selectedMonth)}
              disabled={isLoading}
              className="min-h-11 px-3.5 gap-2 font-semibold shadow-sm"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Perbarui</span>
            </Button>

            {/* Tombol Ekspor CSV */}
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={!data || filteredUnits.length === 0}
              className="min-h-11 px-3.5 gap-2 font-semibold shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Unduh CSV</span>
            </Button>
          </div>
        }
      />

      {/* Partial Errors Banner */}
      {data?.partialErrors && data.partialErrors.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs md:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Sebagian Data Belum Lengkap dari Supabase:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800 dark:text-amber-300">
              {data.partialErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4 Kartu Metrik Ringkasan Kinerja Koperasi */}
      {summary && period && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetric
            title="Total Omset Terhimpun"
            value={formatRupiah(summary.totalRevenue)}
            icon={<TrendingUp className="h-4 w-4 text-rose-600" />}
            subtitle={`Akumulasi rekap ${period.monthLabel} (${period.calendarDaysElapsed} hari)`}
            accent="crimson"
          />
          <CardMetric
            title="Capaian Target Koperasi"
            value={summary.overallTargetPercent !== null ? `${summary.overallTargetPercent}%` : "Belum Ada Target"}
            icon={<CheckCircle2 className="h-4 w-4 text-amber-600" />}
            subtitle={
              summary.unitsWithTarget > 0
                ? `${summary.unitsMeetingTarget} dari ${summary.unitsWithTarget} gerai mencapai target`
                : "Target omset gerai belum ditetapkan"
            }
            accent="amber"
          />
          <CardMetric
            title="Rata-rata Keterisian Rekap"
            value={summary.avgReportingRate !== null ? `${summary.avgReportingRate}%` : "0%"}
            icon={<CalendarCheck className="h-4 w-4 text-sky-600" />}
            subtitle={`Dari ${period.calendarDaysElapsed} hari kalender yang telah berjalan`}
            accent="sky"
          />
          <CardMetric
            title="Selisih Operasional"
            value={formatRupiah(summary.totalOperationalMargin)}
            icon={<Scale className="h-4 w-4 text-emerald-600" />}
            subtitle="Omset dikurangi pengeluaran operasional"
            accent={summary.totalOperationalMargin >= 0 ? "emerald" : "crimson"}
          />
        </div>
      )}

      {/* Bilah Filter & Pencarian */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {/* Filter Status Gerai */}
            <div className="space-y-1.5">
              <label htmlFor="filter-status" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status Gerai
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif Beroperasi</option>
                <option value="persiapan">Tahap Persiapan</option>
                <option value="rencana">Rencana</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>

            {/* Filter Jenis Usaha */}
            <div className="space-y-1.5">
              <label htmlFor="filter-type" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jenis Usaha
              </label>
              <select
                id="filter-type"
                value={unitTypeFilter}
                onChange={(e) => setUnitTypeFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="semua">Semua Jenis Usaha</option>
                {unitTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Pencarian Teks */}
            <div className="space-y-1.5">
              <label htmlFor="filter-search" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cari Gerai / PIC / Lokasi
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Cari nama gerai, kode, atau PIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Indikator Filter Aktif */}
          {isFilterActive && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Menampilkan <strong>{filteredUnits.length}</strong> dari <strong>{data?.units.length || 0}</strong> unit gerai.
              </span>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-primary-container h-8">
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content: Tabel Kinerja (Desktop) & Kartu Kinerja (Tablet/Mobile) */}
      {filteredUnits.length === 0 ? (
        <EmptyState
          title={isFilterActive ? "Tidak ada gerai yang cocok" : "Belum Ada Unit Usaha Terdaftar"}
          description={
            isFilterActive
              ? "Coba ubah kriteria pencarian atau pilihan filter di atas."
              : "Daftarkan unit usaha terlebih dahulu melalui modul Daftar & Edit Gerai."
          }
          action={
            isFilterActive ? (
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Tampilan Desktop (Tabel Komparatif) */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/75 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-4">Gerai & PIC</th>
                      <th className="p-4">Status & Jenis</th>
                      <th className="p-4">Target Bulanan</th>
                      <th className="p-4">Realisasi Omset</th>
                      <th className="p-4">Hari Rekap</th>
                      <th className="p-4">Pengeluaran & Selisih</th>
                      <th className="p-4">Tren vs Bulan Lalu</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUnits.map((u) => {
                      const percent = u.targetAchievementPercent;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-4 min-w-[200px]">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {u.code} · PIC: <strong className="text-slate-700 dark:text-slate-300">{u.picName}</strong>
                            </div>
                            {u.latestIssue && (
                              <div className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md inline-block max-w-[240px] truncate" title={u.latestIssue}>
                                ⚠️ {u.latestIssue}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <div>{getStatusBadge(u.status)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{u.unitType}</div>
                          </td>

                          <td className="p-4 font-medium tabular-nums">
                            {u.monthlyTarget > 0 ? (
                              formatRupiah(u.monthlyTarget)
                            ) : (
                              <span className="text-slate-400 italic">Belum ditetapkan</span>
                            )}
                          </td>

                          <td className="p-4 min-w-[170px]">
                            <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                              {formatRupiah(u.actualRevenue)}
                            </div>
                            {percent !== null ? (
                              <div className="mt-1.5 space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>Capaian</span>
                                  <strong className={percent >= 100 ? "text-emerald-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                    {percent}%
                                  </strong>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      percent >= 100
                                        ? "bg-emerald-500"
                                        : percent >= 70
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 mt-1">Tanpa persentase</div>
                            )}
                          </td>

                          <td className="p-4 tabular-nums">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {u.reportedDays} / {u.calendarDaysElapsed} hari
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {u.reportingRatePercent !== null ? `${u.reportingRatePercent}% hari berjalan` : "-"}
                            </div>
                          </td>

                          <td className="p-4 tabular-nums min-w-[160px]">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Keluar: {formatRupiah(u.totalExpenses)}
                            </div>
                            <div
                              className={`font-bold mt-0.5 ${
                                u.operationalMargin >= 0
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              Selisih: {formatRupiah(u.operationalMargin)}
                            </div>
                          </td>

                          <td className="p-4 text-xs">
                            {u.comparison.isFair ? (
                              <div className="flex items-center gap-1.5">
                                {u.comparison.growthPercent !== null && u.comparison.growthPercent > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : u.comparison.growthPercent !== null && u.comparison.growthPercent < 0 ? (
                                  <TrendingDown className="h-4 w-4 text-rose-600 shrink-0" />
                                ) : (
                                  <Minus className="h-4 w-4 text-slate-400 shrink-0" />
                                )}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {u.comparison.note}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] leading-tight block">
                                {u.comparison.note}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <Link
                              href={`/monitoring?unitId=${u.id}`}
                              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <span>Rekap</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Tampilan Tablet / Mobile (Kartu Responsif Berjenjang) */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredUnits.map((u) => {
              const percent = u.targetAchievementPercent;
              return (
                <Card key={u.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{u.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.code} · PIC: <strong>{u.picName}</strong>
                      </p>
                    </div>
                    {getStatusBadge(u.status)}
                  </div>

                  {u.latestIssue && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
                      <strong>Kendala Terbaru:</strong> {u.latestIssue}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Target Bulanan</span>
                      <strong className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                        {u.monthlyTarget > 0 ? formatRupiah(u.monthlyTarget) : "Belum ditentukan"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Realisasi Omset</span>
                      <strong className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatRupiah(u.actualRevenue)}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar Target */}
                  {percent !== null && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Pencapaian Target</span>
                        <strong className={percent >= 100 ? "text-emerald-600 font-bold" : "text-slate-800 dark:text-slate-200"}>
                          {percent}%
                        </strong>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percent >= 100
                              ? "bg-emerald-500"
                              : percent >= 70
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Hari Rekap Masuk</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {u.reportedDays} dari {u.calendarDaysElapsed} hari
                      </strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {u.reportingRatePercent !== null ? `(${u.reportingRatePercent}% hari)` : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Selisih Operasional</span>
                      <strong
                        className={`text-sm tabular-nums font-bold ${
                          u.operationalMargin >= 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {formatRupiah(u.operationalMargin)}
                      </strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Keluar: {formatRupiah(u.totalExpenses)}
                      </span>
                    </div>
                  </div>

                  {/* Tren Perbandingan */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[11px]">Tren vs Bulan Lalu:</span>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-300 font-medium">
                      {u.comparison.note}
                    </p>
                  </div>

                  {/* Tombol Aksi 1-Klik */}
                  <div className="pt-2">
                    <Link
                      href={`/monitoring?unitId=${u.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>Lihat Riwayat Rekap Gerai</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Catatan Transparansi & Kejujuran Data */}
      <Card className="bg-slate-50/60 dark:bg-slate-900/40 border-dashed">
        <CardContent className="p-4 md:p-5 flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Catatan Metodologi & Kejujuran Data:
            </p>
            <p>
              1. <strong>Capaian Target</strong> dihitung murni dari akumulasi rekapitulasi harian yang tersimpan di Supabase. Gerai tanpa target diberi keterangan &quot;Belum ditetapkan&quot; dan tidak dinilai 0%.
            </p>
            <p>
              2. <strong>Keterisian Laporan</strong> menggunakan pembagi hari kalender yang telah berjalan. Karena jadwal libur resmi per unit belum dibakukan, rasio ini mencerminkan kehadiran catatan harian.
            </p>
            <p>
              3. <strong>Selisih Operasional</strong> adalah omset dikurangi pengeluaran operasional tercatat. Nilai ini belum memperhitungkan HPP lengkap, depresiasi aset, atau beban pajak, sehingga bukan merupakan laba bersih resmi maupun SHU koperasi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
