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
    id: "pekerjaan",
    title: "Memulai hari dari Meja Kerja",
    category: "Operasional",
    summary: "Lihat pekerjaan mendesak, gerai yang belum melapor, dan stok yang perlu diperiksa.",
    steps: [
      "Buka Meja Kerja dan mulai dari kelompok Perlu Sekarang.",
      "Gunakan filter gerai atau sumber data bila daftar panjang.",
      "Buka item untuk menindaklanjuti pada modul asalnya; status baru berubah bila data sumber benar-benar diperbarui.",
    ],
    tips: "Daftar ini membantu memilih prioritas, bukan bukti bahwa seluruh kegiatan koperasi telah diperiksa.",
    actionUrl: "/meja-kerja",
    actionLabel: "Buka Meja Kerja",
  },
  {
    id: "anggota",
    title: "Mencatat data anggota",
    category: "Kelembagaan",
    summary: "Kelola daftar anggota tanpa menganggapnya sebagai buku simpanan.",
    steps: [
      "Buka Data Anggota untuk melihat daftar dan status yang sudah tersimpan.",
      "Tambahkan atau impor anggota hanya setelah nomor dan data pribadinya diperiksa.",
      "Perubahan status anggota tidak otomatis membukukan setoran simpanan.",
    ],
    tips: "Saat ini skema Supabase anggota masih perlu penyelarasan; jika halaman gagal dimuat, jangan mengulangi impor atau mengira daftar kosong.",
    actionUrl: "/anggota",
    actionLabel: "Buka Data Anggota",
  },
  {
    id: "rekap-gerai",
    title: "Membaca rekap dan kinerja gerai",
    category: "Unit Usaha",
    summary: "Catat angka harian lalu bandingkan keterisian rekap dan capaian target.",
    steps: [
      "Isi Pemantauan Gerai dari catatan penutupan harian yang benar.",
      "Periksa jumlah gerai aktif yang telah mengisi rekap pada dashboard.",
      "Buka Kinerja Gerai untuk melihat omset tercatat, target bila ada, dan keterisian rekap per periode.",
    ],
    tips: "Hari tanpa rekap bukan bukti omset nol. Selisih omset dan pengeluaran bukan laba bersih resmi.",
    actionUrl: "/kinerja-gerai",
    actionLabel: "Buka Kinerja Gerai",
  },
  {
    id: "stok",
    title: "Memeriksa stok fisik",
    category: "Unit Usaha",
    summary: "Pantau barang yang habis atau mencapai batas minimum tanpa mencatat transaksi kasir.",
    steps: [
      "Buka Barang & Stok dan saring barang yang perlu perhatian.",
      "Cocokkan angka yang terlihat dengan hitungan fisik di lokasi penyimpanan.",
      "Sesuaikan angka hanya setelah satuan barang dan alasan selisih dipahami.",
    ],
    tips: "Saat ini sistem menyimpan angka stok terakhir, belum mempunyai kartu mutasi/opname yang dapat menjelaskan semua perubahan.",
    actionUrl: "/stok",
    actionLabel: "Buka Barang & Stok",
  },
  {
    id: "keuangan",
    title: "Memahami angka keuangan",
    category: "Keuangan",
    summary: "Bedakan rekap operasional gerai dari buku kas dan laporan resmi.",
    steps: [
      "Buka Kas & Buku Besar untuk membaca penerimaan yang benar-benar tercatat.",
      "Bandingkan tanggal dan gerai sumber sebelum menarik kesimpulan.",
      "Gunakan Neraca & SHU sebagai ringkasan kerja dengan catatan batas data, bukan pengesahan otomatis.",
    ],
    tips: "Jurnal Simulasi adalah sarana belajar; jangan menyamakannya dengan pembukuan resmi transaksi nyata.",
    actionUrl: "/keuangan",
    actionLabel: "Buka Kas & Buku Besar",
  },
];

export default function BantuanPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("pekerjaan");

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
        description="Langkah sederhana memakai data gerai, tugas, stok, anggota, dan keuangan untuk keputusan manajer."
      />

      {/* 3 Kartu Metrik Ringkasan Atas (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Fokus Harian"
          value="Kesiapan Awal 2027"
          subtext="Penuntasan legalitas, gerai fisik, dan SOP"
          icon={<Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          trend={{ label: "Target 2027", positive: true }}
          accentColor="crimson"
         action={{ label: "Buka checklist", href: "/persiapan" }}/>
        <CardMetric
          title="Sumber Angka"
          value="Data tercatat"
          subtext="Angka diambil dari rekap dan tabel yang tersambung."
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          trend={{ label: "Cek sumber", positive: true }}
          accentColor="emerald"
         action={{ label: "Lihat pengaturan", href: "/pengaturan" }}/>
        <CardMetric
          title="Ruang Kerja"
          value="Pribadi manajer"
          subtext="Aplikasi tanpa layar login, untuk lingkungan privat."
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
            Apabila Anda menemui keraguan alur kerja di lapangan, rujuklah <strong>panduan operasional</strong> di
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
          { id: "Unit Usaha", label: "Gerai & Stok" },
          { id: "Operasional", label: "Prioritas Harian" },
          { id: "Keuangan", label: "Catatan Keuangan" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`min-h-11 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
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
