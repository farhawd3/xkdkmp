"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  ShieldCheck,
  Save,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  Palette,
  Sun,
  Moon,
  Monitor,
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
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { OrganizationProfile } from "@/types";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTheme, type ThemePreference } from "@/lib/ThemeContext";

export default function PengaturanPage() {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [region, setRegion] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { showToast } = useToast();
  const { theme, preference, setTheme } = useTheme();

  const appearanceOptions: Array<{
    value: ThemePreference;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    { value: "light", label: "Terang", description: "Cerah dan lembut untuk ruangan terang.", icon: <Sun className="h-5 w-5" /> },
    { value: "dark", label: "Gelap", description: "Nyaman untuk kerja malam dan cahaya rendah.", icon: <Moon className="h-5 w-5" /> },
    { value: "system", label: "Ikuti perangkat", description: "Berubah mengikuti pengaturan tablet atau komputer.", icon: <Monitor className="h-5 w-5" /> },
  ];

  const loadProfile = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await preparationRepository.getOrganizationProfile();
      setProfile(data);
      setDisplayName(data.displayName);
      setLegalName(data.legalName);
      setRegion(data.region);
      setFullAddress(data.fullAddress);
      setFiscalYear(data.fiscalYear);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await preparationRepository.updateOrganizationProfile({
        displayName,
        legalName,
        region,
        fullAddress,
        fiscalYear,
      });
      setProfile(updated);
      setIsDirty(false);
      showToast(
        "success",
        "Pengaturan Disimpan",
        "Profil organisasi berhasil diperbarui dalam repositori persiapan."
      );
    } catch (err) {
      showToast("error", "Gagal Menyimpan", "Terjadi kendala saat menyimpan perubahan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setLegalName(profile.legalName);
      setRegion(profile.region);
      setFullAddress(profile.fullAddress);
      setFiscalYear(profile.fiscalYear);
      setIsDirty(false);
      showToast("info", "Perubahan Dibatalkan", "Formulir dikembalikan ke data awal.");
    }
  };

  if (loadError) {
    return (
      <ErrorState
        message="Profil organisasi belum dapat dimuat. Coba lagi untuk mengambil data sesi."
        onRetry={loadProfile}
      />
    );
  }

  if (isLoading || !profile) {
    return <LoadingState label="Memuat profil organisasi..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Sistem" },
          { label: "Pengaturan Profil & Tata Kelola", active: true },
        ]}
        title="Profil & pengaturan"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Identitas formal koperasi desa, tahun buku draf, dan status verifikasi dokumen hukum."
        actions={
          isDirty ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="default" onClick={handleReset}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="default"
                onClick={handleSave}
                isLoading={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* 3 Kartu Metrik Ringkasan Pengaturan (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Nama Tampilan Organisasi"
          value={profile.displayName}
          subtitle={profile.region || "Wilayah belum diisi"}
          icon={<Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          trend={{ label: "Identitas Sementara", positive: true }}
          accentColor="crimson"
         action={{ label: "Periksa dokumen organisasi", href: "/tata-kelola" }}/>
        <CardMetric
          title="Legalitas AHU & SK Menteri"
          value={profile.legalDocStatus === "terbit" ? "Terbit (catatan sesi)" : profile.legalDocStatus === "dalam_proses" ? "Dalam proses" : "Belum diunggah"}
          subtitle="Status mengikuti dokumen yang telah diperiksa."
          icon={<ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          trend={{ label: "Prinsip Jujur", positive: false }}
          accentColor="amber"
         action={{ label: "Buka kesiapan legalitas", href: "/persiapan" }}/>
        <CardMetric
          title="Tahun Buku & Konvensi"
          value={profile.fiscalYear || "Belum ditetapkan"}
          subtitle="Asia/Jakarta • Rupiah (IDR) Standar"
          icon={<Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          trend={{ label: "Tahun Buku Draf", positive: true }}
          accentColor="sky"
         action={{ label: "Lihat laporan", href: "/laporan" }}/>
      </div>

      {/* Peringatan Integritas Dokumen Hukum */}
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Kepatuhan Hukum &amp; Larangan Data Fiktif</p>
          <p className="text-amber-800 dark:text-amber-300/90">
            Nama badan hukum resmi dikosongkan secara sengaja sampai Akta Notaris dan SK Pengesahan
            Kemenkumham/Kemenkop terbit secara sah. Dilarang mencantumkan nomor AHU contoh, nomor izin palsu,
            atau nomor rekening bank fiktif.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-rose-100/90 bg-gradient-to-br from-white via-white to-rose-50/60 dark:border-slate-700 dark:from-[#252F40] dark:via-[#252F40] dark:to-[#302534]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-5 w-5 text-primary-container dark:text-rose-300" />
            Kenyamanan Tampilan
          </CardTitle>
          <CardDescription>
            Pilihan ini hanya mengubah tampilan pada perangkat yang sedang digunakan dan tidak mengubah data koperasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3" role="radiogroup" aria-label="Pilih tema tampilan">
            {appearanceOptions.map((option) => {
              const isActive = preference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    setTheme(option.value);
                    showToast("success", "Tampilan Diperbarui", `Mode ${option.label.toLowerCase()} digunakan pada perangkat ini.`);
                  }}
                  className={`min-h-[92px] rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary-container bg-rose-50/80 shadow-sm ring-2 ring-rose-100 dark:border-rose-400 dark:bg-rose-950/30 dark:ring-rose-950/60"
                      : "border-slate-200 bg-white/80 hover:border-rose-200 hover:bg-rose-50/40 dark:border-slate-700 dark:bg-slate-900/45 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-primary-container text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {option.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{option.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{option.description}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tampilan aktif saat ini: <strong className="text-slate-700 dark:text-slate-200">{theme === "dark" ? "gelap" : "terang"}</strong>.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Kolom 1: Identitas Tampilan & Legalitas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-container dark:text-rose-400" />
                Identitas Lembaga Koperasi
              </CardTitle>
              <CardDescription>Nama dagang dan nama badan hukum formal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Tampilan Organisasi (Sementara)"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setIsDirty(true);
                }}
                required
                helperText="Digunakan pada kop surat draf dan antarmuka aplikasi."
              />

              <Input
                label="Nama Badan Hukum Resmi (SK Kemenkumham)"
                value={legalName}
                placeholder="[Kosong - Menunggu Penerbitan SK Notaris]"
                onChange={(e) => {
                  setLegalName(e.target.value);
                  setIsDirty(true);
                }}
                helperText="Biarkan kosong sampai akta notaris resmi disahkan."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tahun Buku Berjalan"
                  value={fiscalYear}
                  onChange={(e) => {
                    setFiscalYear(e.target.value);
                    setIsDirty(true);
                  }}
                  required
                />

                <Input
                  label="Zona Waktu Operasional"
                  value={profile.timeZone}
                  disabled
                  helperText="Baku sistem: Waktu Indonesia Barat"
                />
              </div>
            </CardContent>
          </Card>

          {/* Kolom 2: Wilayah Kerja & Kantor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                Wilayah Kerja & Alamat Kantor
              </CardTitle>
              <CardDescription>Kedudukan hukum di Nagari Ladang Laweh.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Cakupan Wilayah Koperasi"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setIsDirty(true);
                }}
                required
              />

              <Textarea
                rows={3}
                label="Alamat Kantor Persiapan / Gerai Fisik"
                value={fullAddress}
                onChange={(e) => {
                  setFullAddress(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Contoh: Jl. Raya Ladang Laweh, Jorong Ladang Laweh Barat..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Seksi Status Dokumen Legalitas & Rekening Perbankan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Status Dokumen Legalitas & Rekening Bank
            </CardTitle>
            <CardDescription>
              Status administrasi perizinan resmi koperasi desa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/60 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
                  SK Kemenkumham / Kemenkop
                </span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Terbit</div>
                <Badge variant="warning">Status: Belum Diunggah</Badge>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/60 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
                  NPWP Koperasi
                </span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {profile.npwpKoperasi || "Belum Diterbitkan"}
                </div>
                <Badge variant="neutral">Menunggu Pengesahan</Badge>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/60 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
                  Rekening Bank Operasional
                </span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {profile.rekeningBank || "Belum Dibuka (Rencana: Bank Nagari)"}
                </div>
                <Badge variant="neutral">Saldo belum diverifikasi</Badge>
              </div>
            </div>

            {isDirty && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Batalkan Perubahan
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Simpan Profil Pengaturan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
