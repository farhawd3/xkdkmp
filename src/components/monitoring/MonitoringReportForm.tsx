"use client";

import React, { useState } from "react";
import { Activity, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah, getTodayWIB } from "@/lib/utils";
import { UnitOption } from "@/types/models";

export interface MonitoringReportFormProps {
  units: UnitOption[];
  onReportSaved: () => void;
}

export const MonitoringReportForm: React.FC<MonitoringReportFormProps> = ({
  units,
  onReportSaved,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState(() => (units[0]?.id || ""));
  const [reportDate, setReportDate] = useState(() => getTodayWIB());
  const [grossRevenue, setGrossRevenue] = useState("");
  const [operationalExpenses, setOperationalExpenses] = useState("");
  const [cashInHand, setCashInHand] = useState("");
  const [transactionCount, setTransactionCount] = useState("0");
  const [operationalNotes, setOperationalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const revenueNum = parseFloat(grossRevenue) || 0;
  const expenseNum = parseFloat(operationalExpenses) || 0;
  const estimatedProfit = revenueNum - expenseNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUnitId = selectedUnitId || units[0]?.id;
    if (!effectiveUnitId) {
      showToast("error", "Pilih Gerai", "Pilih unit usaha/gerai yang dilaporkan.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        unit_id: effectiveUnitId,
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

      // Bersihkan formulir
      setGrossRevenue("");
      setOperationalExpenses("");
      setCashInHand("");
      setTransactionCount("0");
      setOperationalNotes("");

      onReportSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Pilih Gerai / Unit Usaha"
                  value={selectedUnitId || (units[0]?.id || "")}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  options={units.map((u) => ({
                    value: u.id,
                    label: u.code ? `${u.name} (${u.code})` : u.name,
                  }))}
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-600 dark:bg-[#1D2533] dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Omset Penjualan Kotor (Rp)"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0"
                  value={grossRevenue}
                  onChange={(e) => setGrossRevenue(e.target.value)}
                  helperText="Total uang pemasukan kotor dari seluruh penjualan gerai hari ini."
                />

                <Input
                  label="Pengeluaran Kas Operasional (Rp)"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0"
                  value={operationalExpenses}
                  onChange={(e) => setOperationalExpenses(e.target.value)}
                  helperText="Biaya harian gerai (kantong plastik, konsumsi, kebersihan, dll)."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Uang Kas Fisik Disetor (Rp)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={cashInHand}
                  onChange={(e) => setCashInHand(e.target.value)}
                  helperText="Jumlah uang tunai riil yang diserahkan/disimpan di brankas kasir."
                />

                <Input
                  label="Perkiraan Jumlah Transaksi / Struk"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={transactionCount}
                  onChange={(e) => setTransactionCount(e.target.value)}
                  helperText="Total pelanggan atau transaksi tercatat hari ini."
                />
              </div>

              <Textarea
                label="Catatan Kendala Lapangan (Opsional)"
                rows={3}
                placeholder="Contoh: Terjadi mati listrik selama 1 jam; stok beras medium menipis dan perlu pemesanan segera."
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="min-h-11 px-6 font-bold"
                >
                  {submitting ? "Menyimpan Data..." : "Simpan Rekapitulasi Harian"}
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
              <span className="font-bold text-slate-800 dark:text-slate-200">Selisih Omset &amp; Beban:</span>
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
            <p>• Catatan kendala lapangan dapat langsung dialihkan menjadi tugas penugasan kerja pada tab Riwayat Rekapitulasi.</p>
            <p>• Laporan dapat diperbarui kapan saja jika ada revisi rekapitulasi.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
