"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Store,
  ArrowLeft,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  Target,
  FileText,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { BusinessUnit } from "@/types/models";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export default function DetailUnitUsahaPage() {
  const params = useParams();
  const unitId = typeof params?.id === "string" ? params.id : "";

  const [unit, setUnit] = useState<BusinessUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUnit = async () => {
    if (!unitId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/units?id=${unitId}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          setUnit(null);
          return;
        }
        throw new Error("Gagal mengambil data unit usaha.");
      }
      const data = await res.json();
      setUnit(data.unit || null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kendala saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnit();
  }, [unitId]);

  if (isLoading) {
    return <LoadingState label="Memuat rincian unit usaha dari Supabase..." />;
  }

  if (errorMsg) {
    return <ErrorState message={errorMsg} onRetry={loadUnit} />;
  }

  if (!unit) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Unit Usaha Tidak Ditemukan</h2>
        <p className="mt-1 max-w-sm text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Unit usaha dengan ID &quot;{unitId}&quot; tidak terdaftar dalam database koperasi.
        </p>
        <div className="mt-6">
          <ButtonLink href="/unit-usaha" variant="primary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Unit
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Unit Usaha", href: "/unit-usaha" },
          { label: "Daftar Unit", href: "/unit-usaha" },
          { label: unit.name, active: true },
        ]}
      />

      {/* Header Detail Unit */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-white font-bold text-lg shadow-sm">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{unit.name}</h1>
                <Badge variant={unit.status === "aktif" ? "success" : unit.status === "persiapan" ? "warning" : "neutral"}>
                  {unit.status.toUpperCase()}
                </Badge>
                {unit.code && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                    {unit.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kategori: <strong>{unit.unit_type}</strong> • Target Mulai:{" "}
                {unit.operational_start_date ? formatTanggal(unit.operational_start_date) : "Belum ditetapkan"}
              </p>
            </div>
          </div>

          <ButtonLink href="/unit-usaha" variant="outline" size="sm" className="gap-1.5 min-h-11 px-4 text-xs font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom Informasi Operasional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Lokasi & Tanggung Jawab</CardTitle>
            <CardDescription>Profil operasional fisik gerai di Nagari Ladang Laweh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Penanggung Jawab (PIC):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{unit.pic_name || "Belum ditentukan"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Kontak / Telepon:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{unit.phone || "Tidak ada nomor"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Lokasi Fisik:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {unit.location || "Nagari Ladang Laweh"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Progres Kesiapan Operasional:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 text-base">{unit.readiness_percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Target Finansial & Catatan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              Target & Catatan Manajerial
            </CardTitle>
            <CardDescription>Sasaran operasional dan evaluasi berkala unit usaha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Target Omset Bulanan:</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatRupiah(Number(unit.monthly_target) || 0)}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Catatan Manajer:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                {unit.notes ? `"${unit.notes}"` : "Belum ada catatan operasional khusus untuk gerai ini."}
              </p>
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-500 pt-2">
              Terdaftar dalam sistem: {formatTanggal(unit.created_at)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
