"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
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
import { DataTable } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { BusinessUnit, UnitStatus } from "@/types";

export default function UnitUsahaPage() {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
  const [targetStatus, setTargetStatus] = useState<UnitStatus>("persiapan");
  const [transitionNotes, setTransitionNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadUnits() {
      const data = await preparationRepository.getBusinessUnits();
      setUnits(data);
    }
    loadUnits();
  }, []);

  const handleOpenStatusModal = (unit: BusinessUnit) => {
    setSelectedUnit(unit);
    setTargetStatus(unit.status);
    setTransitionNotes("");
    setErrorMsg(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUnit) return;
    setErrorMsg(null);

    const result = await preparationRepository.updateUnitStatus(
      selectedUnit.id,
      targetStatus,
      "Abdul Halim (Manajer Persiapan)",
      transitionNotes || "Simulasi perubahan status tata kelola persiapan."
    );

    if (!result.success) {
      setErrorMsg(result.error || "Gagal mengubah status unit.");
      return;
    }

    if (result.unit) {
      setUnits((prev) => prev.map((u) => (u.id === result.unit!.id ? result.unit! : u)));
      showToast(
        "success",
        "Status Unit Diperbarui",
        `Unit "${result.unit.name}" kini berstatus ${targetStatus.toUpperCase()}.`
      );
      setSelectedUnit(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nama Unit Usaha",
      render: (row: BusinessUnit) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.type}</p>
        </div>
      ),
    },
    {
      key: "picName",
      header: "Penanggung Jawab",
    },
    {
      key: "readinessPercentage",
      header: "Kesiapan",
      isNumeric: true,
      render: (row: BusinessUnit) => (
        <span className="font-semibold text-amber-700 dark:text-amber-400">{row.readinessPercentage}%</span>
      ),
    },
    {
      key: "operationalStartDate",
      header: "Mulai Operasional",
      render: (row: BusinessUnit) => (
        <span className="text-slate-400 dark:text-slate-500 italic">
          {row.operationalStartDate ? row.operationalStartDate : "Belum Ditetapkan (Target 2027)"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status Siklus",
      render: (row: BusinessUnit) => (
        <Badge
          variant={
            row.status === "aktif"
              ? "success"
              : row.status === "siap_buka"
              ? "info"
              : "warning"
          }
        >
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Aksi Tata Kelola",
      render: (row: BusinessUnit) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenStatusModal(row)}
          className="text-xs h-8"
        >
          Kelola Status & Prasyarat
        </Button>
      ),
    },
  ];

  const avgReadiness =
    units.length > 0
      ? Math.round(units.reduce((s, u) => s + u.readinessPercentage, 0) / units.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Daftar Unit", active: true },
        ]}
        title="Pengelolaan Siklus Unit Usaha Koperasi"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description={
          <>
            Siklus unit usaha mengikuti alur: <strong>Rencana → Persiapan → Siap Dibuka → Aktif</strong> dengan evaluasi prasyarat riil.
          </>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Unit Usaha (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Gerai Sembako Nagari"
          value="Fase Persiapan"
          subtitle="Unit perdana pengadaan sembako warga"
          icon={<Store className="h-4 w-4 text-rose-600" />}
          trend={{ label: "Target Awal 2027", positive: true }}
          accentColor="crimson"
         action={{ label: "Tinjau rencana persiapan", href: "/persiapan" }}/>
        <CardMetric
          title="Kesiapan Operasional"
          value={`${avgReadiness}% Terpenuhi`}
          subtitle="SOP, etalase, & MoU mitra grosir"
          icon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
          trend={{ label: "Evaluasi Prasyarat", positive: true }}
          accentColor="amber"
          progress={avgReadiness}
         action={{ label: "Buka checklist", href: "/persiapan" }}/>
        <CardMetric
          title="Simpan Pinjam (USP)"
          value="Nonaktif (Terkunci)"
          subtitle="Menunggu izin dan kesiapan pengelolaan."
          icon={<AlertCircle className="h-4 w-4 text-slate-500" />}
          trend={{ label: "Proteksi Risiko", positive: false }}
          accentColor="neutral"
         action={{ label: "Baca panduan", href: "/bantuan" }}/>
      </div>

      {/* Tabel Unit Usaha */}
      <DataTable columns={columns} data={units} keyExtractor={(row) => row.id} />

      {/* Grid Informasi Prasyarat & Riwayat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panel Alur Siklus Hidup Unit Usaha */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-5 w-5 text-primary-container" />
              Alur Siklus Hidup Unit Usaha
            </CardTitle>
            <CardDescription>
              Tahapan pembukaan unit usaha baru sesuai standar tata kelola koperasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">1. Rencana</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Kajian Awal & Usulan Pengurus</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Survei kelayakan awal kebutuhan komoditas warga.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">2. Persiapan</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Penyusunan Anggaran & Sewa Lokasi</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Pengadaan perlengkapan dan perjanjian pasokan barang.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">3. Siap Dibuka</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Simulasi Sistem & Verifikasi Stok Awal</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Minimal 80% checklist wajib telah diselesaikan.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">4. Aktif</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Pelayanan Transaksi Kasir Publik</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Keputusan rapat pleno pengurus dan tanggal operasional resmi tercatat.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel Riwayat Perubahan Status Terakhir */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5 text-sky-600" />
              Riwayat Perubahan Status Unit
            </CardTitle>
            <CardDescription>
              Catatan transparansi keputusan pengurus terkait status unit usaha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {units[0]?.statusHistory?.map((hist, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">
                    {hist.fromStatus.toUpperCase()} → {hist.toStatus.toUpperCase()}
                  </Badge>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{hist.timestamp.split("T")[0]}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">Oleh: {hist.actor}</p>
                <p className="text-slate-500 dark:text-slate-400">{hist.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Peringatan Kebijakan Transaksi */}
      <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary-container shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-rose-950 dark:text-rose-200 leading-relaxed">
              <strong className="font-bold">Ketentuan Batasan Transaksi:</strong>
              <p className="mt-1">
                Unit yang belum berstatus <strong>Aktif</strong> dilarang keras melayani transaksi
                penjualan kasir atau mencatat mutasi saldo produksi di luar mode simulasi latihan.
                Unit Simpan Pinjam (USP) <strong>nonaktif secara default</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Kelola Status & Simulasi Prasyarat */}
      <Dialog
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        title={`Evaluasi Status: ${selectedUnit?.name}`}
        description="Simulasikan perubahan status siklus unit usaha dengan pemeriksaan prasyarat."
        maxWidth="md"
      >
        {selectedUnit && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1 text-slate-800 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
              <div>
                Status Saat Ini: <strong>{selectedUnit.status.toUpperCase()}</strong>
              </div>
              <div>
                Kesiapan Checklist Saat Ini: <strong>{selectedUnit.readinessPercentage}%</strong>
              </div>
            </div>

            <Select
              label="Pilih Target Status Baru (Simulasi)"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as UnitStatus)}
              options={[
                { value: "rencana", label: "Rencana (Kajian Awal)" },
                { value: "persiapan", label: "Persiapan (Pengadaan & Lokasi)" },
                { value: "siap_buka", label: "Siap Dibuka (Syarat Checklist >= 80%)" },
                { value: "aktif", label: "Aktif (Operasional Penuh)" },
                { value: "nonaktif", label: "Nonaktif (Ditutup Sementara)" },
              ]}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Alasan / Catatan Berita Acara
              </label>
              <textarea
                rows={2}
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                placeholder="Contoh: Berdasarkan hasil musyawarah pengurus tanggal..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-container dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  Prasyarat Belum Terpenuhi:
                </p>
                <p>{errorMsg}</p>
                <div className="pt-2">
                  <Link
                    href="/persiapan"
                    onClick={() => setSelectedUnit(null)}
                    className="text-primary-container font-semibold hover:underline flex items-center gap-1"
                  >
                    Buka Workspace Checklist <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedUnit(null)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleUpdateStatus}>
                Simpan Perubahan Status
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
