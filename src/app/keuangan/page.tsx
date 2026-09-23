"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Building2,
  Users,
  ArrowRightLeft,
  PlusCircle,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatRupiah } from "@/lib/utils";
import { preparationRepository } from "@/lib/repository";
import { CashAccount, CashTransaction, MemberDepositRecord, Member } from "@/types";

export default function KeuanganPage() {
  const [activeTab, setActiveTab] = useState<"rekening" | "simpanan" | "mutasi">("rekening");
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [deposits, setDeposits] = useState<MemberDepositRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States - Transfer
  const [transferSource, setTransferSource] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  // Form States - Expense
  const [expenseSource, setExpenseSource] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<"beban_persiapan" | "operasional_toko">("beban_persiapan");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  // Form States - Deposit
  const [depositMemberId, setDepositMemberId] = useState("");
  const [depositType, setDepositType] = useState<"pokok" | "wajib">("pokok");
  const [depositAmount, setDepositAmount] = useState("100000");
  const [depositTargetAcc, setDepositTargetAcc] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0]);

  // Filter Mutasi
  const [txFilter, setTxFilter] = useState<"all" | "masuk" | "keluar" | "transfer_internal">("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [accList, txList, depList, memResult] = await Promise.all([
        preparationRepository.getCashAccounts(),
        preparationRepository.getCashTransactions(),
        preparationRepository.getMemberDeposits(),
        preparationRepository.getMembers(),
      ]);
      setAccounts(accList);
      setTransactions(txList);
      setDeposits(depList);
      setMembers(memResult.members);

      if (accList.length > 0) {
        setTransferSource(accList[0].id);
        setTransferTarget(accList[1]?.id || accList[0].id);
        setExpenseSource(accList[1]?.id || accList[0].id);
        setDepositTargetAcc(accList[1]?.id || accList[0].id);
      }
      if (memResult.members.length > 0) {
        setDepositMemberId(memResult.members[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCash = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalSimpananPokok = deposits
    .filter((d) => d.depositType === "pokok")
    .reduce((acc, d) => acc + d.amount, 0);
  const totalSimpananWajib = deposits
    .filter((d) => d.depositType === "wajib")
    .reduce((acc, d) => acc + d.amount, 0);

  // Handler Transfer Kas Internal
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    const amount = Number(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedbackMsg({ type: "error", text: "Nominal transfer harus lebih besar dari Rp 0." });
      return;
    }
    if (transferSource === transferTarget) {
      setFeedbackMsg({ type: "error", text: "Rekening asal dan tujuan tidak boleh sama." });
      return;
    }

    const res = await preparationRepository.createInternalTransfer(
      transferSource,
      transferTarget,
      amount,
      transferNotes || "Mutasi rutin",
      "Abdul Halim"
    );

    if (res.success) {
      setFeedbackMsg({
        type: "success",
        text: `Berhasil memindahkan saldo ${formatRupiah(amount)}. Jurnal transfer otomatis dicatat.`,
      });
      setIsTransferModalOpen(false);
      setTransferAmount("");
      setTransferNotes("");
      loadData();
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Gagal melakukan transfer." });
    }
  };

  // Handler Beban Persiapan
  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    const amount = Number(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedbackMsg({ type: "error", text: "Nominal pengeluaran harus lebih besar dari Rp 0." });
      return;
    }
    if (!expenseDesc.trim()) {
      setFeedbackMsg({ type: "error", text: "Uraian keterangan pengeluaran wajib diisi." });
      return;
    }

    await preparationRepository.createExpense({
      category: expenseCategory,
      sourceAccountId: expenseSource,
      amount,
      date: expenseDate,
      description: expenseDesc,
      createdBy: "Abdul Halim",
    });

    setFeedbackMsg({
      type: "success",
      text: `Pengeluaran ${formatRupiah(amount)} berhasil dicatat pada buku kas dan jurnal umum.`,
    });
    setIsExpenseModalOpen(false);
    setExpenseAmount("");
    setExpenseDesc("");
    loadData();
  };

  // Handler Setoran Simpanan Anggota
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedbackMsg({ type: "error", text: "Nominal setoran harus lebih dari Rp 0." });
      return;
    }

    const member = members.find((m) => m.id === depositMemberId);
    if (!member) {
      setFeedbackMsg({ type: "error", text: "Pilih anggota yang valid." });
      return;
    }

    await preparationRepository.createMemberDeposit({
      memberId: member.id,
      memberName: member.fullName,
      depositType,
      amount,
      date: depositDate,
      targetAccountId: depositTargetAcc,
      recordedBy: "Abdul Halim",
      notes: `Setoran ${depositType === "pokok" ? "Simpanan Pokok" : "Simpanan Wajib"} modal pendiri`,
    });

    setFeedbackMsg({
      type: "success",
      text: `Setoran ${depositType === "pokok" ? "Pokok" : "Wajib"} sebesar ${formatRupiah(amount)} an. ${member.fullName} berhasil dicatat sebagai Ekuitas Modal Sendiri.`,
    });
    setIsDepositModalOpen(false);
    loadData();
  };

  const filteredTransactions = transactions.filter((t) => {
    if (txFilter === "all") return true;
    return t.type === txFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Dashboard", href: "/" },
          { label: "Keuangan", href: "/keuangan" },
          { label: "Kas & Simpanan", active: true },
        ]}
        title="Kas & simpanan"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Pencatatan kas riil, mutasi perbankan, dan ekuitas simpanan pendiri Koperasi Desa Ladang Laweh."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/keuangan/jurnal" variant="outline" className="gap-2 min-h-[44px]">
                <BookOpen className="h-4 w-4 text-slate-600" />
                Buku Jurnal Umum
              </ButtonLink>
            <ButtonLink href="/laporan" variant="outline" className="gap-2 min-h-[44px]">
                <FileText className="h-4 w-4 text-slate-600" />
                Pusat Laporan & SHU
              </ButtonLink>
          </div>
        }
      />

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

      {/* Alert Edukasi Akuntansi Koperasi */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Prinsip Akuntansi Koperasi Ladang Laweh</p>
          <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
            <li>
              <strong>Simpanan Anggota adalah Modal Sendiri (Ekuitas)</strong>, bukan omzet atau pendapatan penjualan toko sembako.
            </li>
            <li>
              <strong>Transfer Antar-Kas/Bank</strong> adalah perpindahan tempat penyimpanan uang tunai, tidak menambah laba ataupun modal.
            </li>
            <li>
              <strong>Pembukuan Berpasangan (Double-Entry)</strong>: Setiap rupiah kas yang masuk atau keluar langsung menghasilkan jurnal umum seimbang secara otomatis.
            </li>
          </ul>
        </div>
      </div>

      {/* 3 Kartu Metrik Utama (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Total Saldo Kas & Bank"
          value={formatRupiah(totalCash)}
          subtext={`Tersebar di ${accounts.length} rekening penampungan`}
          icon={<Wallet className="h-4 w-4" />}
          trend={{ label: "Kas Riil", positive: true }}
          accentColor="crimson"
         action={{ label: "Lihat rekening", onClick: () => { setActiveTab("rekening"); } }}/>
        <CardMetric
          title="Simpanan Pokok Terhimpun"
          value={formatRupiah(totalSimpananPokok)}
          subtext="Modal permanen pendiri koperasi (Ekuitas)"
          icon={<ShieldCheck className="h-4 w-4" />}
          trend={{ label: "Modal Sendiri", positive: true }}
          accentColor="sky"
         action={{ label: "Lihat simpanan anggota", onClick: () => { setActiveTab("simpanan"); } }}/>
        <CardMetric
          title="Simpanan Wajib Terhimpun"
          value={formatRupiah(totalSimpananWajib)}
          subtext="Iuran berkala anggota terdaftar"
          icon={<Users className="h-4 w-4" />}
          trend={{ label: "Iuran Anggota", positive: true }}
          accentColor="emerald"
         action={{ label: "Catat setoran", onClick: () => { setIsDepositModalOpen(true); } }}/>
      </div>

      {/* Tab Navigasi */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("rekening")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "rekening"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Rekening Kas & Bank ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab("simpanan")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "simpanan"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Buku Simpanan Anggota ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab("mutasi")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "mutasi"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Riwayat Arus Kas ({transactions.length})
        </button>
      </div>

      {/* Konten Tab 1: Rekening Kas & Bank */}
      {activeTab === "rekening" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Tempat Kas & Rekening Bank</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemisahan fisik antara kas operasional toko di register kasir dan brankas induk koperasi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2 min-h-[44px]"
                onClick={() => setIsTransferModalOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                Transfer Antar-Kas
              </Button>
              <Button
                variant="primary"
                className="gap-2 min-h-[44px]"
                onClick={() => setIsExpenseModalOpen(true)}
              >
                <TrendingDown className="h-4 w-4" />
                Catat Beban Persiapan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {accounts.map((acc) => (
              <Card key={acc.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                        Kode Akun: {acc.code}
                      </span>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {acc.name}
                      </CardTitle>
                    </div>
                    {acc.type === "kas_tunai" ? (
                      <Badge variant="neutral">Kas Tunai</Badge>
                    ) : (
                      <Badge variant="info">Perbankan</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Saldo Riil Saat Ini:</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatRupiah(acc.balance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-slate-500 dark:text-slate-400">Status Rekening:</span>
                    {acc.status === "terverifikasi" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" /> Rencana / Belum Dibuka
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Konten Tab 2: Buku Simpanan Anggota */}
      {activeTab === "simpanan" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Buku Induk Simpanan Anggota</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan setoran modal awal pendiri. Setiap setoran menghasilkan bukti Bukti Kas Masuk (BKM).
              </p>
            </div>
            <Button
              variant="primary"
              className="gap-2 min-h-[44px]"
              onClick={() => setIsDepositModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Catat Setoran Simpanan
            </Button>
          </div>

          {deposits.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
              title="Belum Ada Setoran Simpanan yang Dicatat"
              description="Setelah anggota pendiri menyetorkan simpanan pokok atau simpanan wajib, catat transaksi di sini untuk menambah ekuitas koperasi secara resmi."
              action={
                <Button variant="primary" onClick={() => setIsDepositModalOpen(true)}>
                  Catat Setoran Perdana
                </Button>
              }
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">No. Bukti Kas Masuk</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nama Anggota</th>
                      <th className="px-4 py-3">Jenis Simpanan</th>
                      <th className="px-4 py-3 text-right">Nominal (IDR)</th>
                      <th className="px-4 py-3">Penerima Kas</th>
                      <th className="px-4 py-3">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deposits.map((dep) => {
                      const acc = accounts.find((a) => a.id === dep.targetAccountId);
                      return (
                        <tr key={dep.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {dep.depositNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{dep.date}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{dep.memberName}</td>
                          <td className="px-4 py-3">
                            {dep.depositType === "pokok" ? (
                              <Badge variant="info">Simpanan Pokok</Badge>
                            ) : (
                              <Badge variant="success">Simpanan Wajib</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatRupiah(dep.amount)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {acc ? acc.name : "Kas Koperasi"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{dep.recordedBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Konten Tab 3: Riwayat Arus Kas */}
      {activeTab === "mutasi" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Buku Kas & Riwayat Arus Kas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seluruh mutasi keluar, masuk, dan perpindahan internal rekening.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Jenis:</span>
              <Select
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value as any)}
                options={[
                  { value: "all", label: "Semua Mutasi Kas" },
                  { value: "masuk", label: "Kas Masuk (+)" },
                  { value: "keluar", label: "Kas Keluar (-)" },
                  { value: "transfer_internal", label: "Transfer Internal" },
                ]}
                className="w-48 text-xs min-h-[40px]"
              />
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
              title="Belum Ada Transaksi Arus Kas"
              description="Catat setoran simpanan modal atau beban persiapan untuk melihat mutasi kas riil di sini."
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">No. Transaksi</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Jenis</th>
                      <th className="px-4 py-3">Uraian / Keterangan</th>
                      <th className="px-4 py-3">Rekening Terkait</th>
                      <th className="px-4 py-3 text-right">Nominal (IDR)</th>
                      <th className="px-4 py-3">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.map((tx) => {
                      const srcAcc = accounts.find((a) => a.id === tx.sourceAccountId);
                      const tgtAcc = accounts.find((a) => a.id === tx.targetAccountId);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {tx.trxNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{tx.date}</td>
                          <td className="px-4 py-3">
                            {tx.type === "masuk" && (
                              <Badge variant="success" className="gap-1">
                                <TrendingUp className="h-3 w-3" /> Kas Masuk
                              </Badge>
                            )}
                            {tx.type === "keluar" && (
                              <Badge variant="crimson" className="gap-1">
                                <TrendingDown className="h-3 w-3" /> Kas Keluar
                              </Badge>
                            )}
                            {tx.type === "transfer_internal" && (
                              <Badge variant="info" className="gap-1">
                                <ArrowRightLeft className="h-3 w-3" /> Mutasi Internal
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{tx.description}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {tx.type === "transfer_internal" ? (
                              <span>
                                {srcAcc?.code} &rarr; {tgtAcc?.code}
                              </span>
                            ) : (
                              <span>{srcAcc?.name || "Kas"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums">
                            {tx.type === "masuk" && (
                              <span className="text-emerald-700 dark:text-emerald-400">+{formatRupiah(tx.amount)}</span>
                            )}
                            {tx.type === "keluar" && (
                              <span className="text-rose-700 dark:text-rose-400">-{formatRupiah(tx.amount)}</span>
                            )}
                            {tx.type === "transfer_internal" && (
                              <span className="text-blue-700 dark:text-blue-400">{formatRupiah(tx.amount)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{tx.createdBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modal 1: Transfer Antar Kas */}
      <Dialog
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer / Mutasi Kas Internal"
        description="Pindahkan uang kas dari satu tempat ke tempat lain (misal dari brankas ke laci kasir). Mutasi ini tidak mempengaruhi pendapatan ataupun beban."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="form-transfer" variant="primary">
              Proses Pemindahan Saldo
            </Button>
          </>
        }
      >
        <form id="form-transfer" onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rekening Asal (Sumber Kas)</label>
            <Select
              value={transferSource}
              onChange={(e) => setTransferSource(e.target.value)}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name} (Saldo: ${formatRupiah(a.balance)})`,
              }))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rekening Tujuan</label>
            <Select
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name}`,
              }))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Transfer (Rp)</label>
            <Input
              type="number"
              placeholder="Contoh: 500000"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan Mutasi</label>
            <Input
              placeholder="Contoh: Pengisian modal kas kecil kasir pagi hari"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </form>
      </Dialog>

      {/* Modal 2: Catat Beban Persiapan */}
      <Dialog
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Beban Operasional Persiapan"
        description="Pencatatan pengeluaran riil untuk biaya survei, fotokopi berkas notaris, atau konsumsi musyawarah."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="form-expense" variant="primary">
              Simpan Pengeluaran
            </Button>
          </>
        }
      >
        <form id="form-expense" onSubmit={handleExpense} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori Beban</label>
            <Select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as any)}
              options={[
                { value: "beban_persiapan", label: "Beban Persiapan Operasional & Notaris" },
                { value: "operasional_toko", label: "Biaya Operasional Umum / ATK" },
              ]}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sumber Rekening Pengeluaran</label>
            <Select
              value={expenseSource}
              onChange={(e) => setExpenseSource(e.target.value)}
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name} (Saldo: ${formatRupiah(a.balance)})`,
              }))}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Pengeluaran (Rp)</label>
            <Input
              type="number"
              placeholder="Contoh: 150000"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Pengeluaran</label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Uraian / Keterangan Pembelian</label>
            <Input
              placeholder="Contoh: Pembelian buku kas dan materai notaris"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </form>
      </Dialog>

      {/* Modal 3: Catat Setoran Simpanan Anggota */}
      <Dialog
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Catat Penerimaan Simpanan Anggota"
        description="Penyetoran modal anggota pendiri. Setoran ini masuk sebagai Ekuitas Modal Koperasi dan menambah saldo kas penampungan."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="form-deposit" variant="primary" disabled={members.length === 0}>
              Simpan Setoran Modal
            </Button>
          </>
        }
      >
        <form id="form-deposit" onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Anggota</label>
            <Select
              value={depositMemberId}
              onChange={(e) => setDepositMemberId(e.target.value)}
              options={
                members.length > 0
                  ? members.map((m) => ({
                      value: m.id,
                      label: `${m.memberNo} - ${m.fullName} (${m.domicile})`,
                    }))
                  : [{ value: "", label: "Belum ada anggota terdaftar (Buka menu Anggota dahulu)" }]
              }
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jenis Simpanan</label>
              <Select
                value={depositType}
                onChange={(e) => {
                  const val = e.target.value as "pokok" | "wajib";
                  setDepositType(val);
                  setDepositAmount(val === "pokok" ? "100000" : "20000");
                }}
                options={[
                  { value: "pokok", label: "Simpanan Pokok (Sekali diawal)" },
                  { value: "wajib", label: "Simpanan Wajib (Iuran rutin)" },
                ]}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Setoran (Rp)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rekening Kas Penerima</label>
              <Select
                value={depositTargetAcc}
                onChange={(e) => setDepositTargetAcc(e.target.value)}
                options={accounts.map((a) => ({
                  value: a.id,
                  label: `${a.code} - ${a.name}`,
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Setor</label>
              <Input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <strong>Keterangan Akuntansi:</strong>
            <p className="mt-0.5">
              Jurnal otomatis: <strong>Debit Kas (1102)</strong> bertambah & <strong>Kredit Ekuitas Simpanan ({depositType === "pokok" ? "3101" : "3102"})</strong> bertambah. Tidak dihitung sebagai penjualan atau omzet toko.
            </p>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
