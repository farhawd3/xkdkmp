"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Store,
  ArrowLeft,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  MapPin,
  User,
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
import { preparationRepository } from "@/lib/repository";
import { BusinessUnit } from "@/types";

export default function DetailUnitUsahaPage() {
  const params = useParams();
  const unitId = typeof params?.id === "string" ? params.id : "";

  const [unit, setUnit] = useState<BusinessUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUnit() {
      if (!unitId) return;
      try {
        const units = await preparationRepository.getBusinessUnits();
        const found = units.find((u) => u.id === unitId) || null;
        setUnit(found);
      } catch (err) {
        console.error("Gagal memuat data unit:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUnit();
  }, [unitId]);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Memuat rincian unit usaha...</div>;
  }

  if (!unit) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Unit Usaha Tidak Ditemukan</h2>
        <p className="mt-1 max-w-sm text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Unit usaha dengan ID &quot;{unitId}&quot; tidak terdaftar dalam sistem.
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
                <Badge variant={unit.status === "aktif" ? "success" : "warning"}>
                  STATUS: {unit.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kategori: <strong>{unit.type}</strong> • Target Tanggal Operasional:{" "}
                {unit.operationalStartDate ?? "null (Belum Ditetapkan)"}
              </p>
            </div>
          </div>

          <ButtonLink href="/unit-usaha" variant="outline" size="sm" className="gap-1 text-xs">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom Informasi Teknis Unit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Lokasi & Tanggung Jawab</CardTitle>
            <CardDescription>Profil operasional fisik gerai di Nagari Ladang Laweh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Penanggung Jawab (PIC):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{unit.picName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Rencana Lokasi Fisik:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Jalan Poros Utama Nagari Ladang Laweh (Dekat Kantor Wali Nagari)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Progres Kesiapan Saat Ini:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">{unit.readinessPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Riwayat Keputusan Pengurus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Riwayat Tata Kelola & Evaluasi Status
            </CardTitle>
            <CardDescription>Rekam jejak persetujuan pembukaan unit usaha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {unit.statusHistory.map((hist, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">
                    {hist.fromStatus.toUpperCase()} → {hist.toStatus.toUpperCase()}
                  </Badge>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{hist.timestamp.split("T")[0]}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">Otorisasi: {hist.actor}</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{hist.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
