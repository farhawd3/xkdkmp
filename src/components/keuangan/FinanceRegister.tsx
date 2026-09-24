"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { formatRupiah, getCurrentYearMonthWIB } from "@/lib/utils";
import type { FinanceRegisterResponse } from "@/lib/finance-register";

export function FinanceRegister() {
  const [month, setMonth] = useState(getCurrentYearMonthWIB);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FinanceRegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/finance/register?month=${encodeURIComponent(month)}&page=${page}`, { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Buku rekap belum dapat dimuat.");
        if (active) setData(body);
      } catch (cause) {
        if (active) { setData(null); setError(cause instanceof Error ? cause.message : "Buku rekap belum dapat dimuat."); }
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [month, page, revision]);

  return <section aria-label="Buku rekap operasional" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#252F40]">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold">Buku rekap operasional gerai</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Daftar rekap per gerai dari Supabase. Ini membantu menelusuri angka, tetapi <strong>bukan buku besar akuntansi</strong> karena belum ada akun debit/kredit dan jurnal berpasangan.</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <MonthPicker label="Bulan rekap" value={month} onChange={(next) => { setMonth(next); setPage(1); }} />
        <Button type="button" variant="outline" size="icon" aria-label="Perbarui buku rekap" onClick={() => setRevision((value) => value + 1)}><RefreshCw className="h-4 w-4" /></Button>
      </div>
    </div>
    {loading ? <p role="status" className="mt-5 text-sm text-slate-500">Memuat rekap…</p> : error ? <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{error}</p> : !data?.rows.length ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Belum ada rekap gerai untuk bulan ini. Pilih bulan lain atau isi rekap di Pemantauan Gerai.</p> : <>
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Gerai</th><th className="px-4 py-3 text-right">Omset</th><th className="px-4 py-3 text-right">Pengeluaran</th><th className="px-4 py-3 text-right">Setoran dilaporkan</th><th className="px-4 py-3">Sumber</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{data.rows.map((row) => <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60"><td className="whitespace-nowrap px-4 py-3 tabular-nums">{row.reportDate}</td><td className="px-4 py-3 font-medium">{row.unitName}{row.unitCode && <span className="ml-1 text-xs text-slate-500">({row.unitCode})</span>}</td><td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatRupiah(row.grossRevenue)}</td><td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatRupiah(row.operationalExpenses)}</td><td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{row.reportedCash === null ? "Belum dicatat" : formatRupiah(row.reportedCash)}</td><td className="px-4 py-3 capitalize">{row.sourceType}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300"><p>{data.total} rekap bulan {month} · halaman {data.page} dari {Math.max(1, Math.ceil(data.total / data.pageSize))}</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="mr-1 h-4 w-4" />Sebelumnya</Button><Button type="button" variant="outline" size="sm" disabled={page * data.pageSize >= data.total} onClick={() => setPage((value) => value + 1)}>Berikutnya<ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>
    </>}
  </section>;
}
