"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  CheckCircle2,
  Archive,
  Info,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { MemberRecord } from "@/types/models";
import { formatTanggal } from "@/lib/utils";

export default function DetailAnggotaPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = typeof params?.id === "string" ? params.id : "";

  const [member, setMember] = useState<MemberRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"profil" | "status" | "simpanan" | "partisipasi" | "dokumen">("profil");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  const loadMember = async () => {
    if (!memberId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/members?id=${memberId}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          setMember(null);
          return;
        }
        throw new Error("Gagal mengambil data anggota dari server.");
      }
      const data = await res.json();
      setMember(data.member || null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kendala saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [memberId]);

  if (isLoading) {
    return <LoadingState label="Memuat rincian data anggota dari Supabase..." />;
  }

  if (errorMsg) {
    return <ErrorState message={errorMsg} onRetry={loadMember} />;
  }

  if (!member) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4 border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Anggota Tidak Ditemukan</h2>
        <p className="mt-1 max-w-sm text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Data anggota dengan ID &quot;{memberId}&quot; tidak terdaftar dalam database koperasi.
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

  const handleUpdateStatus = async (newStatus: "calon" | "aktif" | "nonaktif") => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Gagal memperbarui status.");
      }
      const data = await res.json();
      setMember(data.member);
      showToast("success", "Status Anggota Diperbarui", `Status berhasil diubah menjadi ${newStatus.toUpperCase()}.`);
    } catch (err) {
      showToast("error", "Pembaruan Gagal", err instanceof Error ? err.message : "Gagal memperbarui status anggota.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, is_archived: true }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Gagal mengarsipkan anggota.");
      }
      showToast("info", "Data Anggota Diarsipkan", "Anggota telah diarsipkan tanpa menghapus riwayat kelembagaan.");
      router.push("/anggota");
    } catch (err) {
      showToast("error", "Arsip Gagal", err instanceof Error ? err.message : "Gagal mengarsipkan anggota.");
    } finally {
      setIsUpdating(false);
      setIsArchiveModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: "Kelembagaan", href: "/anggota" },
          { label: "Data Anggota", href: "/anggota" },
          { label: member.full_name, active: true },
        ]}
      />

      {/* Header Detail Anggota */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-primary dark:text-rose-400 font-bold text-lg">
              {member.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{member.full_name}</h1>
                <Badge
                  variant={
                    member.status === "aktif"
                      ? "success"
                      : member.status === "calon"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {member.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                No. Anggota: <strong className="text-slate-700 dark:text-slate-300">{member.member_number}</strong> • Terdaftar: {formatTanggal(member.join_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink href="/anggota" variant="outline" size="sm" className="gap-1.5 min-h-11 px-4 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </ButtonLink>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsArchiveModalOpen(true)}
              className="gap-1.5 min-h-11 px-4 text-xs font-semibold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40"
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
            { id: "partisipasi", label: "Partisipasi Gerai", icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
              <CardTitle className="text-base">Informasi Identitas Anggota</CardTitle>
              <CardDescription>Biodata resmi warga terdaftar dalam database.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Nama Lengkap:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{member.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Nomor Anggota:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{member.member_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Status Keanggotaan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{member.status}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Pendaftaran:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatTanggal(member.join_date)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontak & Catatan</CardTitle>
              <CardDescription>Komunikasi dan catatan penanggung jawab keanggotaan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Nomor Telepon / WA:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{member.phone || "Tidak ada nomor"}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold block mb-1">Catatan Tambahan:</span>
                <p className="italic">{member.notes ? `"${member.notes}"` : "Belum ada catatan khusus."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Konten Tab 2: Status & Verifikasi */}
      {activeTab === "status" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengaturan Status Keanggotaan</CardTitle>
            <CardDescription>Tentukan status kepatuhan dan keaktifan warga dalam koperasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Status Saat Ini:</span>
              <Badge variant={member.status === "aktif" ? "success" : member.status === "calon" ? "warning" : "neutral"} className="text-sm">
                {member.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ubah Status Menjadi:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={member.status === "aktif" ? "primary" : "outline"}
                  disabled={isUpdating || member.status === "aktif"}
                  onClick={() => handleUpdateStatus("aktif")}
                  className="min-h-11 px-4 text-xs"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Tetapkan Aktif
                </Button>
                <Button
                  size="sm"
                  variant={member.status === "calon" ? "primary" : "outline"}
                  disabled={isUpdating || member.status === "calon"}
                  onClick={() => handleUpdateStatus("calon")}
                  className="min-h-11 px-4 text-xs"
                >
                  Tetapkan Calon
                </Button>
                <Button
                  size="sm"
                  variant={member.status === "nonaktif" ? "primary" : "outline"}
                  disabled={isUpdating || member.status === "nonaktif"}
                  onClick={() => handleUpdateStatus("nonaktif")}
                  className="min-h-11 px-4 text-xs text-slate-600"
                >
                  Nonaktifkan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konten Tab 3: Simpanan */}
      {activeTab === "simpanan" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-600" />
              Buku Catatan Simpanan Anggota
            </CardTitle>
            <CardDescription>Pencatatan simpanan pokok, simpanan wajib, dan sukarela.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Pencatatan simpanan resmi dilakukan terpusat melalui pembukuan kas pada menu <strong>/keuangan</strong>. Sesuai prinsip kejujuran data, rekapitulasi mutasi simpanan per individu akan ditautkan setelah modul buku besar simpanan disahkan pada RAT awal 2027.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konten Tab 4: Partisipasi Gerai */}
      {activeTab === "partisipasi" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-sky-600" />
              Partisipasi Belanja di Gerai Koperasi
            </CardTitle>
            <CardDescription>Pemantauan aktivitas anggota pada unit-unit usaha nagari.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Seluruh gerai koperasi saat ini berada dalam tahap persiapan operasional (Kickoff awal 2027). Rekam jejak transaksi anggota akan otomatis terakumulasi untuk perhitungan pembagian Jasa Usaha SHU setelah gerai beroperasi aktif.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Konfirmasi Arsip */}
      <ConfirmDialog
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Arsipkan Data Anggota?"
        message={`Anda akan mengarsipkan anggota "${member.full_name}" (${member.member_number}). Data tidak akan dihapus dari database Supabase, namun tidak lagi muncul di daftar aktif utama.`}
        confirmText="Ya, Arsipkan Anggota"
        cancelText="Batal"
        isDestructive
        isLoading={isUpdating}
        onConfirm={handleArchive}
      />
    </div>
  );
}
