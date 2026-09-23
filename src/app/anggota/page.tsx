"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardMetric,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { Member } from "@/types";
import { parseCsv, serializeCsv } from "@/lib/csv";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AnggotaPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [summary, setSummary] = useState({ total: 0, calon: 0, verified: 0 });

  // State Modal Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [rawNik, setRawNik] = useState("");
  const [phone, setPhone] = useState("");
  const [domicile, setDomicile] = useState("");
  const [job, setJob] = useState("");
  const [formDirty, setFormDirty] = useState(false);

  // State Modal Import CSV
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [previewRows, setPreviewRows] = useState<{
    valid: { fullName: string; phone: string; domicile: string; nik?: string }[];
    errors: { row: number; error: string }[];
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/members?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data anggota dari database.");
      const data = await res.json();
      interface MemberApiRecord {
        id: string;
        member_number: string;
        full_name: string;
        phone: string | null;
        status: "calon" | "aktif" | "nonaktif";
        join_date: string;
        created_at: string;
      }
      const mapped: Member[] = (data.members || []).map((m: MemberApiRecord) => ({
        id: m.id,
        fullName: m.full_name,
        maskedNik: "",
        phone: m.phone || "-",
        domicile: "Ladang Laweh",
        job: "Warga",
        status: (m.status === "aktif" ? "verified" : m.status) as Member["status"],
        simpananPokokPaid: m.status === "aktif",
        simpananWajibPaid: m.status === "aktif",
        simpananPokokAmount: 0,
        simpananWajibAmount: 0,
        documentStatus: "lengkap",
        createdAt: m.created_at,
      }));
      setMembers(mapped);
      setTotalCount(data.summary?.total ?? mapped.length);
      setTotalPages(Math.max(1, Math.ceil(mapped.length / 6)));
      setSummary({
        total: data.summary?.total ?? mapped.length,
        calon: data.summary?.calon ?? 0,
        verified: data.summary?.aktif ?? 0,
      });
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, currentPage]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !fullName.trim()) return;
    setIsSaving(true);
    try {
      const memberNumber = `ANG-${String(totalCount + 1).padStart(3, "0")}`;
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_number: memberNumber,
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          status: "calon",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal mencatat anggota.");
      }

      showToast(
        "success",
        "Calon Anggota Berhasil Ditambahkan",
        `${fullName} terdaftar dengan nomor ${memberNumber}.`
      );

      // Reset form lengkap
      setFullName("");
      setRawNik("");
      setPhone("");
      setDomicile("");
      setJob("");
      setFormDirty(false);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Coba lagi. Isian Anda masih tersedia.";
      showToast("error", "Anggota belum dicatat", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    if (formDirty) {
      setIsCancelOpen(true);
    } else {
      setIsAddModalOpen(false);
    }
  };

  // Export CSV aman tanpa menyertakan NIK
  const handleExportCsv = async () => {
    try {
      const result = await preparationRepository.getMembers(searchQuery, statusFilter, 1, Math.max(1, totalCount));
      if (result.members.length === 0) {
        showToast("info", "Tidak Ada Data", "Belum ada data anggota untuk diekspor.");
        return;
      }

      const headers = ["Nomor Anggota", "Nama Lengkap", "No. Telepon", "Domisili Jorong", "Status", "Tanggal Daftar"];
      const rows = result.members.map((m) => [
        m.memberNo,
        m.fullName,
        m.phone,
        m.domicile,
        m.status.toUpperCase(),
        m.joinDate,
      ]);

      const csvContent = serializeCsv([headers, ...rows]);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `daftar_anggota_ladang_laweh_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(
        "success",
        "Ekspor Data Berhasil",
        `${result.members.length} anggota sesuai filter diekspor tanpa NIK.`
      );
    } catch {
      showToast("error", "Ekspor belum berhasil", "Data belum dapat diekspor. Coba lagi.");
    }
  };

  // Pratinjau & Validasi Data CSV
  const handlePreviewCsv = () => {
    if (!importText.trim()) {
      showToast("error", "Data Kosong", "Masukkan teks baris CSV untuk memeriksa data.");
      return;
    }
    setImportResult(null);
    try {
      const parsed = parseCsv(importText);
      const valid: { fullName: string; phone: string; domicile: string; nik?: string }[] = [];
      const errors: { row: number; error: string }[] = [];

      parsed.forEach((parts, idx) => {
        const rowNumber = idx + 1;
        // Deteksi baris header umum
        if (
          idx === 0 &&
          (parts[0]?.toLowerCase().includes("nama") ||
            parts[1]?.toLowerCase().includes("telepon") ||
            parts[1]?.toLowerCase().includes("hp"))
        ) {
          return;
        }

        if (parts.length < 3 || parts.length > 4) {
          errors.push({
            row: rowNumber,
            error: "Format kolom tidak sesuai. Wajib: Nama, Telepon, Domisili, [NIK opsional].",
          });
          return;
        }

        const personName = parts[0]?.trim() || "";
        const personPhone = parts[1]?.trim() || "";
        const personDomicile = parts[2]?.trim() || "";
        const personNik = parts[3]?.trim() || undefined;

        if (!personName || personName.length < 2) {
          errors.push({ row: rowNumber, error: "Nama lengkap minimal 2 karakter." });
          return;
        }
        if (!personPhone || personPhone.length < 5) {
          errors.push({ row: rowNumber, error: "Nomor telepon/WA tidak valid." });
          return;
        }
        if (!personDomicile) {
          errors.push({ row: rowNumber, error: "Domisili jorong tidak boleh kosong." });
          return;
        }
        if (personNik && !/^\d{16}$/.test(personNik)) {
          errors.push({ row: rowNumber, error: "NIK harus 16 digit angka jika diisi." });
          return;
        }

        valid.push({
          fullName: personName,
          phone: personPhone,
          domicile: personDomicile,
          nik: personNik,
        });
      });

      if (valid.length === 0 && errors.length === 0) {
        showToast("info", "Data Kosong", "Tidak ada baris data yang ditemukan.");
        return;
      }

      setPreviewRows({ valid, errors });
    } catch (err) {
      showToast("error", "Format CSV Belum Valid", err instanceof Error ? err.message : "Periksa tanda kutip dan koma pada teks.");
    }
  };

  // Eksekusi impor CSV ke repositori sesi setelah verifikasi
  const handleExecuteImport = async () => {
    if (!previewRows || previewRows.valid.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const result = await preparationRepository.importMembers(previewRows.valid);
      setImportResult(result);
      setPreviewRows(null);
      if (result.importedCount > 0) {
        showToast(
          "success",
          "Impor Berhasil",
          `${result.importedCount} calon anggota baru berhasil dicatat pada sesi ini.`
        );
        await loadData();
      }
    } catch (error) {
      showToast("error", "Impor belum berhasil", error instanceof Error ? error.message : "Terjadi kendala saat mencatat data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Baku */}
      <PageHeader
        breadcrumbItems={[
          { label: "Kelembagaan" },
          { label: "Data Anggota", active: true },
        ]}
        title="Data anggota"
        badgeText={`Mode Persiapan: ${totalCount} Terdaftar`}
        badgeVariant="crimson"
        description="Pendataan calon anggota pendiri Nagari Ladang Laweh. Pendaftaran awal bersifat pencatatan pendiri dan tidak menandai simpanan sudah disahkan lunas."
        actions={
          <>
            <Button variant="outline" size="default" onClick={handleExportCsv} className="gap-2">
              <Download className="h-4 w-4 text-slate-500" />
              Ekspor CSV (Tanpa NIK)
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => {
                setImportText("");
                setPreviewRows(null);
                setImportResult(null);
                setIsImportModalOpen(true);
              }}
              className="gap-2"
            >
              <Upload className="h-4 w-4 text-slate-500" />
              Impor CSV
            </Button>

            <Button
              variant="primary"
              size="default"
              onClick={() => {
                setFormDirty(false);
                setIsAddModalOpen(true);
              }}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Tambah anggota
            </Button>
          </>
        }
      />

      {/* Edukasi Privasi NIK & Simpanan */}
      <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-3 shadow-sm">
        <Shield className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-sky-950 dark:text-sky-100">Perlindungan Privasi & Tata Kelola Keuangan:</strong> Seluruh NIK warga nagari
          disamarkan secara otomatis di antarmuka publik dan dihilangkan dari file ekspor. Registrasi
          awal <strong>tidak otomatis mencatat simpanan pokok sudah lunas</strong> sampai bukti transfer
          ke kas/bank koperasi disetorkan dan diverifikasi.
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkasan Anggota */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Total Anggota Terdaftar"
          value={`${summary.total} Orang`}
          subtitle="Warga Nagari Ladang Laweh terdata"
          icon={<Users className="h-4 w-4" />}
          trend={{ label: "Warga Nagari", positive: true }}
          accentColor="sky"
          action={{ label: "Lihat semua anggota", onClick: () => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); } }}
        />
        <CardMetric
          title="Calon Anggota Pendiri"
          value={`${summary.calon} Orang`}
          subtitle="Status draf pendaftaran awal"
          icon={<UserPlus className="h-4 w-4" />}
          trend={{ label: "Pendaftar Awal", positive: false }}
          accentColor="amber"
          action={{ label: "Lihat calon anggota", onClick: () => { setSearchQuery(""); setStatusFilter("calon"); setCurrentPage(1); } }}
        />
        <CardMetric
          title="Status Verifikasi Berkas"
          value={`${summary.verified} Orang`}
          subtitle="Telah diverifikasi pengurus nagari"
          icon={<ShieldCheck className="h-4 w-4" />}
          trend={{ label: "Berkas Sah", positive: true }}
          accentColor="emerald"
          action={{ label: "Lihat status verifikasi", onClick: () => { setSearchQuery(""); setStatusFilter("verified"); setCurrentPage(1); } }}
        />
      </div>

      {/* Toolbar Filter & Pencarian */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama anggota, nomor anggota, atau jorong..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 pl-10 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-container w-full sm:w-auto"
              >
                <option value="all">Semua Status</option>
                <option value="calon">Calon Anggota</option>
                <option value="terverifikasi">Terverifikasi</option>
                <option value="verified">Terverifikasi / aktif</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-xs shrink-0"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Data Anggota */}
      {loadError ? (
        <ErrorState message="Data anggota gagal dimuat." onRetry={loadData} />
      ) : isLoading ? (
        <LoadingState />
      ) : totalCount === 0 && !searchQuery && statusFilter === "all" ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
          title="Belum Ada Anggota Terdaftar"
          description="Koperasi saat ini dalam mode persiapan. Mulai daftarkan nama calon pendiri koperasi nagari dengan mengklik tombol registrasi atau menggunakan impor data CSV."
          action={
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Daftarkan Anggota Pendiri Pertama
            </Button>
          }
        />
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Hasil Pencarian Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Tidak ada data anggota yang cocok dengan filter atau kata kunci &quot;{searchQuery}&quot;.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Hapus Filter Pencarian
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">No. Anggota</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Nama Lengkap</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">NIK (Masked)</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">No. Telepon</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Domisili Jorong</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {m.memberNo}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/anggota/${m.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary-container dark:hover:text-rose-400 transition-colors block"
                      >
                        {m.fullName}
                      </Link>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">{m.job || "Warga Ladang Laweh"}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {m.maskedNik}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-slate-700 dark:text-slate-300">{m.phone}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{m.domicile}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge
                        variant={
                          m.status === "aktif"
                            ? "success"
                            : m.status === "terverifikasi"
                            ? "info"
                            : m.status === "calon"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {m.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <ButtonLink href={`/anggota/${m.id}`} variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                        <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        Detail
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan {members.length} dari {totalCount} anggota terdaftar
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="gap-1 h-9"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="gap-1 h-9"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrasi Anggota Baru */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={isSaving ? () => {} : handleCancelAdd}
        title="Registrasi Calon Anggota Pendiri"
        description="Formulir pendataan identitas warga Nagari Ladang Laweh untuk berkas akta notaris."
        maxWidth="lg"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Nama Lengkap Sesuai KTP"
            placeholder="Contoh: Sutan Bagindo"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFormDirty(true);
            }}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Induk Kependudukan (16 Digit)"
              placeholder="1306xxxxxxxxxxxx"
              value={rawNik}
              maxLength={16}
              onChange={(e) => {
                setRawNik(e.target.value);
                setFormDirty(true);
              }}
              inputMode="numeric"
              pattern="[0-9]{16}"
              helperText="Opsional. Isi 16 angka; tampilan NIK akan disamarkan."
            />

            <Input
              label="Nomor Telepon / WhatsApp"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFormDirty(true);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Jorong / Domisili Ladang Laweh"
              value={domicile}
              onChange={(e) => {
                setDomicile(e.target.value);
                setFormDirty(true);
              }}
              options={[
                { value: "", label: "-- Pilih Jorong / Domisili --" },
                { value: "Jorong Ladang Laweh Barat", label: "Jorong Ladang Laweh Barat" },
                { value: "Jorong Ladang Laweh Timur", label: "Jorong Ladang Laweh Timur" },
                { value: "Jorong Pincuran Tujuah", label: "Jorong Pincuran Tujuah" },
                { value: "Luar Wilayah (Mitra Khusus)", label: "Luar Wilayah (Mitra Khusus)" },
              ]}
            />

            <Input
              label="Pekerjaan Utama"
              value={job}
              onChange={(e) => {
                setJob(e.target.value);
                setFormDirty(true);
              }}
            />
          </div>

          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Catatan Otoritas Keanggotaan</p>
              <p className="text-amber-800 dark:text-amber-300">
                Registrasi ini menetapkan status sebagai <strong>Calon Anggota</strong>. Penyetoran simpanan pokok
                baru dicatat saat rekening bank koperasi telah disahkan.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={handleCancelAdd} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
              {isSaving ? "Menyimpan Calon Anggota..." : "Simpan Calon Anggota"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Impor Data CSV */}
      <Dialog
        isOpen={isImportModalOpen}
        onClose={() => {
          if (!isSaving) {
            setIsImportModalOpen(false);
            setPreviewRows(null);
            setImportResult(null);
          }
        }}
        title="Impor Data Anggota (CSV)"
        description="Periksa dan pratinjau data calon anggota sebelum dimasukkan ke repositori sesi."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Format Kolom CSV:</p>
            <p className="font-mono text-slate-600 dark:text-slate-400">
              Nama Lengkap, No. Telepon, Domisili Jorong, [NIK 16 Digit Opsional]
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Contoh: <code className="rounded bg-slate-200/70 dark:bg-slate-700 px-1 py-0.5 font-mono">Budi Santoso, 081234567890, Jorong Ladang Laweh Barat, 1306010101900001</code>
            </p>
          </div>

          {!previewRows && !importResult && (
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tempelkan Teks CSV:
              </label>
              <textarea
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Tempel baris teks CSV di sini..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          )}

          {previewRows && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {previewRows.valid.length} baris valid siap diimpor ke repositori sesi.
                </div>
                {previewRows.errors.length > 0 && (
                  <div className="space-y-1 text-red-700 dark:text-red-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <p className="font-bold">Baris tidak valid ({previewRows.errors.length}):</p>
                    <ul className="list-disc pl-5 space-y-0.5 max-h-24 overflow-y-auto">
                      {previewRows.errors.map((err, i) => (
                        <li key={i}>
                          Baris {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {previewRows.valid.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Telepon</th>
                        <th className="px-3 py-2">Domisili</th>
                        <th className="px-3 py-2">NIK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {previewRows.valid.slice(0, 4).map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-1.5 font-medium">{row.fullName}</td>
                          <td className="px-3 py-1.5 font-mono">{row.phone}</td>
                          <td className="px-3 py-1.5">{row.domicile}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-500">
                            {row.nik ? `${row.nik.substring(0, 4)}**********${row.nik.substring(14)}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.valid.length > 4 && (
                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-[11px] text-slate-500 text-center">
                      ... dan {previewRows.valid.length - 4} baris lainnya
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 p-4 space-y-2 text-xs bg-emerald-50/70 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {importResult.importedCount} data calon anggota berhasil dicatat.
              </div>
              <p className="text-emerald-800 dark:text-emerald-400">
                Data telah tersimpan di repositori memori sesi aktif dan daftar anggota telah diperbarui.
              </p>
              {importResult.errors.length > 0 && (
                <div className="space-y-1 text-red-700 dark:text-red-400 pt-2 border-t border-emerald-200 dark:border-emerald-900/40">
                  <p className="font-bold">Baris yang dilewati ({importResult.errors.length}):</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>
                        Baris {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                setIsImportModalOpen(false);
                setPreviewRows(null);
                setImportResult(null);
              }}
            >
              {importResult ? "Selesai" : "Batal"}
            </Button>

            {!previewRows && !importResult && (
              <Button variant="primary" onClick={handlePreviewCsv}>
                Periksa & Pratinjau CSV
              </Button>
            )}

            {previewRows && (
              <>
                <Button
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setPreviewRows(null)}
                >
                  Ubah Teks CSV
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExecuteImport}
                  isLoading={isSaving}
                  disabled={isSaving || previewRows.valid.length === 0}
                >
                  Impor ke Repositori ({previewRows.valid.length} Data)
                </Button>
              </>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Batalkan isian anggota?"
        message="Isian formulir yang belum dicatat akan dibuang."
        confirmText="Buang isian"
        isDestructive
        onConfirm={() => {
          setFullName("");
          setRawNik("");
          setPhone("");
          setDomicile("");
          setJob("");
          setFormDirty(false);
          setIsAddModalOpen(false);
          setIsCancelOpen(false);
        }}
      />
    </div>
  );
}
