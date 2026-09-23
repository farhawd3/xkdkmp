"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Inbox,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCcw,
  Search,
  Filter,
  ArrowUpRight,
  Store,
  ClipboardList,
  Package,
  MessageSquareWarning,
  Eye,
  Info,
} from "lucide-react";
import { Card, CardContent, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { WorkDeskItem } from "@/app/api/manager/work-desk/route";
import { formatTanggal, getTodayWIB } from "@/lib/utils";

export default function MejaKerjaPage() {
  const [items, setItems] = useState<WorkDeskItem[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    perlu_sekarang: 0,
    hari_ini: 0,
    pantau: 0,
    selesai: 0,
  });
  const [partialErrors, setPartialErrors] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter State
  const [urgencyFilter, setUrgencyFilter] = useState<string>("semua");
  const [sourceFilter, setSourceFilter] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { showToast } = useToast();

  const loadWorkDesk = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/manager/work-desk");
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal memuat antrian Meja Kerja.");
      }
      setItems(result.items || []);
      setSummary(result.summary || { total: 0, perlu_sekarang: 0, hari_ini: 0, pantau: 0, selesai: 0 });
      setPartialErrors(result.partialErrors || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memuat antrian.";
      setLoadError(msg);
      showToast("error", "Gagal Memuat", msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkDesk();
  }, []);

  // Filter Data
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (urgencyFilter !== "semua" && item.urgency !== urgencyFilter) {
        return false;
      }
      if (sourceFilter !== "semua" && item.source !== sourceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchUnit = item.unitName?.toLowerCase().includes(q) || false;
        const matchPic = item.picName?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchUnit && !matchPic) {
          return false;
        }
      }
      return true;
    });
  }, [items, urgencyFilter, sourceFilter, searchQuery]);

  const isFilterActive = urgencyFilter !== "semua" || sourceFilter !== "semua" || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setUrgencyFilter("semua");
    setSourceFilter("semua");
    setSearchQuery("");
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "tugas":
        return <ClipboardList className="h-4 w-4 text-primary" />;
      case "rekap_gerai":
        return <Store className="h-4 w-4 text-emerald-600" />;
      case "kendala":
        return <MessageSquareWarning className="h-4 w-4 text-amber-600" />;
      case "stok":
        return <Package className="h-4 w-4 text-rose-600" />;
      default:
        return <Inbox className="h-4 w-4 text-slate-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "tugas":
        return "Tugas Operasional";
      case "rekap_gerai":
        return "Laporan Rekap";
      case "kendala":
        return "Kendala Lapangan";
      case "stok":
        return "Stok Barang";
      default:
        return "Operasional";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "perlu_sekarang":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
            Perlu Sekarang
          </span>
        );
      case "hari_ini":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Hari Ini
          </span>
        );
      case "pantau":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            Pantau
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Tercatat Selesai
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingState label="Menghimpun antrian tindak lanjut Meja Kerja…" />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadWorkDesk} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Manajer" },
          { label: "Meja Kerja", active: true },
        ]}
        title="Meja Kerja Manajer"
        description="Pusat antrian tindak lanjut prioritas harian terpadu lintas gerai usaha, tugas operasional, kendala lapangan, dan ketersediaan stok fisik."
        badgeText="Daily Action Hub"
        actions={
          <Button
            variant="outline"
            onClick={loadWorkDesk}
            disabled={isLoading}
            className="min-h-11 px-4 gap-2 font-semibold shadow-sm"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Perbarui Antrian</span>
          </Button>
        }
      />

      {/* Peringatan Parsial jika ada query yang terganggu */}
      {partialErrors && partialErrors.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs md:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Sebagian Data Belum Tersedia dari Supabase:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800 dark:text-amber-300">
              {partialErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4 Kartu Metrik Ringkasan Antrian */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Total Antrian"
          value={summary.total}
          icon={<Inbox className="h-4 w-4" />}
          subtitle="Seluruh item dalam pantauan"
          accent="neutral"
        />
        <CardMetric
          title="Perlu Sekarang"
          value={summary.perlu_sekarang}
          icon={<AlertOctagon className="h-4 w-4 text-rose-600" />}
          accent="crimson"
          subtitle="Tugas lewat tenggat & stok kosong"
        />
        <CardMetric
          title="Hari Ini"
          value={summary.hari_ini}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          accent="amber"
          subtitle="Tenggat hari ini & gerai belum lapor"
        />
        <CardMetric
          title="Dalam Pantauan"
          value={summary.pantau}
          icon={<Eye className="h-4 w-4 text-sky-600" />}
          accent="sky"
          subtitle="Stok menipis & kendala lapangan"
        />
      </div>

      {/* Bilah Filter & Pencarian Terpadu */}
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Filter Urgensi */}
            <div className="space-y-1.5">
              <label htmlFor="filter-urgency" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tingkat Urgensi
              </label>
              <select
                id="filter-urgency"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="semua">Semua Urgensi</option>
                <option value="perlu_sekarang">Perlu Sekarang</option>
                <option value="hari_ini">Hari Ini</option>
                <option value="pantau">Pantau</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            {/* Filter Sumber Data */}
            <div className="space-y-1.5">
              <label htmlFor="filter-source" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sumber Masalah
              </label>
              <select
                id="filter-source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full h-11 px-3 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="semua">Semua Sumber Data</option>
                <option value="tugas">Tugas Operasional</option>
                <option value="rekap_gerai">Rekapitulasi Gerai</option>
                <option value="kendala">Kendala Lapangan</option>
                <option value="stok">Barang & Stok</option>
              </select>
            </div>

            {/* Pencarian Teks */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="filter-search" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pencarian Isu / Gerai / PIC
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Cari judul tugas, nama barang, atau gerai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Indikator Filter Aktif */}
          {isFilterActive && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{items.length}</strong> item antrian.
              </span>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-primary-container h-8">
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daftar Antrian Tindak Lanjut */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={isFilterActive ? "Tidak ada antrian yang cocok" : "Semua Operasional Terkendali"}
          description={
            isFilterActive
              ? "Coba ubah kriteria pencarian atau pilihan filter di atas."
              : "Tidak ada tindak lanjut tertunda dari data yang tercatat saat ini. Seluruh gerai, tugas, dan stok terpantau aman."
          }
          action={
            isFilterActive ? (
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="hover:border-slate-300 dark:hover:border-slate-700 transition-shadow duration-200"
            >
              <CardContent className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getUrgencyBadge(item.urgency)}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {getSourceIcon(item.source)}
                      {getSourceLabel(item.source)}
                    </span>
                    {item.metricBadge && (
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.metricBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.unitName && (
                      <span className="flex items-center gap-1 font-medium">
                        <Store className="h-3 w-3" />
                        {item.unitName}
                      </span>
                    )}
                    {item.picName && (
                      <span className="font-medium">
                        PIC: <strong className="text-slate-700 dark:text-slate-300">{item.picName}</strong>
                      </span>
                    )}
                    {item.dateStr && (
                      <span>Tanggal: {formatTanggal(item.dateStr)}</span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                  <Link
                    href={item.actionUrl}
                    className="inline-flex min-h-11 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-primary-container px-4 text-xs md:text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
