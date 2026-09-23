"use client";

import React, { useState, useMemo } from "react";
import { FileSpreadsheet, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useOrganizationProfile } from "@/lib/OrganizationContext";
import {
  formatRupiah,
  formatTanggal,
  getTodayWIB,
  getDaysAgoWIB,
  getCurrentYearMonthWIB,
} from "@/lib/utils";
import { DailyReportRecord, UnitOption } from "@/types/models";

export interface MonitoringPeriodicSummaryProps {
  reports: DailyReportRecord[];
  units: UnitOption[];
}

export const MonitoringPeriodicSummary: React.FC<MonitoringPeriodicSummaryProps> = ({
  reports,
  units,
}) => {
  const { profile } = useOrganizationProfile();
  const [summaryPeriod, setSummaryPeriod] = useState<"bulan_ini" | "bulan_lalu" | "7_hari" | "semua">("bulan_ini");
  const [summaryUnitId, setSummaryUnitId] = useState("semua");

  const todayWIB = getTodayWIB();
  const sevenDaysAgoWIB = getDaysAgoWIB(6);
  const currentMonthWIB = getCurrentYearMonthWIB();

  const summaryReports = useMemo(() => {
    return reports.filter((r) => {
      if (summaryUnitId !== "semua" && r.unit_id !== summaryUnitId) return false;
      if (summaryPeriod === "bulan_ini" && (!r.report_date.startsWith(currentMonthWIB) || r.report_date > todayWIB)) return false;
      if (summaryPeriod === "7_hari" && (r.report_date < sevenDaysAgoWIB || r.report_date > todayWIB)) return false;
      if (summaryPeriod === "bulan_lalu") {
        const [y, m] = currentMonthWIB.split("-").map(Number);
        const prevY = m === 1 ? y - 1 : y;
        const prevM = m === 1 ? 12 : m - 1;
        const prevMonthStr = `${prevY}-${String(prevM).padStart(2, "0")}`;
        if (!r.report_date.startsWith(prevMonthStr)) return false;
      }
      return true;
    });
  }, [reports, summaryPeriod, summaryUnitId, currentMonthWIB, sevenDaysAgoWIB, todayWIB]);

  const unitSummaries = useMemo(() => {
    const map = new Map<string, {
      unitName: string;
      unitCode: string;
      reportDays: number;
      revenue: number;
      expenses: number;
      profit: number;
      cashInHand: number;
      transactions: number;
    }>();

    for (const r of summaryReports) {
      const uId = r.unit_id;
      const uName = r.business_units?.name || "Unit Usaha";
      const uCode = r.business_units?.code || "-";
      const current = map.get(uId) || {
        unitName: uName,
        unitCode: uCode,
        reportDays: 0,
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashInHand: 0,
        transactions: 0,
      };

      current.reportDays += 1;
      current.revenue += parseFloat(r.gross_revenue) || 0;
      current.expenses += parseFloat(r.operational_expenses) || 0;
      current.profit += parseFloat(r.net_profit) || 0;
      current.cashInHand += parseFloat(r.cash_in_hand) || 0;
      current.transactions += r.transaction_count || 0;
      map.set(uId, current);
    }

    return Array.from(map.values());
  }, [summaryReports]);

  const summaryTotalRevenue = unitSummaries.reduce((acc, u) => acc + u.revenue, 0);
  const summaryTotalExpense = unitSummaries.reduce((acc, u) => acc + u.expenses, 0);
  const summaryTotalProfit = unitSummaries.reduce((acc, u) => acc + u.profit, 0);
  const summaryTotalCash = unitSummaries.reduce((acc, u) => acc + u.cashInHand, 0);
  const summaryTotalDays = unitSummaries.reduce((acc, u) => acc + u.reportDays, 0);

  return (
    <div className="space-y-6">
      {/* Kontrol Parameter & Tombol Cetak (Sembunyi saat Cetak) */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary-container" />
            Parameter Ringkasan &amp; Format Cetak
          </CardTitle>
          <CardDescription>
            Pilih periode dan gerai untuk melihat agregasi berkala, lalu klik Cetak / Simpan PDF untuk dokumen resmi manajer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilihan Periode Ringkasan"
              value={summaryPeriod}
              onChange={(e) => setSummaryPeriod(e.target.value as "bulan_ini" | "bulan_lalu" | "7_hari" | "semua")}
              options={[
                { value: "bulan_ini", label: "Bulan Berjalan (WIB)" },
                { value: "bulan_lalu", label: "Bulan Lalu" },
                { value: "7_hari", label: "7 Hari Terakhir" },
                { value: "semua", label: "Seluruh Rekapitulasi Riil" },
              ]}
            />

            <Select
              label="Filter Gerai"
              value={summaryUnitId}
              onChange={(e) => setSummaryUnitId(e.target.value)}
              options={[
                { value: "semua", label: "Semua Gerai / Unit Usaha" },
                ...units.map((u) => ({ value: u.id, label: u.name })),
              ]}
            />
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Agregasi dari <strong>{summaryReports.length}</strong> laporan harian tercatat.
            </span>
            <Button
              variant="primary"
              onClick={() => window.print()}
              className="min-h-11 px-5 font-bold gap-2"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DOKUMEN CETAK RESMI (Tampil di Layar dan Dicetak) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-[#252F40] shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Kop Laporan Resmi */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              {profile.display_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {profile.region} • {profile.full_address || "Ladang Laweh, Kec. Banuhampu, Kab. Agam"}
            </p>
            <div className="mt-3 inline-block px-3 py-1 rounded bg-rose-100 text-rose-950 font-bold text-xs uppercase tracking-wider print:bg-slate-100 print:text-black">
              Laporan Rekapitulasi Operasional Gerai
            </div>
          </div>

          <div className="text-xs sm:text-right text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              Periode: <strong>{
                summaryPeriod === "bulan_ini"
                  ? "Bulan Ini (WIB)"
                  : summaryPeriod === "bulan_lalu"
                  ? "Bulan Lalu"
                  : summaryPeriod === "7_hari"
                  ? "7 Hari Terakhir"
                  : "Semua Rekap"
              }</strong>
            </p>
            <p>Tanggal Cetak: <strong>{formatTanggal(todayWIB)}</strong></p>
            <p>Status: <span className="font-semibold text-slate-700 dark:text-slate-300">Berdasarkan rekap tersimpan, belum diaudit</span></p>
          </div>
        </div>

        {/* Tabel Ringkasan Agregasi per Gerai */}
        {unitSummaries.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Tidak ada data rekapitulasi operasional pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3">Gerai / Unit Usaha</th>
                  <th className="py-2.5 px-3 text-center">Hari Lapor</th>
                  <th className="py-2.5 px-3 text-right">Total Omset</th>
                  <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                  <th className="py-2.5 px-3 text-right">Selisih Operasional</th>
                  <th className="py-2.5 px-3 text-right">Setoran Kas Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {unitSummaries.map((unit) => (
                  <tr key={unit.unitCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <strong className="block text-slate-900 dark:text-slate-100">{unit.unitName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{unit.unitCode}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{unit.reportDays} hari</td>
                    <td className="py-3 px-3 text-right font-medium">{formatRupiah(unit.revenue)}</td>
                    <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-400 font-medium">{formatRupiah(unit.expenses)}</td>
                    <td className={`py-3 px-3 text-right font-bold ${unit.profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                      {formatRupiah(unit.profit)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatRupiah(unit.cashInHand)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 dark:border-slate-100 font-black text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 print:bg-transparent">
                  <td className="py-3 px-3">TOTAL KESELURUHAN</td>
                  <td className="py-3 px-3 text-center">{summaryTotalDays} catatan</td>
                  <td className="py-3 px-3 text-right">{formatRupiah(summaryTotalRevenue)}</td>
                  <td className="py-3 px-3 text-right text-rose-600">{formatRupiah(summaryTotalExpense)}</td>
                  <td className={`py-3 px-3 text-right ${summaryTotalProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {formatRupiah(summaryTotalProfit)}
                  </td>
                  <td className="py-3 px-3 text-right">{formatRupiah(summaryTotalCash)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Catatan Disclaimer & Kolom Tanda Tangan */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p>
            <strong>Catatan Resmi Manajer:</strong> Laporan ini adalah ringkasan rekapitulasi operasional internal yang bersumber dari pencatatan harian kas gerai. Laporan ini bukan merupakan laporan keuangan audited tahunan koperasi (RAT).
          </p>
        </div>

        <div className="mt-12 flex justify-between items-end text-xs">
          <div className="space-y-1">
            <p>Dicetak melalui Sistem Manajemen Koperasi</p>
            <p className="text-xs text-slate-500">Tanggal laporan mengikuti WIB</p>
          </div>

          <div className="text-center w-52 space-y-16">
            <p>
              {profile.region}, {formatTanggal(todayWIB)}<br />
              <strong>{profile.manager_title}</strong>
            </p>
            <div>
              <p className="font-bold border-b border-slate-400 pb-1 text-slate-900 dark:text-slate-100">
                {profile.manager_name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Penanggung Jawab Operasional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
