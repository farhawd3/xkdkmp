"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Store,
  Search,
  RotateCcw,
  Download,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  formatRupiah,
  formatTanggal,
  getTodayWIB,
  getDaysAgoWIB,
  getCurrentYearMonthWIB,
} from "@/lib/utils";
import { downloadCsvFile } from "@/lib/csv";
import { DailyReportRecord, UnitOption } from "@/types/models";

export interface MonitoringHistoryTableProps {
  reports: DailyReportRecord[];
  units: UnitOption[];
  onConvertIssueToTask: (report: DailyReportRecord) => void;
}

export const MonitoringHistoryTable: React.FC<MonitoringHistoryTableProps> = ({
  reports,
  units,
  onConvertIssueToTask,
}) => {
  const [filterUnitId, setFilterUnitId] = useState("semua");
  const [filterPeriod, setFilterPeriod] = useState<"semua" | "hari_ini" | "7_hari" | "bulan_ini">("semua");
  const [filterIssue, setFilterIssue] = useState<"semua" | "ada_kendala" | "tanpa_catatan">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const { showToast } = useToast();

  const todayWIB = getTodayWIB();
  const sevenDaysAgoWIB = getDaysAgoWIB(6);
  const currentMonthWIB = getCurrentYearMonthWIB();

  const isFilterActive =
    filterUnitId !== "semua" ||
    filterPeriod !== "semua" ||
    filterIssue !== "semua" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setFilterUnitId("semua");
    setFilterPeriod("semua");
    setFilterIssue("semua");
    setSearchQuery("");
  };

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      // 1. Filter Gerai
      if (filterUnitId !== "semua" && r.unit_id !== filterUnitId) return false;

      // 2. Filter Periode
      if (filterPeriod === "hari_ini" && r.report_date !== todayWIB) return false;
      if (filterPeriod === "7_hari" && (r.report_date < sevenDaysAgoWIB || r.report_date > todayWIB)) return false;
      if (filterPeriod === "bulan_ini" && !r.report_date.startsWith(currentMonthWIB)) return false;

      // 3. Filter Kendala
      if (filterIssue === "ada_kendala" && (!r.operational_notes || r.operational_notes.trim() === "")) return false;
      if (filterIssue === "tanpa_catatan" && r.operational_notes && r.operational_notes.trim() !== "") return false;

      // 4. Pencarian teks
      if (q) {
        const unitName = (r.business_units?.name || "").toLowerCase();
        const notes = (r.operational_notes || "").toLowerCase();
        const date = r.report_date.toLowerCase();
        if (!unitName.includes(q) && !notes.includes(q) && !date.includes(q)) return false;
      }

      return true;
    });
  }, [reports, filterUnitId, filterPeriod, filterIssue, searchQuery, todayWIB, sevenDaysAgoWIB, currentMonthWIB]);

  const totalFilteredRevenue = filteredReports.reduce((sum, r) => sum + (parseFloat(r.gross_revenue) || 0), 0);
  const totalFilteredExpense = filteredReports.reduce((sum, r) => sum + (parseFloat(r.operational_expenses) || 0), 0);
  const totalFilteredProfit = filteredReports.reduce((sum, r) => sum + (parseFloat(r.net_profit) || 0), 0);

  const handleExportCsv = () => {
    if (filteredReports.length === 0) {
      showToast("error", "Tidak Ada Data", "Tidak ada laporan terfilter untuk diekspor.");
      return;
    }

    const headers = [
      "Tanggal",
      "Gerai",
      "Kode Gerai",
      "Omset Kotor (Rp)",
      "Pengeluaran (Rp)",
      "Selisih Operasional (Rp)",
      "Uang Setoran Kas (Rp)",
      "Jumlah Transaksi",
      "Sumber",
      "Catatan / Kendala Lapangan",
    ];

    const rows = filteredReports.map((r) => [
      r.report_date,
      r.business_units?.name || "-",
      r.business_units?.code || "-",
      r.gross_revenue,
      r.operational_expenses,
      r.net_profit,
      r.cash_in_hand,
      r.transaction_count,
      r.source_type === "manual" ? "Input Manual" : "API",
      r.operational_notes || "",
    ]);

    downloadCsvFile(`rekapitulasi-gerai-${todayWIB}.csv`, [headers, ...rows]);
    showToast("success", "Ekspor Berhasil", "Berkas CSV telah diunduh ke perangkat Anda.");
  };

  return (
    <div className="space-y-4">
      {/* Ringkasan 3 Metrik Terfilter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#252F40]">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Omset Tercatat</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatRupiah(totalFilteredRevenue)}</h4>
          </CardContent>
        </Card>
        <Card className="border-rose-100 bg-rose-50/40 dark:border-slate-700 dark:bg-[#252F40]">
          <CardContent className="p-4">
            <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase">Total Pengeluaran Kas</p>
            <h4 className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1">{formatRupiah(totalFilteredExpense)}</h4>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/40 dark:border-slate-700 dark:bg-[#252F40]">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Selisih Operasional Akumulatif</p>
            <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{formatRupiah(totalFilteredProfit)}</h4>
          </CardContent>
        </Card>
      </div>

      {/* Bilah Filter dan Pencarian Terpadu */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Filter Gerai */}
            <Select
              label="Filter Gerai"
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              options={[
                { value: "semua", label: "Semua Gerai / Unit Usaha" },
                ...units.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />

            {/* 2. Filter Periode */}
            <Select
              label="Periode Waktu"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as "semua" | "hari_ini" | "7_hari" | "bulan_ini")}
              options={[
                { value: "semua", label: "Semua Periode" },
                { value: "hari_ini", label: "Hari Ini (WIB)" },
                { value: "7_hari", label: "7 Hari Terakhir" },
                { value: "bulan_ini", label: "Bulan Ini" },
              ]}
            />

            {/* 3. Filter Catatan Kendala */}
            <Select
              label="Status Kendala"
              value={filterIssue}
              onChange={(e) => setFilterIssue(e.target.value as "semua" | "ada_kendala" | "tanpa_catatan")}
              options={[
                { value: "semua", label: "Semua Laporan" },
                { value: "ada_kendala", label: "⚠️ Hanya yang Ada Kendala" },
                { value: "tanpa_catatan", label: "Hanya Tanpa Catatan" },
              ]}
            />

            {/* 4. Pencarian Teks */}
            <div>
              <label htmlFor="search-notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cari Catatan / Gerai
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="search-notes"
                  type="search"
                  placeholder="Kata kunci catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-600 dark:bg-[#1D2533] dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Status Hasil & Tombol Aksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan <strong>{filteredReports.length}</strong> dari {reports.length} catatan laporan.
              </span>
              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filter
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredReports.length === 0}
              className="min-h-11 sm:min-h-9 gap-1.5 font-bold text-xs"
            >
              <Download className="h-3.5 w-3.5 text-primary-container" />
              Ekspor CSV ({filteredReports.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel / Daftar Riwayat */}
      {filteredReports.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isFilterActive ? "Tidak ada laporan yang cocok dengan filter" : "Belum ada riwayat rekap harian"}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {isFilterActive
              ? "Coba ubah kriteria periode, gerai, atau hapus kata pencarian untuk melihat data lainnya."
              : "Silakan beralih ke tab Input Rekap Harian (Manual) untuk menambahkan laporan pertama."}
          </p>
          {isFilterActive && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="min-h-11 gap-1.5 font-semibold">
                <RotateCcw className="h-4 w-4" /> Hapus Semua Filter
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/80 dark:bg-[#252F40] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container/10 text-primary-container dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {report.business_units?.name || "Unit Usaha"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tanggal Laporan: <strong>{formatTanggal(report.report_date)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="neutral">
                    Sumber: {report.source_type === "manual" ? "✍️ Input Manual" : "⚡ API Kasir"}
                  </Badge>
                  <Badge variant="info">
                    {report.transaction_count} Transaksi
                  </Badge>
                </div>
              </div>

              {/* Metrik Nilai Uang */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Omset Kotor:</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                    {formatRupiah(parseFloat(report.gross_revenue) || 0)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Pengeluaran:</span>
                  <p className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                    {formatRupiah(parseFloat(report.operational_expenses) || 0)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Selisih Operasional:</span>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                    {formatRupiah(parseFloat(report.net_profit) || 0)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Uang Setoran:</span>
                  <p className="font-bold text-sky-700 dark:text-sky-400 text-sm mt-0.5">
                    {formatRupiah(parseFloat(report.cash_in_hand) || 0)}
                  </p>
                </div>
              </div>

              {/* Panel Catatan Kendala Lapangan & Tombol Tindak Lanjut Jadi Tugas */}
              {report.operational_notes && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
                  <div className="space-y-1">
                    <strong className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      Catatan / Kendala Lapangan:
                    </strong>
                    <p className="leading-relaxed pl-5 sm:pl-5">{report.operational_notes}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConvertIssueToTask(report)}
                    className="min-h-11 sm:min-h-9 shrink-0 gap-1.5 font-bold text-xs bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
                  >
                    <ClipboardList className="h-4 w-4 text-amber-600" />
                    Jadikan Tugas
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
