"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  ShieldCheck,
  AlertCircle,
  Plus,
  Edit2,
  Phone,
  MapPin,
  Target,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatRupiah } from "@/lib/utils";
import { BusinessUnitStatus } from "@/lib/validations/simple-schemas";

interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  unit_type: string;
  status: BusinessUnitStatus;
  pic_name: string;
  phone: string | null;
  location: string | null;
  monthly_target: string | number;
  readiness_percentage: number;
  operational_start_date: string | null;
  notes: string | null;
  created_at: string;
}

export default function UnitUsahaPage() {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<BusinessUnit | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formUnitType, setFormUnitType] = useState("Sembako & Kebutuhan Pokok");
  const [formPicName, setFormPicName] = useState("Abdul Halim");
  const [formPhone, setFormPhone] = useState("");
  const [formLocation, setFormLocation] = useState("Ladang Laweh");
  const [formMonthlyTarget, setFormMonthlyTarget] = useState("25000000");
  const [formStatus, setFormStatus] = useState<BusinessUnitStatus>("persiapan");
  const [formReadiness, setFormReadiness] = useState("45");
  const [formStartDate, setFormStartDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { showToast } = useToast();

  const loadUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/units", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil data gerai dari Supabase.");
      const data = await res.json();
      setUnits(data.units || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const openCreateModal = () => {
    setEditingUnit(null);
    setFormCode(`GERAI-${String(units.length + 1).padStart(2, "0")}`);
    setFormName("");
    setFormUnitType("Sembako & Kebutuhan Pokok");
    setFormPicName("Abdul Halim");
    setFormPhone("");
    setFormLocation("Ladang Laweh");
    setFormMonthlyTarget("20000000");
    setFormStatus("rencana");
    setFormReadiness("0");
    setFormStartDate("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (unit: BusinessUnit) => {
    setEditingUnit(unit);
    setFormCode(unit.code);
    setFormName(unit.name);
    setFormUnitType(unit.unit_type);
    setFormPicName(unit.pic_name);
    setFormPhone(unit.phone || "");
    setFormLocation(unit.location || "Ladang Laweh");
    setFormMonthlyTarget(String(unit.monthly_target || "0"));
    setFormStatus(unit.status);
    setFormReadiness(String(unit.readiness_percentage || 0));
    setFormStartDate(unit.operational_start_date || "");
    setFormNotes(unit.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("error", "Nama Gerai Wajib", "Masukkan nama unit usaha / gerai.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingUnit?.id,
        code: formCode.trim(),
        name: formName.trim(),
        unit_type: formUnitType.trim(),
        pic_name: formPicName.trim(),
        phone: formPhone.trim() || null,
        location: formLocation.trim() || null,
        monthly_target: parseFloat(formMonthlyTarget) || 0,
        status: formStatus,
        readiness_percentage: parseInt(formReadiness, 10) || 0,
        operational_start_date: formStartDate || null,
        notes: formNotes.trim() || null,
      };

      const url = "/api/units";
      const method = editingUnit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan data gerai.");

      showToast(
        "success",
        editingUnit ? "Gerai Diperbarui" : "Gerai Ditambahkan",
        `Data "${formName}" berhasil disimpan ke Supabase.`
      );
      setIsModalOpen(false);
      loadUnits();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Membaca daftar gerai dari Supabase…" />;
  if (error) return <ErrorState message={error} onRetry={loadUnits} />;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Gerai" },
          { label: "Daftar & Edit Gerai", active: true },
        ]}
        title="Daftar & Penyesuaian Gerai Koperasi"
        badgeText="Pengelolaan Gerai"
        badgeVariant="crimson"
        description="Kelola seluruh unit usaha dan gerai koperasi, sesuaikan target omset bulanan, penanggung jawab, dan status kesiapan operasional."
      />

      {/* Baris Tombol Tambah Gerai */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Daftar Unit Usaha ({units.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik tombol &ldquo;Edit &amp; Sesuaikan&rdquo; pada gerai untuk memperbarui informasi.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          className="min-h-11 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Gerai Baru</span>
        </Button>
      </div>

      {/* Grid Kartu Gerai Ber-Gradient Pastel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {units.map((unit) => {
          const targetNum = typeof unit.monthly_target === "number" ? unit.monthly_target : parseFloat(unit.monthly_target) || 0;
          const isActived = unit.status === "aktif";

          return (
            <div
              key={unit.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-sm flex flex-col justify-between ${
                isActived
                  ? "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 dark:border-emerald-950/60 dark:from-[#252F40] dark:to-[#1B3329]"
                  : unit.status === "persiapan"
                  ? "border-rose-200 bg-gradient-to-br from-white to-rose-50/50 dark:border-rose-950/60 dark:from-[#252F40] dark:to-[#38232F]"
                  : "border-slate-200 bg-gradient-to-br from-white to-slate-50/60 dark:border-slate-700 dark:from-[#252F40] dark:to-[#1E293B]"
              }`}
            >
              <div className="space-y-4">
                {/* Header Gerai */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-white shadow-md shadow-rose-900/20 shrink-0">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {unit.name}
                      </h4>
                      <p className="text-xs font-semibold text-primary-container dark:text-rose-400">
                        Kode: {unit.code} • {unit.unit_type}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      unit.status === "aktif"
                        ? "success"
                        : unit.status === "siap_buka"
                        ? "info"
                        : unit.status === "persiapan"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {unit.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Rincian Informasi Gerai */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Penanggung Jawab
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {unit.pic_name}
                    </p>
                    {unit.phone && (
                      <p className="text-slate-500 text-[11px] flex items-center gap-1 truncate">
                        <Phone className="h-3 w-3" /> {unit.phone}
                      </p>
                    )}
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" /> Target Omset Bulanan
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {formatRupiah(targetNum)}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Kesiapan: <strong>{unit.readiness_percentage}%</strong>
                    </p>
                  </div>
                </div>

                {/* Lokasi & Catatan */}
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                  {unit.location && (
                    <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{unit.location}</span>
                    </p>
                  )}
                  {unit.notes && (
                    <p className="italic bg-slate-50/80 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      &ldquo;{unit.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Operasional: {unit.operational_start_date || "Menunggu Penetapan"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(unit)}
                  className="min-h-9 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit & Sesuaikan Gerai</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog Tambah / Edit Gerai */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnit ? `Edit Data: ${editingUnit.name}` : "Daftarkan Gerai / Unit Usaha Baru"}
        description="Sesuaikan nama gerai, penanggung jawab, target omset bulanan, dan status operasional."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Contoh: GERAI-01"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Gerai / Unit Usaha <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Gerai Sembako Nagari Ladang Laweh"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Usaha
              </label>
              <input
                type="text"
                value={formUnitType}
                onChange={(e) => setFormUnitType(e.target.value)}
                placeholder="Contoh: Sembako & Kebutuhan Pokok"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formPicName}
                onChange={(e) => setFormPicName(e.target.value)}
                placeholder="Nama penanggung jawab"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Gerai
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Contoh: Simpang Tiga Ladang Laweh"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Omset Bulanan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000000"
                value={formMonthlyTarget}
                onChange={(e) => setFormMonthlyTarget(e.target.value)}
                placeholder="Contoh: 25000000"
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <Select
              label="Status Siklus Gerai"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as BusinessUnitStatus)}
              options={[
                { value: "rencana", label: "Rencana (Kajian Awal)" },
                { value: "persiapan", label: "Persiapan (Pengadaan)" },
                { value: "siap_buka", label: "Siap Dibuka" },
                { value: "aktif", label: "Aktif (Operasional Penuh)" },
                { value: "nonaktif", label: "Nonaktif (Ditutup)" },
              ]}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kesiapan Operasional (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formReadiness}
                onChange={(e) => setFormReadiness(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Khusus / Keterangan Gerai
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Catatan fasilitas, perjanjian sewa, atau komoditas unggulan..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Menyimpan ke Supabase..." : editingUnit ? "Simpan Perubahan" : "Simpan Gerai Baru"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
