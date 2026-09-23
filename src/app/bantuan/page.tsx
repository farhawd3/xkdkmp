"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  FileText,
  Users,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardMetric } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface GuideTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  tips: string;
  actionUrl?: string;
  actionLabel?: string;
}

const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "anggota-simpanan",
    title: "Tata Kelola Calon Anggota & Pembukuan Simpanan",
    category: "Kelembagaan",
    summary: "Aturan pendaftaran anggota pendiri, penyamaran NIK, dan pengakuan simpanan pokok/wajib.",
    steps: [
      "Catat calon anggota di modul Anggota (NIK disamarkan otomatis menjadi **** demi kepatuhan privasi).",
      "Pendaftaran calon anggota belum otomatis mencatat simpanan telah lunas.",
      "Saat uang tunai simpanan disetor riil ke rekening/brankas, catat mutasi penerimaan di modul Keuangan > Simpanan Anggota.",
      "Sistem akan menerbitkan bukti setoran dan membukukan Jurnal Umum otomatis (Debit: Kas/Bank, Kredit: Simpanan Pokok).",
    ],
    tips: "Simpanan Pokok dan Wajib adalah Modal Sendiri (Ekuitas Koperasi), bukan omzet atau pendapatan kios.",
    actionUrl: "/anggota",
    actionLabel: "Buka Modul Anggota",
  },
  {
    id: "po-gudang",
    title: "Siklus Pengadaan Barang (PO) & Penerimaan Gudang",
    category: "Unit Usaha",
    summary: "Memastikan stok fisik di gerai sembako tidak menyimpang dari dokumen pesanan.",
    steps: [
      "Buat Surat Pesanan (PO) di modul Pengadaan ke salah satu mitra grosir yang terdaftar.",
      "PO yang disetujui (Approved) BELUM menambah kuantitas stok di sistem.",
      "Ketika barang fisik tiba di kios sembako Ladang Laweh, klik 'Terima Barang' dan masukkan nomor Surat Jalan pemasok.",
      "Periksa fisik barang: komoditas yang rusak/cacat dialihkan ke gudang Karantina, sedangkan yang utuh otomatis menambah saldo siap jual.",
    ],
    tips: "Pemisahan status pesanan (PO) dan penerimaan fisik (Goods Receipt) mencegah terjadinya selisih stok yang tidak sesuai.",
    actionUrl: "/stok",
    actionLabel: "Buka Barang & Stok",
  },
  {
    id: "kasir-shift",
    title: "Disiplin Shift Kasir & Perhitungan Fisik Buta (Blind Count)",
    category: "Operasional",
    summary: "Prosedur operasional harian kasir sembako untuk mencegah kebocoran uang register kasir.",
    steps: [
      "Di awal jam buka gerai, kasir membuka shift baru dengan memasukkan modal awal kas register (kas kecil).",
      "Lakukan transaksi penjualan eceran sembako, cetak struk untuk pembeli, dan terima pembayaran tunai atau QRIS.",
      "Jika ada barang retur dari pembeli, gunakan menu Otorisasi Retur dengan memilih alasan cacat atau salah beli.",
      "Saat toko tutup, kasir wajib melakukan 'Tutup Shift' dengan menghitung fisik uang tunai yang ada di laci kasir (Blind Count) tanpa diberitahu kalkulasi sistem.",
    ],
    tips: "Selisih lebih atau selisih kurang pada kas register kasir akan otomatis tercatat di berita acara tutup shift.",
    actionUrl: "/monitoring",
    actionLabel: "Buka Pemantauan Gerai",
  },
  {
    id: "jurnal-pembukuan",
    title: "Pembukuan Berpasangan (Double-Entry) & Jurnal Pembalikan",
    category: "Akuntansi",
    summary: "Aturan transaksi posted yang permanen dan tata cara perbaikan jurnal yang sah.",
    steps: [
      "Buka Buku Jurnal untuk memeriksa transaksi sesi yang sudah menghasilkan jurnal. Integrasi seluruh modul belum selesai.",
      "Nilai Debit harus selalu sama persis dengan Kredit (keseimbangan mutlak).",
      "Jurnal yang telah berstatus Sah (Posted) DILARANG keras dihapus atau diedit angkanya.",
      "Jika terjadi kesalahan pencatatan nomor akun atau nominal, terbitkan Jurnal Pembalikan (Reversal Entry) dengan alasan tertulis.",
    ],
    tips: "Jurnal pembalikan membatalkan mutasi sebelumnya secara transparan dan menjaga audit trail tetap utuh.",
    actionUrl: "/keuangan",
    actionLabel: "Buka Buku Jurnal",
  },
];

export default function BantuanPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("anggota-simpanan");

  const filteredTopics = GUIDE_TOPICS.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman Baku */}
      <PageHeader
        breadcrumbItems={[
          { label: "Sistem" },
          { label: "Panduan & Bantuan Teknis", active: true },
        ]}
        title="Panduan & bantuan"
        statusBadge="Mode Persiapan"
        badgeVariant="crimson"
        description="Panduan teknis alur kerja sistem, tata kelola kepatuhan, dan prosedur harian Koperasi Desa Ladang Laweh untuk Bapak Abdul Halim."
      />

      {/* 3 Kartu Metrik Ringkasan Atas (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Fokus Operasional Utama"
          value="Kesiapan Awal 2027"
          subtext="Penuntasan legalitas, gerai fisik, dan SOP"
          icon={<Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          trend={{ label: "Target 2027", positive: true }}
          accentColor="crimson"
         action={{ label: "Buka checklist", href: "/persiapan" }}/>
        <CardMetric
          title="Integritas Lingkungan Data"
          value="Prototipe sesi"
          subtext="Data contoh dapat berubah selama sesi."
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          trend={{ label: "Data contoh", positive: true }}
          accentColor="emerald"
         action={{ label: "Lihat pengaturan", href: "/pengaturan" }}/>
        <CardMetric
          title="Peran Akun Pengguna"
          value="Manajer Persiapan"
          subtext="Login dan hak akses nyata belum dihubungkan."
          icon={<Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          trend={{ label: "Abdul Halim", positive: true }}
          accentColor="sky"
         action={{ label: "Buka panduan anggota", href: "/anggota" }}/>
      </div>

      {/* Banner Komitmen Pengurus yang Proporsional & Selaras */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 p-4 text-xs text-sky-900 dark:text-sky-300 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-sky-900 dark:text-sky-200 mb-1">
            Komitmen Sederhana &amp; Transparan Koperasi Desa Ladang Laweh
          </p>
          <p className="text-sky-800 dark:text-sky-300/90">
            Aplikasi ini dirancang khusus untuk memudahkan pengelolaan koperasi oleh pengurus nagari.
            Pada operasional nyata, setiap angka, stok, dan kas perlu didukung <strong>dokumen fisik otentik</strong>.
            Apabila Anda menemui keraguan alur kerja di lapangan, rujuklah <strong>4 pilar panduan operasional</strong> di
            bawah ini atau hubungi pembina koperasi nagari.
          </p>
        </div>
      </div>

      {/* Bar Filter Kategori */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
          Pilar Panduan:
        </span>
        {[
          { id: "all", label: "Semua Panduan" },
          { id: "Kelembagaan", label: "Kelembagaan & Anggota" },
          { id: "Unit Usaha", label: "Pengadaan & Gudang" },
          { id: "Operasional", label: "Kasir & Ritel" },
          { id: "Akuntansi", label: "Jurnal & Keuangan" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? "bg-slate-900 dark:bg-rose-700 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Daftar Topik Panduan Bergaya Card Lapang */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isExpanded = activeAccordion === topic.id;
          return (
            <Card
              key={topic.id}
              className={`transition-all ${
                isExpanded
                  ? "border-slate-300 dark:border-slate-700 shadow-sm"
                  : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                onClick={() => setActiveAccordion(isExpanded ? null : topic.id)}
                className="cursor-pointer p-5 md:p-6 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral" size="sm">
                      {topic.category}
                    </Badge>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 md:p-6 space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Langkah-Langkah Pelaksanaan:
                    </h4>
                    <ol className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                      {topic.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Kunci Keberhasilan</p>
                      <p className="text-amber-800 dark:text-amber-300/90">{topic.tips}</p>
                    </div>
                  </div>

                  {topic.actionUrl && (
                    <div className="pt-2 flex justify-end">
                      <ButtonLink href={topic.actionUrl} variant="primary" size="default" className="gap-2">
                          {topic.actionLabel || "Buka Modul"}
                          <ArrowRight className="h-4 w-4" />
                        </ButtonLink>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
