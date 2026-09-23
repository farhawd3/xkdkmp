"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  PlusCircle,
  History,
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatRupiah } from "@/lib/utils";

interface UnitOption {
  id: string;
  name: string;
  code: string;
  location: string;
}

interface DailyReportRecord {
  id: string;
  unit_id: string;
  report_date: string;
  gross_revenue: string;
  operational_expenses: string;
  net_profit: string;
  transaction_count: number;
  cash_in_hand: string;
  operational_notes: string | null;
  source_type: string;
  created_at: string;
  business_units?: { name: string; code: string } | null;
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<"input" | "riwayat">("input");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [reports, setReports] = useState<DailyReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Input Rekapitulasi Manual
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [grossRevenue, setGrossRevenue] = useState("");
  const [operationalExpenses, setOperationalExpenses] = useState("");
  const [cashInHand, setCashInHand] = useState("");
  const [transactionCount, setTransactionCount] = useState("0");
  const [operationalNotes, setOperationalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter Riwayat
  const [filterUnitId, setFilterUnitId] = useState("semua");

  const { showToast } = useToast();

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsRes, reportsRes] = await Promise.all([
        fetch("/api/units", { cache: "no-store" }),
        fetch("/api/monitoring/records", { cache: "no-store" }),
      ]);

      if (!unitsRes.ok) throw new Error("Gagal mengambil daftar gerai.");
      const unitsData = await unitsRes.json();
      const unitList = unitsData.units || [];
      setUnits(unitList);
      if (unitList.length > 0 && !selectedUnitId) {
        setSelectedUnitId(unitList[0].id);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Hitung perkiraan laba kotor secara otomatis
  const revenueNum = parseFloat(grossRevenue) || 0;
  const expenseNum = parseFloat(operationalExpenses) || 0;
  const estimatedProfit = revenueNum - expenseNum;

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) {
      showToast("error", "Pilih Gerai", "Pilih unit usaha/gerai yang dilaporkan.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        unit_id: selectedUnitId,
        report_date: reportDate,
        gross_revenue: revenueNum.toFixed(2),
        operational_expenses: expenseNum.toFixed(2),
        cash_in_hand: (parseFloat(cashInHand) || 0).toFixed(2),
        transaction_count: parseInt(transactionCount, 10) || 0,
        operational_notes: operationalNotes.trim(),
        source_type: "manual",
      };

      const res = await fetch("/api/monitoring/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan rekap harian.");

      showToast(
        "success",
        "Rekap Berhasil Disimpan",
        `Laporan tanggal ${reportDate} berhasil dicatat.`
      );

      // Bersihkan form
      setGrossRevenue("");
      setOperationalExpenses("");
      setCashInHand("");
      setTransactionCount("0");
      setOperationalNotes("");

      // Muat ulang riwayat
      const reportsRes = await fetch("/api/monitoring/records", { cache: "no-store" });
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }
      setActiveTab("riwayat");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter laporan riwayat
  const filteredReports = reports.filter((r) => {
    return filterUnitId === "semua" || r.unit_id === filterUnitId;
  });

  const totalFilteredRevenue = filteredReports.reduce((sum, r) => sum + (parseFloat(r.gross_revenue) || 0), 0);
  const totalFilteredExpense = filteredReports.reduce((sum, r) => sum + (parseFloat(r.operational_expenses) || 0), 0);
  const totalFilteredProfit = filteredReports.reduce((sum, r) => sum + (parseFloat(r.net_profit) || 0), 0);

  if (loading) return <LoadingState label="Memuat modul pemantauan gerai…" />;
  if (error) return <ErrorState message={error} onRetry={loadInitialData} />;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Gerai" },
          { label: "Pemantauan Gerai", active: true },
        ]}
        title="Pusat Pemantauan Operasional Gerai"
        badgeText="Monitoring Manajer"
        badgeVariant="crimson"
        description="Pencatatan dan pemantauan rekapitulasi penjualan harian, pengeluaran kas operasional, dan kendala seluruh gerai koperasi."
      />

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("input")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "input"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Input Rekap Harian (Manual)</span>
        </button>

        <button
          onClick={() => setActiveTab("riwayat")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "riwayat"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Riwayat Rekapitulasi Gerai ({filteredReports.length})</span>
        </button>
      </div>

      {/* TAB 1: FORM INPUT MANUAL REKAP HARIAN */}
      {activeTab === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  Formulir Rekapitulasi Harian Gerai
                </CardTitle>
                <CardDescription>
                  Diisi setiap sore / penutupan operasional gerai oleh manajer atau petugas unit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveReport} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Pilih Gerai / Unit Usaha"
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tanggal Laporan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Omset Penjualan Kotor (Rp) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={grossRevenue}
                        onChange={(e) => setGrossRevenue(e.target.value)}
                        placeholder="Contoh: 1500000"
                        className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Total uang hasil penjualan barang hari ini.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pengeluaran Kas / Biaya Operasional (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={operationalExpenses}
                        onChange={(e) => setOperationalExpenses(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Belanja stok mendadak, ongkir, kantong plastik, dll.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kas Fisik di Kasir / Uang Setoran (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={cashInHand}
                        onChange={(e) => setCashInHand(e.target.value)}
                        placeholder="Contoh: 1350000"
                        className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Uang fisik yang disetorkan ke kas utama koperasi.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Estimasi Jumlah Transaksi / Pembeli
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={transactionCount}
                        onChange={(e) => setTransactionCount(e.target.value)}
                        placeholder="Contoh: 45"
                        className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-slate-500 mt-1">Perkiraan jumlah transaksi atau struk belanja.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan Kendala Lapangan & Evaluasi
                    </label>
                    <textarea
                      rows={3}
                      value={operationalNotes}
                      onChange={(e) => setOperationalNotes(e.target.value)}
                      placeholder="Contoh: Beras medium 5kg habis pukul 14:00, pelanggan banyak menanyakan minyak goreng..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto min-h-11 px-8 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{submitting ? "Menyimpan ke Supabase..." : "Simpan Rekapitulasi Harian"}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Kartu Kalkulasi Langsung Sisi Kanan */}
          <div className="space-y-4">
            <Card className="border-rose-100/90 bg-gradient-to-br from-white to-rose-50/70 dark:border-slate-700 dark:from-[#252F40] dark:to-[#38232F]">
              <CardHeader>
                <CardTitle className="text-base">Kalkulasi Otomatis</CardTitle>
                <CardDescription>Hasil hitungan sementara dari angka yang diketik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-rose-100/70 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Omset Kotor:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatRupiah(revenueNum)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100/70 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Pengeluaran:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">- {formatRupiah(expenseNum)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-rose-200/60 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Estimasi Laba Kotor:</span>
                  <span className={`text-base font-extrabold ${estimatedProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                    {formatRupiah(estimatedProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100/80 bg-gradient-to-br from-white to-sky-50/60 dark:border-slate-700 dark:from-[#252F40] dark:to-[#1E293B]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-sky-600" />
                  Petunjuk Pengisian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>• Data ini langsung tersimpan ke Supabase dan memperbarui grafik dashboard manajer.</p>
                <p>• Jika terjadi selisih antara kas fisik dan laba, tuliskan keterangannya pada kolom Catatan Kendala Lapangan.</p>
                <p>• Laporan dapat diperbarui kapan saja jika ada revisi rekapitulasi.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT REKAPITULASI */}
      {activeTab === "riwayat" && (
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
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Laba Operasional Akumulatif</p>
                <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{formatRupiah(totalFilteredProfit)}</h4>
              </CardContent>
            </Card>
          </div>

          {/* Filter Baris */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-64">
                <Select
                  label="Filter Gerai"
                  value={filterUnitId}
                  onChange={(e) => setFilterUnitId(e.target.value)}
                  options={[
                    { value: "semua", label: "Semua Gerai / Unit Usaha" },
                    ...units.map((u) => ({ value: u.id, label: u.name })),
                  ]}
                />
              </div>
              <div className="text-xs text-slate-500">
                Menampilkan <strong>{filteredReports.length}</strong> catatan laporan.
              </div>
            </CardContent>
          </Card>

          {/* Tabel Riwayat */}
          {filteredReports.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada riwayat rekap harian</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Silakan beralih ke tab &ldquo;Input Rekap Harian (Manual)&rdquo; untuk menambahkan laporan pertama.
              </p>
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
                          Tanggal Laporan: <strong>{report.report_date}</strong>
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
                      <span className="text-slate-500 dark:text-slate-400">Laba Kotor:</span>
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

                  {report.operational_notes && (
                    <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
                      <strong>Catatan / Kendala Lapangan:</strong> {report.operational_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
