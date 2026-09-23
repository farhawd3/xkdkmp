"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileText,
  Info,
  Trash2,
  Plus,
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
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatRupiah } from "@/lib/utils";
import { preparationRepository } from "@/lib/repository";
import { JournalEntry, JournalEntryLine } from "@/types";

// Daftar Bagan Akun Standar Koperasi Ladang Laweh (Chart of Accounts)
const CHART_OF_ACCOUNTS = [
  { code: "1101", name: "Kas Register Kasir Gerai Sembako" },
  { code: "1102", name: "Kas Brankas Koperasi" },
  { code: "1110", name: "Rekening Giro Bank Nagari" },
  { code: "1120", name: "Persediaan Barang Dagang Sembako" },
  { code: "1201", name: "Aset Tetap Inventaris & Peralatan Kios" },
  { code: "2101", name: "Utang Usaha Pembelian PO Pemasok" },
  { code: "3101", name: "Ekuitas Simpanan Pokok Anggota" },
  { code: "3102", name: "Ekuitas Simpanan Wajib Anggota" },
  { code: "4101", name: "Pendapatan Penjualan Toko Sembako" },
  { code: "5101", name: "Beban Pokok Penjualan (HPP)" },
  { code: "6101", name: "Beban Operasional Persiapan & Legalitas" },
  { code: "6102", name: "Beban Perlengkapan & ATK" },
];

export default function JurnalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Buat Jurnal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split("T")[0]);
  const [journalRef, setJournalRef] = useState("");
  const [journalDesc, setJournalDesc] = useState("");
  const [journalLines, setJournalLines] = useState<
    Array<{
      accountCode: string;
      position: "debit" | "credit";
      amount: string;
      description: string;
    }>
  >([
    { accountCode: "1102", position: "debit", amount: "", description: "" },
    { accountCode: "3101", position: "credit", amount: "", description: "" },
  ]);

  // Modal Reversal
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [reverseReason, setReverseReason] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const list = await preparationRepository.getJournalEntries();
      setJournals(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
  }, []);

  // Hitung total Debit dan Kredit form pembuatan jurnal
  const calcTotalDebit = journalLines
    .filter((l) => l.position === "debit")
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const calcTotalCredit = journalLines
    .filter((l) => l.position === "credit")
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const isBalanced = calcTotalDebit > 0 && calcTotalDebit === calcTotalCredit;

  const handleAddLine = () => {
    setJournalLines([
      ...journalLines,
      { accountCode: "1102", position: "credit", amount: "", description: "" },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (journalLines.length <= 2) return;
    setJournalLines(journalLines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, value: string) => {
    const updated = [...journalLines];
    (updated[idx] as any)[field] = value;
    setJournalLines(updated);
  };

  const handleCreateJournal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedbackMsg(null);

    if (!isBalanced) {
      setFeedbackMsg({
        type: "error",
        text: `Jurnal tidak seimbang! Total Debit (${formatRupiah(calcTotalDebit)}) tidak sama dengan Total Kredit (${formatRupiah(calcTotalCredit)}).`,
      });
      return;
    }

    if (!journalDesc.trim()) {
      setFeedbackMsg({ type: "error", text: "Uraian / Keterangan jurnal wajib diisi." });
      return;
    }

    const lines: JournalEntryLine[] = journalLines.map((l) => {
      const coa = CHART_OF_ACCOUNTS.find((c) => c.code === l.accountCode);
      const amt = Number(l.amount) || 0;
      return {
        accountId: `acc-${l.accountCode}`,
        accountCode: l.accountCode,
        accountName: coa?.name || "Akun",
        debit: l.position === "debit" ? amt : 0,
        credit: l.position === "credit" ? amt : 0,
        description: l.description || journalDesc,
      };
    });


    const res = await preparationRepository.createJournalEntry({
      date: journalDate,
      description: journalDesc,
      referenceNumber: journalRef || undefined,
      lines,
      totalDebit: calcTotalDebit,
      totalCredit: calcTotalCredit,
      createdBy: "Abdul Halim",
    });

    if (res.success) {
      setFeedbackMsg({
        type: "success",
        text: `Jurnal ${res.entry?.entryNumber} berhasil dibukukan dengan status Sah (Posted).`,
      });
      setIsCreateModalOpen(false);
      setJournalDesc("");
      setJournalRef("");
      setJournalLines([
        { accountCode: "1102", position: "debit", amount: "", description: "" },
        { accountCode: "3101", position: "credit", amount: "", description: "" },
      ]);
      loadJournals();
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Gagal mencatat jurnal." });
    }
  };

  const handleOpenReverse = (j: JournalEntry) => {
    setSelectedJournal(j);
    setReverseReason("");
    setIsReverseModalOpen(true);
  };

  const handleExecuteReverse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedJournal) return;
    setFeedbackMsg(null);

    if (!reverseReason.trim()) {
      setFeedbackMsg({ type: "error", text: "Alasan pembalikan jurnal wajib dicantumkan." });
      return;
    }

    const res = await preparationRepository.reverseJournalEntry(
      selectedJournal.id,
      reverseReason,
      "Abdul Halim"
    );

    if (res.success) {
      setFeedbackMsg({
        type: "success",
        text: `Jurnal Pembalikan ${res.reversalEntry?.entryNumber} berhasil diterbitkan. Jurnal ${selectedJournal.entryNumber} telah dibatalkan mutasinya.`,
      });
      setIsReverseModalOpen(false);
      loadJournals();
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Gagal membalikkan jurnal." });
    }
  };

  const postedEntriesCount = journals.filter((j) => j.status === "posted").length;
  const reversalEntriesCount = journals.filter(
    (j) => j.status === "reversed" || Boolean(j.isReversal)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Dashboard", href: "/" },
          { label: "Keuangan", href: "/keuangan" },
          { label: "Buku Jurnal Umum", active: true },
        ]}
        title="Buku jurnal"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Tinjau catatan debit dan kredit, buat jurnal, atau catat pembalikan pada sesi ini."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/keuangan" variant="outline" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
                Kembali ke Kas
              </ButtonLink>
            <Button
              variant="primary"
              className="gap-2 min-h-[44px]"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Buat Jurnal Umum Baru
            </Button>
          </div>
        }
      />

      {/* Banner Edukasi Modul Persiapan Jurnal Akuntansi */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-950 dark:text-amber-100">Modul Simulasi Pembukuan Akuntansi (Double-Entry):</strong> Modul ini disediakan untuk instrumen pembelajaran tata kelola akuntansi berstandar SAK EP kelak. Untuk pemantauan operasional gerai harian saat ini, seluruh arus kas nyata dipantau melalui menu <strong className="underline">/keuangan</strong> dan <strong className="underline">/monitoring</strong>.
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkasan Jurnal (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Jurnal Terbukukan"
          value={`${postedEntriesCount} Entri`}
          subtitle={`${journals.length} total baris entri pembukuan`}
          icon={<BookOpen className="h-4 w-4 text-rose-600" />}
          trend={{ label: "Dibukukan dalam sesi", positive: true }}
          accentColor="crimson"
         action={{ label: "Buat jurnal", onClick: () => { setIsCreateModalOpen(true); } }}/>
        <CardMetric
          title="Keseimbangan Pembukuan"
          value="Debit = Kredit"
          subtitle="Periksa pasangan debit dan kredit pada setiap jurnal."
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          trend={{ label: "Validasi Sistem", positive: true }}
          accentColor="emerald"
         action={{ label: "Tinjau laporan", href: "/laporan" }}/>
        <CardMetric
          title="Audit Pembalikan (Reversal)"
          value={`${reversalEntriesCount} Koreksi`}
          subtitle="Koreksi akuntansi tanpa hapus data"
          icon={<RotateCcw className="h-4 w-4 text-sky-600" />}
          trend={{ label: "Jurnal Pembalikan", positive: true }}
          accentColor="sky"
        />
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            feedbackMsg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <div className="flex-1">{feedbackMsg.text}</div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Edukasi Imutabilitas Jurnal */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-slate-100">Aturan Integritas Buku Jurnal:</span>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Jurnal yang berstatus <strong>Sah (Posted)</strong> bersifat permanen dan tidak dapat diedit atau dihapus. Untuk mengoreksi kesalahan angka atau akun, gunakan tombol <strong>Jurnal Pembalikan (Reversal Entry)</strong> agar jejak audit keuangan tetap transparan dan akuntabel.
            </p>
          </div>
        </div>
      </div>

      {/* Daftar Jurnal */}
      {journals.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
          title="Buku Jurnal Umum Masih Kosong"
          description="Belum ada transaksi akuntansi yang dibukukan. Buat jurnal pembukuan awal atau lakukan transaksi kas dan simpanan anggota untuk menghasilkan jurnal otomatis."
          action={
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Buat Jurnal Pertama
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <Card key={journal.id} className="overflow-hidden">
              {/* Header Kartu Jurnal */}
              <CardHeader className="bg-slate-50/70 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 py-3 px-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {journal.entryNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">|</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Tanggal: {journal.date}
                    </span>
                    {journal.referenceNumber && (
                       <>
                        <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Ref: {journal.referenceNumber}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {journal.isReversal && (
                      <Badge variant="info" className="text-xs gap-1">
                        <RotateCcw className="h-3 w-3" /> Jurnal Pembalikan
                      </Badge>
                    )}
                    {journal.status === "posted" ? (
                      <Badge variant="success" className="text-xs gap-1">
                        <Lock className="h-3 w-3" /> Sah (Posted)
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs gap-1">
                        <AlertCircle className="h-3 w-3" /> Telah Dibalik (Reversed)
                      </Badge>
                    )}

                    {journal.status === "posted" && !journal.isReversal && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReverse(journal)}
                        className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Pembalik (Reversal)
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {journal.description}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Dibukukan oleh: {journal.createdBy}
                </div>
              </CardHeader>

              {/* Tabel Baris Akun Jurnal */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/40 dark:bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-2.5 w-24">Kode Akun</th>
                      <th className="px-5 py-2.5">Nama Akun & Keterangan</th>
                      <th className="px-5 py-2.5 text-right w-36">Debit (IDR)</th>
                      <th className="px-5 py-2.5 text-right w-36">Kredit (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {journal.lines.map((line, lIdx) => (
                      <tr key={lIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-2 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {line.accountCode}
                        </td>
                        <td className="px-5 py-2">
                          <span className={`font-semibold ${line.debit > 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300 pl-4"}`}>
                            {line.accountName}
                          </span>
                          {line.description && line.description !== journal.description && (
                            <div className={`text-xs text-slate-400 dark:text-slate-500 ${line.debit > 0 ? "" : "pl-4"}`}>
                              {line.description}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-2 text-right font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                          {line.debit > 0 ? formatRupiah(line.debit) : "-"}
                        </td>
                        <td className="px-5 py-2 text-right font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                          {line.credit > 0 ? formatRupiah(line.credit) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 font-bold text-slate-900 dark:text-slate-100">
                    <tr>
                      <td colSpan={2} className="px-5 py-2.5 text-right uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">
                        Total Saldo Seimbang
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
                        {formatRupiah(journal.totalDebit)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
                        {formatRupiah(journal.totalCredit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal 1: Buat Jurnal Umum Baru */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Entri Jurnal Umum Double-Entry"
        description="Pencatatan transaksi akuntansi berpasangan. Total Debit dan Total Kredit wajib bernilai persis seimbang."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!isBalanced}
              onClick={() => handleCreateJournal()}
            >
              Posting Jurnal Sah
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Transaksi</label>
              <Input
                type="date"
                value={journalDate}
                onChange={(e) => setJournalDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. Referensi / Bukti Fisik</label>
              <Input
                placeholder="Contoh: BKK-001 / FAK-99"
                value={journalRef}
                onChange={(e) => setJournalRef(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Uraian / Keterangan Transaksi</label>
            <Input
              placeholder="Contoh: Penyesuaian modal awal atau pengadaan perlengkapan"
              value={journalDesc}
              onChange={(e) => setJournalDesc(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Baris Akun */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Rincian Akun Berpasangan (Minimal 2 Baris)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" /> Tambah Baris
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {journalLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="w-1/3">
                    <Select
                      value={line.accountCode}
                      onChange={(e) => handleLineChange(idx, "accountCode", e.target.value)}
                      options={CHART_OF_ACCOUNTS.map((c) => ({
                        value: c.code,
                        label: `${c.code} - ${c.name}`,
                      }))}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="w-24">
                    <Select
                      value={line.position}
                      onChange={(e) => handleLineChange(idx, "position", e.target.value)}
                      options={[
                        { value: "debit", label: "Debit" },
                        { value: "credit", label: "Kredit" },
                      ]}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Nominal"
                      value={line.amount}
                      onChange={(e) => handleLineChange(idx, "amount", e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  {journalLines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1"
                      title="Hapus baris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Indikator Keseimbangan */}
          <div
            className={`rounded-lg p-3 text-xs border flex items-center justify-between ${
              isBalanced
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
            }`}
          >
            <div>
              <div>Total Debit: <strong>{formatRupiah(calcTotalDebit)}</strong></div>
              <div>Total Kredit: <strong>{formatRupiah(calcTotalCredit)}</strong></div>
            </div>
            <div className="text-right">
              {isBalanced ? (
                <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> SEIMBANG
                </div>
              ) : (
                <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  Selisih: {formatRupiah(Math.abs(calcTotalDebit - calcTotalCredit))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal 2: Jurnal Pembalikan (Reversal Entry) */}
      <Dialog
        isOpen={isReverseModalOpen}
        onClose={() => setIsReverseModalOpen(false)}
        title="Buat Jurnal Pembalikan (Reversal Entry)"
        description="Tindakan ini akan membalikkan seluruh mutasi debit-kredit dari jurnal asal secara akurat tanpa menghapus data historis."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={() => setIsReverseModalOpen(false)}>
              Batal
            </Button>
            <Button type="button" variant="primary" onClick={() => handleExecuteReverse()}>
              Konfirmasi Pembalikan
            </Button>
          </div>
        }
      >
        {selectedJournal && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              <div>No. Jurnal Asal: <strong>{selectedJournal.entryNumber}</strong></div>
              <div>Keterangan: {selectedJournal.description}</div>
              <div>Total Nilai: {formatRupiah(selectedJournal.totalDebit)}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alasan Resmi Pembalikan Jurnal (Wajib)
              </label>
              <Input
                placeholder="Contoh: Koreksi salah pilih kode akun beban persiapan"
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
