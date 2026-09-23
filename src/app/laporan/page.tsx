"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  TrendingUp,
  PieChart,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatRupiah } from "@/lib/utils";

interface FinanceData {
  summary: {
    totalGrossRevenue: number;
    totalExpenses: number;
    currentShu: number;
    totalMembers: number;
  };
  neraca: {
    aset: {
      kasBank: number;
      kasTunai: number;
      persediaanBarang: number;
      totalAsetLancar: number;
      asetTetap: number;
      totalAset: number;
    };
    kewajiban: {
      utangUsaha: number;
      utangLancarLainnya: number;
      totalKewajiban: number;
    };
    ekuitas: {
      modalAwal: number;
      shuBerjalan: number;
      totalEkuitas: number;
    };
    isBalanced: boolean;
  };
  alokasiShu: {
    cadangan: number;
    jasaUsaha: number;
    jasaModal: number;
    pengurus: number;
    pendidikan: number;
    sosial: number;
  };
}

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<"neraca" | "labarugi" | "shu">("neraca");
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/summary", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data laporan keuangan.");
      const data = await res.json();
      setFinance(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  if (loading) return <LoadingState label="Menghitung laporan neraca dan SHU koperasi…" />;
  if (error || !finance) return <ErrorState message={error || "Gagal memuat data."} onRetry={loadFinanceData} />;

  const { neraca, summary, alokasiShu } = finance;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Keuangan & Laporan" },
          { label: "Neraca & SHU", active: true },
        ]}
        title="Pemantauan Neraca & Sisa Hasil Usaha (SHU)"
        badgeText="Laporan Keuangan"
        badgeVariant="crimson"
        description="Pantau posisi keuangan neraca (aset, kewajiban, modal), perolehan laba kotor gerai, dan simulasi alokasi pembagian SHU anggota koperasi."
      />

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("neraca")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "neraca"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Posisi Keuangan (Neraca)</span>
        </button>

        <button
          onClick={() => setActiveTab("labarugi")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "labarugi"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Laba Rugi & SHU Berjalan</span>
        </button>

        <button
          onClick={() => setActiveTab("shu")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "shu"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Alokasi Pembagian SHU</span>
        </button>
      </div>

      {/* TAB 1: POSISI KEUANGAN (NERACA) */}
      {activeTab === "neraca" && (
        <div className="space-y-6">
          {/* Banner Status Keseimbangan */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 sm:p-5 dark:border-emerald-950 dark:from-[#1E293B] dark:to-[#1B3329] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Neraca Seimbang Sempurna (Balance)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Total Aset = Total Kewajiban + Ekuitas Modal ({formatRupiah(neraca.aset.totalAset)})
                </p>
              </div>
            </div>
            <Badge variant="success">SEIMBANG</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sisi Kiri: ASET */}
            <Card className="border-sky-100 bg-white dark:border-slate-700 dark:bg-[#252F40]">
              <CardHeader className="bg-sky-50/50 dark:bg-slate-800/40 border-b border-sky-100 dark:border-slate-700 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base text-sky-900 dark:text-sky-200 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-sky-600" />
                    ASET KOPERASI
                  </CardTitle>
                  <span className="font-bold text-sky-900 dark:text-sky-200">
                    {formatRupiah(neraca.aset.totalAset)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">1. Aset Lancar</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Kas di Bank (Operasional & Simpanan)</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(neraca.aset.kasBank)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Kas Tunai di Bendahara (Setoran Gerai)</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(neraca.aset.kasTunai)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Persediaan Barang Dagangan Gerai</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(neraca.aset.persediaanBarang)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold bg-slate-50 dark:bg-slate-900/40 px-2 rounded-lg">
                      <span>Total Aset Lancar</span>
                      <span className="text-sky-700 dark:text-sky-300">{formatRupiah(neraca.aset.totalAsetLancar)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">2. Aset Tetap</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Perlengkapan Etalase, Rak & Fasilitas Gerai</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(neraca.aset.asetTetap)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sisi Kanan: KEWAJIBAN & EKUITAS */}
            <Card className="border-rose-100 bg-white dark:border-slate-700 dark:bg-[#252F40]">
              <CardHeader className="bg-rose-50/50 dark:bg-slate-800/40 border-b border-rose-100 dark:border-slate-700 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-rose-600" />
                    KEWAJIBAN & EKUITAS
                  </CardTitle>
                  <span className="font-bold text-rose-900 dark:text-rose-200">
                    {formatRupiah(neraca.kewajiban.totalKewajiban + neraca.ekuitas.totalEkuitas)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">1. Kewajiban (Utang)</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Utang Usaha / Operasional</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Rp 0</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold bg-slate-50 dark:bg-slate-900/40 px-2 rounded-lg">
                      <span>Total Kewajiban</span>
                      <span className="text-slate-600 dark:text-slate-400">Rp 0 (Bebas Utang)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">2. Ekuitas / Modal Koperasi</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Modal Awal & Simpanan Anggota</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(neraca.ekuitas.modalAwal)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">SHU Berjalan (Hasil Operasional Gerai)</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">+{formatRupiah(neraca.ekuitas.shuBerjalan)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold bg-rose-50 dark:bg-slate-900/40 px-2 rounded-lg">
                      <span>Total Ekuitas Modal</span>
                      <span className="text-rose-700 dark:text-rose-300">{formatRupiah(neraca.ekuitas.totalEkuitas)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: LABA RUGI & SHU BERJALAN */}
      {activeTab === "labarugi" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#252F40]">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-500">Omset Penjualan Kotor</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatRupiah(summary.totalGrossRevenue)}</h3>
                <p className="text-xs text-slate-500 mt-1">Akumulasi seluruh laporan gerai</p>
              </CardContent>
            </Card>

            <Card className="border-rose-100 bg-rose-50/40 dark:border-slate-700 dark:bg-[#252F40]">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">Beban Biaya Operasional</p>
                <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">{formatRupiah(summary.totalExpenses)}</h3>
                <p className="text-xs text-rose-700 mt-1">Belanja operasional gerai</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/50 dark:border-slate-700 dark:bg-[#252F40]">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">SHU Bersih Berjalan</p>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{formatRupiah(summary.currentShu)}</h3>
                <p className="text-xs text-emerald-700 mt-1">Omset dikurangi beban</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Rincian Perhitungan Laba / Sisa Hasil Usaha
              </CardTitle>
              <CardDescription>
                Dihitung secara real-time dari data rekapitulasi harian gerai yang masuk ke database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold">Pendapatan Omset Penjualan Gerai</span>
                <span className="font-bold">{formatRupiah(summary.totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600">
                <span>Total Pengeluaran Kas Operasional Gerai</span>
                <span className="font-bold">- {formatRupiah(summary.totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-3 bg-emerald-50/70 dark:bg-slate-900/60 p-3 rounded-xl font-bold text-base text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-slate-700">
                <span>Sisa Hasil Usaha (SHU) Berjalan</span>
                <span>{formatRupiah(summary.currentShu)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ALOKASI PEMBAGIAN SHU */}
      {activeTab === "shu" && (
        <div className="space-y-6">
          <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/50 dark:border-slate-700 dark:from-[#252F40] dark:to-[#38232F]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary-container" />
                    Simulasi Alokasi Pembagian SHU Koperasi
                  </CardTitle>
                  <CardDescription>
                    Sesuai standar persentase Anggaran Dasar / Anggaran Rumah Tangga (AD/ART) Koperasi.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Total SHU Dibagikan:</span>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(summary.currentShu)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Dana Cadangan (40%)</span>
                    <Badge variant="neutral">40%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatRupiah(alokasiShu.cadangan)}</h4>
                  <p className="text-xs text-slate-500">Memperkuat modal &amp; perlindungan usaha</p>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Jasa Anggota / Usaha (25%)</span>
                    <Badge variant="success">25%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">{formatRupiah(alokasiShu.jasaUsaha)}</h4>
                  <p className="text-xs text-slate-500">Berdasarkan keaktifan belanja di gerai</p>
                </div>

                <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/30 dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase">Jasa Modal Simpanan (20%)</span>
                    <Badge variant="info">20%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-sky-900 dark:text-sky-200">{formatRupiah(alokasiShu.jasaModal)}</h4>
                  <p className="text-xs text-slate-500">Berdasarkan simpanan pokok &amp; wajib</p>
                </div>

                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Pengurus &amp; Pengawas (5%)</span>
                    <Badge variant="warning">5%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-amber-900 dark:text-amber-200">{formatRupiah(alokasiShu.pengurus)}</h4>
                  <p className="text-xs text-slate-500">Insentif kinerja manajemen tim</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Dana Pendidikan (5%)</span>
                    <Badge variant="neutral">5%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatRupiah(alokasiShu.pendidikan)}</h4>
                  <p className="text-xs text-slate-500">Pelatihan &amp; pembinaan anggota</p>
                </div>

                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 dark:border-slate-700 dark:bg-slate-900/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Dana Sosial Nagari (5%)</span>
                    <Badge variant="danger">5%</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-rose-900 dark:text-rose-200">{formatRupiah(alokasiShu.sosial)}</h4>
                  <p className="text-xs text-slate-500">Manfaat sosial nagari Ladang Laweh</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
