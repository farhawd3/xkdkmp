"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  Shield,
  ShieldCheck,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardMetric } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { downloadCsvFile } from "@/lib/csv";
import { formatTanggal, getTodayWIB } from "@/lib/utils";
import { MemberRecord } from "@/types/models";
import { MemberAddModal } from "@/components/anggota/MemberAddModal";
import { MemberImportModal } from "@/components/anggota/MemberImportModal";

export default function AnggotaPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, aktif: 0, calon: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/members?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Gagal memuat data anggota dari database.");
      }
      const data = await res.json();
      setMembers(data.members || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Handle Search Debounce / Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // Export CSV aman tanpa NIK
  const handleExportCsv = () => {
    if (members.length === 0) {
      showToast("info", "Tidak Ada Data", "Belum ada data anggota untuk diekspor.");
      return;
    }

    const headers = ["Nomor Anggota", "Nama Lengkap", "No. Telepon", "Status", "Tanggal Daftar", "Catatan"];
    const rows = members.map((m) => [
      m.member_number,
      m.full_name,
      m.phone || "-",
      m.status.toUpperCase(),
      m.join_date,
      m.notes || "",
    ]);

    downloadCsvFile(`daftar_anggota_koperasi_${getTodayWIB()}.csv`, [headers, ...rows]);
    showToast(
      "success",
      "Ekspor Data Berhasil",
      `${members.length} anggota diekspor dengan aman tanpa NIK.`
    );
  };

  const isFilterActive = searchQuery.trim() !== "" || statusFilter !== "all";

  if (isLoading && members.length === 0) {
    return <LoadingState label="Memuat database keanggotaan koperasi…" />;
  }

  if (loadError && members.length === 0) {
    return <ErrorState message={loadError} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Kelembagaan" },
          { label: "Data Anggota", active: true },
        ]}
        title="Data Anggota Koperasi"
        badgeText={`Total: ${summary.total} Warga Terdaftar`}
        badgeVariant="crimson"
        description="Database anggota warga Nagari Ladang Laweh. Pendaftaran terhubung langsung ke Supabase Cloud dan siap untuk validasi RAT 2027."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="default" onClick={handleExportCsv} className="min-h-11 gap-1.5 font-bold text-xs">
              <Download className="h-4 w-4 text-primary-container" />
              Ekspor CSV
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => setIsImportModalOpen(true)}
              className="min-h-11 gap-1.5 font-bold text-xs"
            >
              <Upload className="h-4 w-4" />
              Impor CSV
            </Button>

            <Button
              variant="primary"
              size="default"
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-11 gap-1.5 font-bold text-xs shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Tambah Anggota
            </Button>
          </div>
        }
      />

      {/* Edukasi Privasi & Tata Kelola */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-3 shadow-sm">
        <Shield className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-sky-950 dark:text-sky-100">Perlindungan Data Pribadi:</strong> Seluruh data anggota tersimpan privat di database PostgreSQL Supabase. Berkas ekspor CSV otomatis disanitasi tanpa NIK untuk mencegah kebocoran identitas kependudukan.
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkasan Anggota */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Total Anggota Terdaftar"
          value={`${summary.total} Orang`}
          subtitle="Warga Nagari Ladang Laweh terdata"
          icon={<Users className="h-4 w-4" />}
          trend={{ label: "Database Riil", positive: true }}
          accent="sky"
        />
        <CardMetric
          title="Anggota Aktif"
          value={`${summary.aktif} Orang`}
          subtitle="Status aktif penuh"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
          trend={{ label: "Status Aktif", positive: true }}
          accent="emerald"
        />
        <CardMetric
          title="Calon Anggota"
          value={`${summary.calon} Orang`}
          subtitle="Status draf pendaftaran"
          icon={<UserPlus className="h-4 w-4 text-amber-600" />}
          trend={{ label: "Pendaftar Baru", positive: false }}
          accent="amber"
        />
      </div>

      {/* Toolbar Filter & Pencarian */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Cari anggota"
                placeholder="Cari nama anggota, nomor anggota, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 pl-10 pr-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="min-w-44 flex-1 sm:flex-none">
              <Select
                aria-label="Filter status anggota"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="calon">Calon Anggota</option>
                <option value="nonaktif">Nonaktif</option>
              </Select>
              </div>

              <Button type="submit" variant="primary" size="sm" className="min-h-11 px-4 text-xs font-bold">
                Cari
              </Button>
            </div>
          </form>

          {isFilterActive && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Menampilkan {members.length} hasil pencarian.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabel Data Anggota */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          {members.length === 0 ? (
            <EmptyState
              title={isFilterActive ? "Tidak ada anggota yang cocok" : "Belum ada anggota terdaftar"}
              description={
                isFilterActive
                  ? "Coba ubah kriteria pencarian atau status filter."
                  : "Tambahkan warga pertama melalui tombol Tambah Anggota."
              }
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={isFilterActive ? handleResetFilters : () => setIsAddModalOpen(true)}
                >
                  {isFilterActive ? "Reset Filter" : "Tambah Anggota"}
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Anggota</th>
                    <th className="py-3.5 px-4">Nomor Anggota</th>
                    <th className="py-3.5 px-4">Kontak Telepon</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Tanggal Daftar</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/anggota/${m.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary-container">
                          {m.full_name}
                        </Link>
                        {m.notes && (
                          <span className="block text-[11px] text-slate-500 truncate max-w-xs">{m.notes}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {m.member_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {m.phone || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={m.status === "aktif" ? "success" : m.status === "calon" ? "warning" : "neutral"}>
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatTanggal(m.join_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ButtonLink
                          href={`/anggota/${m.id}`}
                          variant="outline"
                          size="sm"
                          className="min-h-11 sm:min-h-9 px-3 text-xs font-semibold gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Rincian
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah Anggota */}
      <MemberAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={loadData}
      />

      {/* Modal Impor CSV */}
      <MemberImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={loadData}
      />
    </div>
  );
}
