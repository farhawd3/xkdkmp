"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Building2,
  Users,
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
  Store,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatRupiah } from "@/lib/utils";

interface FinanceData {
  bukuBesar: {
    kasOperasional: number;
    kasBank: number | null;
    kasBankStatus?: string;
    totalPenerimaan: number;
    totalPengeluaran: number;
    saldoKasTersedia: number;
  };
  summary: {
    totalGrossRevenue: number;
    totalExpenses: number;
    currentShu: number;
    totalMembers: number;
  };
}

interface ReportRecord {
  id: string;
  report_date: string;
  gross_revenue: string;
  operational_expenses: string;
  cash_in_hand: string;
  operational_notes: string | null;
  business_units?: { name: string } | null;
}

export default function KeuanganPage() {
  const [activeTab, setActiveTab] = useState<"bukubesar" | "mutasi" | "simpanan">("bukubesar");
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [finRes, repRes] = await Promise.all([
        fetch("/api/finance/summary", { cache: "no-store" }),
        fetch("/api/monitoring/records", { cache: "no-store" }),
      ]);

      if (!finRes.ok) throw new Error("Gagal mengambil data keuangan.");
      const finData = await finRes.json();
      setFinance(finData);

      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData.reports || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState label="Membaca buku besar dan mutasi kas koperasi…" />;
  if (error || !finance) return <ErrorState message={error || "Gagal memuat buku besar."} onRetry={loadData} />;

  const { bukuBesar, summary } = finance;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Keuangan & Laporan" },
          { label: "Kas & Buku Besar", active: true },
        ]}
        title="Pemantauan Kas & Buku Besar Koperasi"
        badgeText="Buku Besar Kas"
        badgeVariant="crimson"
        description="Pantau posisi saldo kas tunai, rekening bank operasional, mutasi setoran kas dari seluruh gerai, dan simpanan anggota."
      />

      {/* 3 Kartu Metrik Ringkasan Kas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50/70 dark:border-slate-700 dark:from-[#252F40] dark:to-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-400">Kas di Bank (Operasional)</p>
                <h3 className="text-2xl font-bold text-sky-950 dark:text-sky-100 mt-1">
                  {bukuBesar.kasBank !== null ? formatRupiah(bukuBesar.kasBank) : "Belum Terhubung"}
                </h3>
                <p className="text-xs text-sky-700/80 mt-1">
                  {bukuBesar.kasBank !== null ? "Rekening resmi bank koperasi" : "Mode persiapan — belum ada rekening bank"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 dark:border-slate-700 dark:from-[#252F40] dark:to-[#1B3329]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">Kas Tunai di Bendahara</p>
                <h3 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 mt-1">{formatRupiah(bukuBesar.kasOperasional)}</h3>
                <p className="text-xs text-emerald-700/80 mt-1">Uang fisik dari setoran gerai</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/70 dark:border-slate-700 dark:from-[#252F40] dark:to-[#38232F]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">Total Kas Tunai Tercatat</p>
                <h3 className="text-2xl font-bold text-rose-950 dark:text-rose-100 mt-1">{formatRupiah(bukuBesar.saldoKasTersedia)}</h3>
                <p className="text-xs text-rose-700/80 mt-1">Uang tunai nyata hasil operasional</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("bukubesar")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "bukubesar"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Buku Besar Kas &amp; Bank</span>
        </button>

        <button
          onClick={() => setActiveTab("mutasi")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "mutasi"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Mutasi Kas Setoran Gerai ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("simpanan")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors min-h-11 ${
            activeTab === "simpanan"
              ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Simpanan Anggota ({summary.totalMembers})</span>
        </button>
      </div>

      {/* TAB 1: BUKU BESAR KAS */}
      {activeTab === "bukubesar" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-container" />
              Buku Besar Akun Kas &amp; Setoran
            </CardTitle>
            <CardDescription>
              Ikhtisar penerimaan kas masuk dari gerai dan pengeluaran beban operasional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                    <th className="p-3">Kode Akun</th>
                    <th className="p-3">Nama Akun Buku Besar</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">Debit (Masuk)</th>
                    <th className="p-3 text-right">Kredit (Keluar)</th>
                    <th className="p-3 text-right">Saldo Buku</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-3 font-mono text-xs">1101</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Kas di Rekening Bank Operasional</td>
                    <td className="p-3 text-xs">Aset Lancar</td>
                    <td className="p-3 text-right">
                      {bukuBesar.kasBank !== null ? formatRupiah(bukuBesar.kasBank) : <span className="text-slate-400 italic">Belum terhubung</span>}
                    </td>
                    <td className="p-3 text-right">Rp 0</td>
                    <td className="p-3 text-right font-bold text-sky-700 dark:text-sky-300">
                      {bukuBesar.kasBank !== null ? (
                        formatRupiah(bukuBesar.kasBank)
                      ) : (
                        <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-400">
                          Menunggu Rekening Resmi
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-3 font-mono text-xs">1102</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">Kas Tunai Bendahara (Setoran Gerai)</td>
                    <td className="p-3 text-xs">Aset Lancar</td>
                    <td className="p-3 text-right">{formatRupiah(bukuBesar.totalPenerimaan)}</td>
                    <td className="p-3 text-right text-rose-600">{formatRupiah(bukuBesar.totalPengeluaran)}</td>
                    <td className="p-3 text-right font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(bukuBesar.kasOperasional)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: MUTASI KAS DARI REKAP GERAI */}
      {activeTab === "mutasi" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-12 text-center">
              <History className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada mutasi kas gerai</h4>
              <p className="text-sm text-slate-500 mt-1">
                Laporan harian gerai yang dimasukkan di menu Pemantauan Gerai akan otomatis tercatat sebagai mutasi di sini.
              </p>
            </Card>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#252F40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{rep.report_date}</Badge>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {rep.business_units?.name || "Unit Usaha"}
                    </span>
                  </div>
                  {rep.operational_notes && (
                    <p className="text-slate-500 italic">&ldquo;{rep.operational_notes}&rdquo;</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500">Omset:</span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">+{formatRupiah(parseFloat(rep.gross_revenue) || 0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Pengeluaran:</span>
                    <p className="font-bold text-rose-600">-{formatRupiah(parseFloat(rep.operational_expenses) || 0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Setoran Kas:</span>
                    <p className="font-bold text-sky-700 dark:text-sky-300">{formatRupiah(parseFloat(rep.cash_in_hand) || 0)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SIMPANAN ANGGOTA */}
      {activeTab === "simpanan" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              Rekapitulasi Simpanan Anggota
            </CardTitle>
            <CardDescription>
              Simpanan pokok dan simpanan wajib warga nagari Ladang Laweh yang terdaftar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {summary.totalMembers} Anggota Terdaftar
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simpanan pokok dan wajib dikelola oleh bendahara koperasi.
                </p>
              </div>
              <Badge variant="neutral">Mode Persiapan 2027</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
