"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Shield,
  Wallet,
  ShoppingBag,
  FileText,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { Member, MemberStatus } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export default function DetailAnggotaPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = typeof params?.id === "string" ? params.id : "";

  const [member, setMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<"profil" | "status" | "simpanan" | "partisipasi" | "dokumen">("profil");
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadMember() {
      if (!memberId) return;
      try {
        const data = await preparationRepository.getMemberById(memberId);
        setMember(data);
      } catch (err) {
        console.error("Gagal memuat data anggota:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMember();
  }, [memberId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Memuat data rincian anggota...
      </div>
    );
  }

  // Jika ID tidak ditemukan, tampilkan Not Found khusus modul anggota
  if (!member) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4 border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Anggota Tidak Ditemukan</h2>
        <p className="mt-1 max-w-sm text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Nomor identitas anggota dengan ID &quot;{memberId}&quot; tidak terdaftar dalam basis data koperasi.
        </p>
        <div className="mt-6">
          <ButtonLink href="/anggota" variant="primary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Anggota
            </ButtonLink>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async (newStatus: MemberStatus) => {
    const updated = await preparationRepository.updateMember(member.id, {
      status: newStatus,
    });
    if (updated) {
      setMember(updated);
      showToast("success", "Status Anggota Diperbarui", `Status berhasil diubah menjadi ${newStatus.toUpperCase()}.`);
    }
  };

  const handleArchive = async () => {
    const success = await preparationRepository.archiveMember(member.id);
    if (success) {
      showToast("info", "Data Anggota Diarsipkan", "Anggota telah diarsipkan tanpa menghapus rekam jejak.");
      router.push("/anggota");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: "Kelembagaan", href: "/anggota" },
          { label: "Data Anggota", href: "/anggota" },
          { label: member.fullName, active: true },
        ]}
      />

      {/* Header Detail Anggota */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-primary dark:text-rose-400 font-bold text-lg">
              {member.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{member.fullName}</h1>
                <Badge
                  variant={
                    member.status === "aktif"
                      ? "success"
                      : member.status === "terverifikasi"
                      ? "info"
                      : member.status === "calon"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {member.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                No. Anggota: <strong className="text-slate-700 dark:text-slate-300">{member.memberNo}</strong> • Terdaftar sejak: {member.joinDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink href="/anggota" variant="outline" size="sm" className="gap-1 text-xs">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </ButtonLink>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveModalOpen(true)}
              className="gap-1 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Archive className="h-4 w-4" />
              Arsipkan
            </Button>
          </div>
        </div>

        {/* Tab Navigasi Detail */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          {[
            { id: "profil", label: "Profil Lengkap", icon: User },
            { id: "status", label: "Status & Verifikasi", icon: Shield },
            { id: "simpanan", label: "Buku Simpanan", icon: Wallet },
            { id: "partisipasi", label: "Partisipasi Belanja", icon: ShoppingBag },
            { id: "dokumen", label: "Dokumen Identitas", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Konten Tab 1: Profil Lengkap */}
      {activeTab === "profil" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Identitas Kependudukan</CardTitle>
              <CardDescription>Biodata resmi warga terdaftar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Nama Lengkap:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{member.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Nomor Anggota:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{member.memberNo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">NIK (Masked):</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{member.maskedNik}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Pekerjaan:</span>
                <span className="text-slate-800 dark:text-slate-200">{member.job || "-"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Pendaftaran:</span>
                <span className="text-slate-800 dark:text-slate-200">{member.joinDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Domisili & Kontak</CardTitle>
              <CardDescription>Wilayah tempat tinggal di Nagari Ladang Laweh.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Domisili Jorong:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{member.domicile}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Nomor Telepon / WA:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{member.phone}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
                Nomor kontak ini digunakan untuk koordinasi kehadiran dalam Rapat Anggota Tahunan (RAT)
                dan konfirmasi pengambilan SHU.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Konten Tab 2: Status & Verifikasi */}
      {activeTab === "status" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tahapan Siklus Keanggotaan</CardTitle>
            <CardDescription>
              Perubahan status keanggotaan mengikuti alur: Calon → Terverifikasi → Aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Status Saat Ini:</span>
                <Badge
                  variant={
                    member.status === "aktif"
                      ? "success"
                      : member.status === "terverifikasi"
                      ? "info"
                      : "warning"
                  }
                >
                  {member.status.toUpperCase()}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 mr-2">Simulasikan Ubah Status:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("calon")}
                  className="text-xs h-8"
                >
                  Calon
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("terverifikasi")}
                  className="text-xs h-8"
                >
                  Terverifikasi
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus("aktif")}
                  className="text-xs h-8"
                >
                  Aktif
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("nonaktif")}
                  className="text-xs h-8 text-slate-600 dark:text-slate-400"
                >
                  Nonaktif
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Ketentuan Arsip &amp; Audit</p>
                <p className="text-amber-800 dark:text-amber-300">
                  Koperasi tidak mengizinkan tombol hapus permanen yang melenyapkan sejarah keanggotaan.
                  Jika anggota mengundurkan diri atau dinonaktifkan, gunakan fitur arsipkan agar seluruh
                  riwayat tetap tersedia selama sesi ini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konten Tab 3: Buku Simpanan */}
      {activeTab === "simpanan" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Simpanan Pokok
                </span>
                <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatRupiah(member.simpananPokokAmount)}
                </div>
                <Badge variant={member.simpananPokokPaid ? "success" : "warning"} className="mt-2">
                  {member.simpananPokokPaid ? "Lunas" : "Belum Disetorkan"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Simpanan Wajib
                </span>
                <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatRupiah(member.simpananWajibAmount)}
                </div>
                <Badge variant={member.simpananWajibPaid ? "success" : "neutral"} className="mt-2">
                  {member.simpananWajibPaid ? "Tercatat" : "Belum Berjalan"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <EmptyState
            icon={<Wallet className="h-7 w-7 text-slate-400 dark:text-slate-500" />}
            title="Buku Simpanan Menunggu Modul Akuntansi & Kas"
            description="Pendaftaran identitas anggota tidak menandai simpanan pokok telah disetor. Mutasi simpanan akan diverifikasi otomatis saat modul transaksi keuangan resmi diaktifkan."
            action={
              <ButtonLink href="/keuangan" variant="outline" size="sm">
                  Periksa Modul Kas & Simpanan
                </ButtonLink>
            }
          />
        </div>
      )}

      {/* Konten Tab 4: Partisipasi Belanja */}
      {activeTab === "partisipasi" && (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7 text-slate-400 dark:text-slate-500" />}
          title="Belum Ada Riwayat Belanja di Gerai Sembako"
          description="Gerai Sembako Ladang Laweh saat ini masih dalam tahap persiapan fisik. Rekam jejak partisipasi belanja anggota akan tercatat otomatis saat kasir POS mulai melayani transaksi."
          action={
            <ButtonLink href="/unit-usaha" variant="outline" size="sm">
                Lihat Kesiapan Gerai Sembako
              </ButtonLink>
          }
        />
      )}

      {/* Konten Tab 5: Dokumen Identitas */}
      {activeTab === "dokumen" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dokumen Persyaratan Keanggotaan</CardTitle>
            <CardDescription>Status kelengkapan berkas fisik untuk akta notaris.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Fotokopi KTP / Identitas</span>
                  <span className="text-slate-500 dark:text-slate-400">Status: Belum diunggah / Berkas fisik di kantor desa</span>
                </div>
              </div>
              <Badge variant="neutral">Belum Diperiksa</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Surat Pernyataan Kesediaan Anggota</span>
                  <span className="text-slate-500 dark:text-slate-400">Status: Menunggu tanda tangan basah musyawarah</span>
                </div>
              </div>
              <Badge variant="neutral">Belum Diperiksa</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konfirmasi Arsipkan Anggota */}
      <ConfirmDialog
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchive}
        title="Arsipkan Data Anggota"
        message={`Apakah Anda yakin ingin mengarsipkan ${member.fullName}? Data akan dipindahkan ke status nonaktif dan riwayat keanggotaan tetap tersimpan dalam sistem.`}
        confirmText="Ya, Arsipkan Anggota"
        cancelText="Batal"
      />
    </div>
  );
}
