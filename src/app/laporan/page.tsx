"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Scale,
  PieChart,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Download,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardMetric,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { formatRupiah } from "@/lib/utils";
import { preparationRepository } from "@/lib/repository";
import { FinancialReportSummary, CashAccount } from "@/types";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<"labarugi" | "neraca" | "aruskas" | "shu">("labarugi");
  const [summary, setSummary] = useState<FinancialReportSummary | null>(null);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Parameter Simulasi SHU (Draf AD/ART Koperasi)
  const [shuCadangan, setShuCadangan] = useState(40);
  const [shuJasaUsaha, setShuJasaUsaha] = useState(25);
  const [shuJasaModal, setShuJasaModal] = useState(20);
  const [shuPengurus, setShuPengurus] = useState(5);
  const [shuPendidikan, setShuPendidikan] = useState(5);
  const [shuSosial, setShuSosial] = useState(5);

  // Simulasi Target SHU opsional jika hasil riil masih nol
  const [targetSimulasiShu, setTargetSimulasiShu] = useState(10000000);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, accData] = await Promise.all([
        preparationRepository.getFinancialReportSummary(),
        preparationRepository.getCashAccounts(),
      ]);
      setSummary(sumData);
      setAccounts(accData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const totalShuPercent =
    shuCadangan + shuJasaUsaha + shuJasaModal + shuPengurus + shuPendidikan + shuSosial;

  return (
    <div className="space-y-6">
      {/* Bagian Cetak Khusus (Hanya muncul saat print) */}
      <div className="hidden print:block print:space-y-2 mb-6">
        <div className="text-center border-b pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide text-black">
            KOPERASI DESA MERAH PUTIH — LADANG LAWEH
          </h1>
          <p className="text-xs text-black">
            Kecamatan Banuhampu, Kabupaten Agam, Sumatera Barat | Zona Waktu: Asia/Jakarta (WIB)
          </p>
          <div className="mt-2 inline-block border border-black px-3 py-0.5 text-xs font-bold uppercase">
            Dokumen Laporan Keuangan Internal (Masa Persiapan)
          </div>
        </div>
        <div className="flex justify-between text-xs text-black pt-2">
          <span>
            Dicetak Tanggal: {new Date().toLocaleDateString("id-ID")} - Pukul: {new Date().toLocaleTimeString("id-ID")} WIB
          </span>
          <span>Penyusun: Abdul Halim (Manajer Persiapan)</span>
        </div>
      </div>

      {/* Header Terstandarisasi (Layar biasa) */}
      <PageHeader
        className="print:hidden"
        breadcrumbItems={[
          { label: "Dashboard", href: "/" },
          { label: "Keuangan", href: "/keuangan" },
          { label: "Pusat Laporan & SHU", active: true },
        ]}
        title="Pusat Laporan Keuangan & SHU"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Laporan Hasil Usaha, Posisi Keuangan (Neraca), Arus Kas, dan Draf Simulasi SHU sesuai Standar Akuntansi Koperasi."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/keuangan" variant="outline" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                Kembali ke Kas
              </ButtonLink>
            <Button variant="outline" className="gap-2 min-h-[44px]" onClick={handlePrint}>
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              Cetak / Ekspor PDF
            </Button>
          </div>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Laporan Keuangan (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Sisa Hasil Usaha (SHU)"
          value={formatRupiah(summary?.netOperatingIncome || 0)}
          subtitle="Hasil usaha bersih gerai sembako"
          icon={<TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          trend={{ label: "Draf Laporan", positive: true }}
          accentColor="emerald"
         action={{ label: "Lihat hasil usaha", onClick: () => { setActiveTab("labarugi"); } }}/>
        <CardMetric
          title="Total Aset & Kas Tercatat"
          value={formatRupiah(
            summary
              ? summary.totalCash + summary.totalInventory + summary.totalFixedAssets
              : 0
          )}
          subtitle="Kas register, giro bank, & persediaan"
          icon={<Scale className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          trend={{ label: "Posisi Neraca", positive: true }}
          accentColor="sky"
         action={{ label: "Lihat neraca", onClick: () => { setActiveTab("neraca"); } }}/>
        <CardMetric
          title="Simulasi Alokasi SHU"
          value={`${shuCadangan}% Cadangan • ${shuJasaUsaha}% Jasa`}
          subtitle="Rancangan AD/ART pembagian SHU"
          icon={<PieChart className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          trend={{ label: "Pra-RAT Nagari", positive: true }}
          accentColor="crimson"
         action={{ label: "Buka simulasi SHU", onClick: () => { setActiveTab("shu"); } }}/>
      </div>

      {/* Navigasi Tab Laporan (Layar biasa) */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 print:hidden overflow-x-auto">
        <button
          onClick={() => setActiveTab("labarugi")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === "labarugi"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Laba Rugi (Hasil Usaha)
        </button>
        <button
          onClick={() => setActiveTab("neraca")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === "neraca"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Scale className="h-4 w-4" />
          Posisi Keuangan (Neraca)
        </button>
        <button
          onClick={() => setActiveTab("aruskas")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === "aruskas"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Laporan Arus Kas
        </button>
        <button
          onClick={() => setActiveTab("shu")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === "shu"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <PieChart className="h-4 w-4" />
          Simulasi Pembagian SHU (Pra-RAT)
        </button>
      </div>

      {/* TAB 1: LAPORAN LABA RUGI / HASIL USAHA */}
      {activeTab === "labarugi" && summary && (
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Laporan Perhitungan Hasil Usaha (Laba Rugi)
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Unit Usaha: Gerai Sembako Ladang Laweh | Periode: {summary.period}
                </CardDescription>
              </div>
              <Badge variant="neutral" className="w-fit">Mata Uang: IDR (Rupiah)</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Bagian Pendapatan */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Pendapatan Operasional
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Penjualan Kotor Gerai Sembako</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{formatRupiah(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                  <span>Total Pendapatan Penjualan</span>
                  <span className="font-mono">{formatRupiah(summary.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Bagian HPP */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Beban Pokok Penjualan (HPP)
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Harga Perolehan Barang Terjual</span>
                  <span className="font-mono font-medium text-rose-700 dark:text-rose-400">
                    ({formatRupiah(summary.costOfGoodsSold)})
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-emerald-50/60 dark:bg-emerald-950/30 font-bold text-emerald-950 dark:text-emerald-300">
                  <span>Laba Kotor Penjualan (Gross Profit)</span>
                  <span className="font-mono">{formatRupiah(summary.grossProfit)}</span>
                </div>
              </div>
            </div>

            {/* Bagian Beban Operasional Persiapan */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Beban Operasional & Masa Persiapan
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">
                    Biaya Operasional, Notaris, Survei, & Perlengkapan Gerai
                  </span>
                  <span className="font-mono font-medium text-rose-700 dark:text-rose-400">
                    ({formatRupiah(summary.operatingExpenses)})
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                  <span>Total Beban Operasional</span>
                  <span className="font-mono text-rose-700 dark:text-rose-400">
                    ({formatRupiah(summary.operatingExpenses)})
                  </span>
                </div>
              </div>
            </div>

            {/* Hasil Usaha Bersih Berjalan */}
            <div className="rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800/90 p-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300">
                    Hasil Usaha Bersih Periode Berjalan
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Laba Kotor dikurangi Total Beban Persiapan
                  </p>
                </div>
                <div className="text-2xl md:text-3xl font-black font-mono">
                  {formatRupiah(summary.netOperatingIncome)}
                </div>
              </div>
            </div>

            {/* Catatan Legalitas */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-sm">
              <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Catatan Akuntansi &amp; Kepatuhan Koperasi</p>
                <p className="text-amber-800 dark:text-amber-300/90">
                  Angka Hasil Usaha Bersih ini adalah pembukuan berjalan dan <strong>belum disahkan sebagai Sisa Hasil Usaha (SHU)</strong>. Pembagian SHU secara sah hanya dapat ditetapkan melalui forum Rapat Anggota Tahunan (RAT) Koperasi Ladang Laweh setelah laporan pertanggungjawaban pengurus diterima anggota.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: LAPORAN POSISI KEUANGAN (NERACA) */}
      {activeTab === "neraca" && summary && (
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Laporan Posisi Keuangan (Neraca)
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Per Tanggal {new Date().toLocaleDateString("id-ID")} | Mode Persiapan Koperasi
                </CardDescription>
              </div>
              <Badge variant="neutral" className="w-fit">Format Keseimbangan: Aset = Kewajiban + Ekuitas</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: ASET */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">ASET (AKTIVA)</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Harta dan kekayaan koperasi</span>
                </div>

                {/* Aset Lancar */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aset Lancar
                  </span>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Kas & Setara Kas (Kasir, Brankas, Bank)</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{formatRupiah(summary.totalCash)}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Persediaan Barang Dagang Sembako</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{formatRupiah(summary.totalInventory)}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                      <span>Total Aset Lancar</span>
                      <span className="font-mono">
                        {formatRupiah(summary.totalCash + summary.totalInventory)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aset Tidak Lancar */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aset Tidak Lancar (Aset Tetap)
                  </span>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Peralatan & Perlengkapan Kios Fisik</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{formatRupiah(summary.totalFixedAssets)}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                      <span>Total Aset Tetap</span>
                      <span className="font-mono">{formatRupiah(summary.totalFixedAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Total Aset */}
                <div className="rounded-lg border-2 border-blue-600 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/30 p-4 text-blue-950 dark:text-blue-200 font-bold flex justify-between items-center">
                  <span>TOTAL ASET</span>
                  <span className="text-xl font-mono">
                    {formatRupiah(summary.totalCash + summary.totalInventory + summary.totalFixedAssets)}
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: KEWAJIBAN & EKUITAS */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">KEWAJIBAN & EKUITAS (PASIVA)</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Kewajiban pihak ketiga dan modal sendiri</span>
                </div>

                {/* Kewajiban */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kewajiban Jangka Pendek
                  </span>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Utang Usaha Pembelian PO ke Pemasok</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{formatRupiah(summary.totalLiabilities)}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                      <span>Total Kewajiban</span>
                      <span className="font-mono">{formatRupiah(summary.totalLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Ekuitas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ekuitas (Modal Sendiri Koperasi)
                  </span>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Simpanan Pokok & Wajib Anggota</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {formatRupiah(summary.totalEquity - summary.netOperatingIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-slate-700 dark:text-slate-300">Hasil Usaha Bersih Berjalan</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {formatRupiah(summary.netOperatingIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                      <span>Total Ekuitas</span>
                      <span className="font-mono">{formatRupiah(summary.totalEquity)}</span>
                    </div>
                  </div>
                </div>

                {/* Total Pasiva */}
                <div className="rounded-lg border-2 border-emerald-600 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 text-emerald-950 dark:text-emerald-200 font-bold flex justify-between items-center">
                  <span>TOTAL KEWAJIBAN & EKUITAS</span>
                  <span className="text-xl font-mono">
                    {formatRupiah(summary.totalLiabilities + summary.totalEquity)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: LAPORAN ARUS KAS */}
      {activeTab === "aruskas" && summary && (
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Laporan Arus Kas (Metode Langsung)
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Rekonsiliasi pergerakan kas masuk dan keluar selama masa persiapan koperasi
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Arus Kas Operasional */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Arus Kas dari Aktivitas Operasional
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Penerimaan Kas dari Penjualan Tunai Kasir</span>
                  <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                    +{formatRupiah(summary.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Pembayaran Beban Operasional & Notaris Persiapan</span>
                  <span className="font-mono font-medium text-rose-700 dark:text-rose-400">
                    -{formatRupiah(summary.operatingExpenses)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                  <span>Arus Kas Bersih dari Aktivitas Operasional</span>
                  <span className="font-mono">
                    {formatRupiah(summary.totalRevenue - summary.operatingExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Arus Kas Investasi */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Arus Kas dari Aktivitas Investasi
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Pengadaan Aset Tetap Fisik Kios (Rak & Timbangan)</span>
                  <span className="font-mono font-medium text-slate-500 dark:text-slate-400">
                    Rp 0 (Hibah / Pembelian Pra-Sistem)
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                  <span>Arus Kas Bersih dari Aktivitas Investasi</span>
                  <span className="font-mono">{formatRupiah(0)}</span>
                </div>
              </div>
            </div>

            {/* Arus Kas Pendanaan */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Arus Kas dari Aktivitas Pendanaan
              </h3>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-slate-700 dark:text-slate-300">Penerimaan Setoran Simpanan Pokok & Wajib Pendiri</span>
                  <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                    +{formatRupiah(summary.totalEquity - summary.netOperatingIncome)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-slate-100">
                  <span>Arus Kas Bersih dari Aktivitas Pendanaan</span>
                  <span className="font-mono">
                    +{formatRupiah(summary.totalEquity - summary.netOperatingIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Saldo Akhir Kas */}
            <div className="rounded-xl border-2 border-emerald-600 dark:border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 text-emerald-950 dark:text-emerald-200 font-bold flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  SALDO AKHIR KAS & BANK TERVERIFIKASI
                </span>
                <p className="text-xs font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Tercatat pada {accounts.length} rekening penampungan kas
                </p>
              </div>
              <span className="text-2xl font-mono">{formatRupiah(summary.totalCash)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: SIMULASI PEMBAGIAN SHU (PRA-RAT) */}
      {activeTab === "shu" && summary && (
        <div className="space-y-6">
          <Card className="print:shadow-none print:border-none">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Kalkulator Simulasi Alokasi SHU (Pra-RAT)
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Simulasi persentase pembagian Sisa Hasil Usaha berdasarkan rancangan AD/ART Koperasi.
                  </CardDescription>
                </div>
                <Badge variant="crimson">Draf Simulasi</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Status Basis SHU Riil */}
              {summary.netOperatingIncome <= 0 ? (
                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-sm">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Hasil Usaha Bersih Periode Berjalan Saat Ini: {formatRupiah(summary.netOperatingIncome)}</p>
                    <p className="text-amber-800 dark:text-amber-300/90">
                      Koperasi berada dalam <strong>Masa Persiapan</strong> dan gerai belum beroperasi komersial penuh, sehingga belum terdapat surplus hasil usaha riil untuk dibagikan. Di bawah ini disediakan kalkulator simulasi jika koperasi telah mencapai target laba tahunan agar para pengurus dan anggota dapat mempelajari rumusan pembagiannya.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Basis Hasil Usaha Riil Berjalan:
                    </span>
                    <div className="text-xl font-mono font-bold">
                      {formatRupiah(summary.netOperatingIncome)}
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    *Wajib disahkan dalam RAT sebelum dicairkan
                  </span>
                </div>
              )}

              {/* Form Konfigurasi Alokasi Persentase */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Rancangan Persentase Alokasi Sisa Hasil Usaha (AD/ART):
                  </h3>
                  <span
                    className={`text-xs font-bold ${
                      totalShuPercent === 100 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    Total Alokasi: {totalShuPercent}% {totalShuPercent !== 100 && "(Harus 100%)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cadangan Koperasi (%)</label>
                    <input
                      type="number"
                      value={shuCadangan}
                      onChange={(e) => setShuCadangan(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Penguatan modal koperasi</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jasa Anggota / Belanja (%)</label>
                    <input
                      type="number"
                      value={shuJasaUsaha}
                      onChange={(e) => setShuJasaUsaha(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Proporsional belanja sembako</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jasa Modal / Simpanan (%)</label>
                    <input
                      type="number"
                      value={shuJasaModal}
                      onChange={(e) => setShuJasaModal(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Proporsional simpanan anggota</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dana Pengurus & Pengawas (%)</label>
                    <input
                      type="number"
                      value={shuPengurus}
                      onChange={(e) => setShuPengurus(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Insentif pengelola & pengawas</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dana Pendidikan Koperasi (%)</label>
                    <input
                      type="number"
                      value={shuPendidikan}
                      onChange={(e) => setShuPendidikan(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Pelatihan anggota & staf</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dana Sosial & Nagari (%)</label>
                    <input
                      type="number"
                      value={shuSosial}
                      onChange={(e) => setShuSosial(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Bantuan warga & nagari</span>
                  </div>
                </div>
              </div>

              {/* Basis Simulasi */}
              {summary.netOperatingIncome <= 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Coba Hitung dengan Target Laba Simulasi Bersih (IDR):
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      value={targetSimulasiShu}
                      onChange={(e) => setTargetSimulasiShu(Number(e.target.value) || 0)}
                      className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm font-mono font-bold w-60 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (Misal: Estimasi laba tahun pertama pembukaan gerai sembako)
                    </span>
                  </div>
                </div>
              )}

              {/* Tabel Hasil Pembagian */}
              {(() => {
                const baseAmount =
                  summary.netOperatingIncome > 0
                    ? summary.netOperatingIncome
                    : targetSimulasiShu;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Proyeksi Hasil Pembagian (Basis: {formatRupiah(baseAmount)})
                      </span>
                      <span className="text-xs text-slate-400">
                        {summary.netOperatingIncome > 0 ? "Berdasarkan Laba Riil" : "Berdasarkan Nilai Simulasi"}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Pos Alokasi Dana</th>
                            <th className="px-4 py-3 text-center">Persentase</th>
                            <th className="px-4 py-3 text-right">Nominal Estimasi (IDR)</th>
                            <th className="px-4 py-3">Peruntukan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Cadangan Koperasi</td>
                            <td className="px-4 py-3 text-center font-mono">{shuCadangan}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatRupiah((baseAmount * shuCadangan) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Tetap di rekening koperasi untuk cadangan risiko & modal kerja
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Jasa Anggota (Transaksi Belanja)</td>
                            <td className="px-4 py-3 text-center font-mono">{shuJasaUsaha}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {formatRupiah((baseAmount * shuJasaUsaha) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Dibagikan ke anggota sesuai keaktifan belanja di gerai sembako
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Jasa Modal (Simpanan)</td>
                            <td className="px-4 py-3 text-center font-mono">{shuJasaModal}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                              {formatRupiah((baseAmount * shuJasaModal) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Dibagikan ke anggota sesuai besar simpanan pokok & wajib
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Dana Pengurus & Pengawas</td>
                            <td className="px-4 py-3 text-center font-mono">{shuPengurus}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatRupiah((baseAmount * shuPengurus) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Apresiasi kinerja pengelolaan koperasi
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Dana Pendidikan Koperasi</td>
                            <td className="px-4 py-3 text-center font-mono">{shuPendidikan}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatRupiah((baseAmount * shuPendidikan) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Pelatihan perkoperasian dan literasi digital
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">Dana Sosial & Nagari</td>
                            <td className="px-4 py-3 text-center font-mono">{shuSosial}%</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatRupiah((baseAmount * shuSosial) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              Kepedulian sosial & pembangunan desa Ladang Laweh
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 font-bold text-slate-900 dark:text-slate-100">
                          <tr>
                            <td className="px-4 py-3">Total Pembagian Alokasi</td>
                            <td className="px-4 py-3 text-center font-mono">{totalShuPercent}%</td>
                            <td className="px-4 py-3 text-right font-mono">
                              {formatRupiah((baseAmount * totalShuPercent) / 100)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              {totalShuPercent === 100 ? "Alokasi tepat 100%" : "Periksa persentase alokasi"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Bukan Tagihan Siap Cair:</strong>
                  <p className="mt-0.5">
                    Tabel di atas semata-mata merupakan alat simulasi edukatif bagi pengurus dan anggota. Koperasi dilarang mencairkan dana SHU sebelum disetujui dalam Rapat Anggota Tahunan (RAT) dan setelah buku kas tutup tahun diaudit secara sah.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer Tanda Tangan Cetak (Hanya tampil saat print) */}
      <div className="hidden print:grid grid-cols-3 gap-6 pt-12 text-center text-xs text-black">
        <div>
          <p>Disiapkan Oleh,</p>
          <p className="font-semibold">Manajer Persiapan</p>
          <div className="h-16"></div>
          <p className="font-bold underline">ABDUL HALIM</p>
        </div>
        <div>
          <p>Diverifikasi Oleh,</p>
          <p className="font-semibold">Bendahara Koperasi</p>
          <div className="h-16"></div>
          <p className="font-bold underline">BENDAHARA PENGURUS</p>
        </div>
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold">Ketua Koperasi Desa</p>
          <div className="h-16"></div>
          <p className="font-bold underline">KETUA PENGURUS</p>
        </div>
      </div>
    </div>
  );
}
