"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Package,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Archive,
  Eye,
  Layers,
  MapPin,
  User,
  FileSpreadsheet,
  Info,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMetric,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { formatRupiah } from "@/lib/utils";
import { FixedAsset } from "@/types";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

// Schema Form Tambah Aset Tetap
const assetSchema = z.object({
  code: z.string().min(3, "Kode aset minimal 3 karakter"),
  name: z.string().min(4, "Nama perlengkapan minimal 4 karakter"),
  location: z.string().min(3, "Lokasi fisik gerai wajib diisi"),
  condition: z.enum(["baik", "perlu_perbaikan", "rusak"]),
  picName: z.string().min(3, "Nama penanggung jawab minimal 3 karakter"),
  acquisitionCost: z.coerce.number().min(0, "Biaya perolehan tidak boleh negatif"),
  purchaseDocName: z.string().optional(),
  notes: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function AsetPage() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<FixedAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      code: "AST-2026-",
      location: "Area Display Gerai Sembako",
      condition: "baik",
      picName: "Abdul Halim",
      acquisitionCost: 1500000,
    },
  });

  const loadAssets = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const list = await preparationRepository.getFixedAssets();
      setAssets(list);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const onSubmitAsset = async (data: AssetFormData) => {
    setIsSubmitting(true);
    try {
      await preparationRepository.addFixedAsset({
        code: data.code,
        name: data.name,
        location: data.location,
        condition: data.condition,
        picName: data.picName,
        acquisitionCost: data.acquisitionCost,
        purchaseDocName: data.purchaseDocName || "Faktur-Pembelian-Persiapan.pdf",
        notes: data.notes || "Inventaris fisik operasional toko.",
      });

      showToast(
        "success",
        "Aset Tetap Tercatat",
        `Inventaris "${data.name}" (${data.code}) berhasil didaftarkan ke register aktiva tetap.`
      );
      setIsModalOpen(false);
      reset();
      await loadAssets();
    } catch {
      showToast("error", "Gagal", "Terjadi kesalahan saat menyimpan aset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    const ok = await preparationRepository.archiveFixedAsset(id);
    if (ok) {
      showToast("info", "Aset Diarsipkan", `Inventaris "${name}" telah diarsipkan dari daftar aktif.`);
      await loadAssets();
    }
  };

  // Filter Aset
  const filteredAssets = assets.filter((a) => {
    if (selectedCondition === "all") return true;
    if (selectedCondition === "needs_attention") return a.condition === "perlu_perbaikan" || a.condition === "rusak";
    return a.condition === selectedCondition;
  });

  // Metrik Ringkas
  const totalCost = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
  const goodConditionCount = assets.filter((a) => a.condition === "baik").length;
  const repairNeededCount = assets.filter((a) => a.condition === "perlu_perbaikan" || a.condition === "rusak").length;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Aset Tetap & Peralatan Toko", active: true },
        ]}
        title="Aset Tetap & Peralatan Gerai"
        statusBadge="Inventaris Fisik"
        badgeVariant="crimson"
        description="Pencatatan rak gondola, timbangan digital, laptop kasir, dan peralatan toko non-barang dagangan."
        actions={
          <Button
            variant="primary"
            size="default"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Aset Fisik
          </Button>
        }
      />

      {/* Banner Penegasan Pemisahan Aset vs Stok Sembako */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Pemisahan Tegas Aset Tetap &amp; Persediaan Barang Dagang</p>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300">
            Barang yang tercatat di halaman ini adalah <strong>aktiva tetap fisik inventaris gerai</strong> (rak,
            meja, timbangan, komputer kasir). Pendaftaran aset di modul ini{" "}
            <strong>TIDAK menambah atau mengurangi kuantitas stok barang dagangan sembako</strong> di modul
            Stok Persediaan. Penyusutan akan diatur kelak sesuai kebijakan akuntansi 2027.
          </p>
        </div>
      </div>

      {/* Baris Kartu Metrik Ringkasan (Gaya /persiapan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetric
          title="Total Unit Aset Terdaftar"
          value={`${assets.length} Unit`}
          subtext="Inventaris operasional gerai sembako"
          icon={<Package className="h-4 w-4" />}
          trend={{ label: "Arsip Fisik", positive: true }}
          accentColor="sky"
         action={{ label: "Lihat semua aset", onClick: () => { setSelectedCondition("all"); } }}/>
        <CardMetric
          title="Estimasi Nilai Perolehan"
          value={formatRupiah(totalCost)}
          subtext="Total biaya modal aktiva tetap"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ label: "Modal Peralatan", positive: true }}
          accentColor="crimson"
         action={{ label: "Buka catatan keuangan", href: "/keuangan" }}/>
        <CardMetric
          title="Kondisi Baik (Siap Pakai)"
          value={`${goodConditionCount} Unit`}
          subtext="Berfungsi prima tanpa kendala"
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{ label: "Siap Pakai", positive: true }}
          accentColor="emerald"
         action={{ label: "Lihat kondisi baik", onClick: () => { setSelectedCondition("baik"); } }}/>
        <CardMetric
          title="Perlu Perbaikan / Kalibrasi"
          value={`${repairNeededCount} Unit`}
          subtext="Membutuhkan servis teknis / tera ulang"
          icon={<Wrench className="h-4 w-4" />}
          trend={{
            label: repairNeededCount > 0 ? "Perlu Servis" : "Tidak ada laporan servis",
            positive: repairNeededCount === 0,
          }}
          accentColor="amber"
         action={{ label: "Lihat yang perlu ditangani", onClick: () => { setSelectedCondition("needs_attention"); } }}/>
      </div>

      {/* Bar Filter Kondisi */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Filter Kondisi:
          </span>
          {[
            { id: "all", label: "Semua Kondisi" },
            { id: "needs_attention", label: "Perlu ditangani" },
            { id: "baik", label: "Kondisi Baik" },
            { id: "perlu_perbaikan", label: "Perlu Perbaikan" },
            { id: "rusak", label: "Rusak" },
          ].map((cond) => (
            <button
              key={cond.id}
              onClick={() => setSelectedCondition(cond.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCondition === cond.id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Menampilkan <strong>{filteredAssets.length}</strong> aset
        </span>
      </div>

      {/* Tabel Register Aset Tetap */}
      {loadError ? (
        <ErrorState
          message="Daftar inventaris aset belum dapat dimuat. Coba lagi untuk mengambil data sesi."
          onRetry={loadAssets}
        />
      ) : isLoading ? (
        <LoadingState label="Memuat register inventaris aset..." />
      ) : filteredAssets.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7 text-slate-400" />}
          title="Tidak Ada Aset"
          description="Belum ada data inventaris aset yang sesuai dengan filter kondisi saat ini."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Kode Aset</th>
                <th className="py-3 px-4">Nama Barang & Spesifikasi</th>
                <th className="py-3 px-4">Lokasi Gerai</th>
                <th className="py-3 px-4">Kondisi Fisik</th>
                <th className="py-3 px-4">Nilai Perolehan</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {ast.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    <div>{ast.name}</div>
                    {ast.purchaseDocName && (
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        Dokumen: {ast.purchaseDocName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      {ast.location}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        ast.condition === "baik"
                          ? "success"
                          : ast.condition === "perlu_perbaikan"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {ast.condition.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {formatRupiah(ast.acquisitionCost)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      {ast.picName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAssetDetail(ast)}
                        className="h-8 px-2 text-slate-700 dark:text-slate-300"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(ast.id, ast.name)}
                        className="h-8 px-2 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                        title="Arsipkan aset"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH ASET TETAP FISIK                                            */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan Inventaris Aset Tetap Fisik"
        description="Pencatatan inventaris perlengkapan dan peralatan operasional gerai."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitAsset)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Kode Aset"
              placeholder="Contoh: AST-2026-003"
              {...register("code")}
              error={errors.code?.message}
              required
            />
            <Input
              label="Nama Perlengkapan / Peralatan"
              placeholder="Contoh: Laptop Kasir POS Lenovo ThinkPad"
              {...register("name")}
              error={errors.name?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Lokasi Fisik di Gerai"
              placeholder="Contoh: Meja Kasir Utama"
              {...register("location")}
              error={errors.location?.message}
              required
            />
            <Select
              label="Kondisi Fisik"
              {...register("condition")}
              options={[
                { value: "baik", label: "Baik (Siap Pakai)" },
                { value: "perlu_perbaikan", label: "Perlu Perbaikan / Kalibrasi" },
                { value: "rusak", label: "Rusak" },
              ]}
              error={errors.condition?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Penanggung Jawab (PIC)"
              placeholder="Contoh: Abdul Halim"
              {...register("picName")}
              error={errors.picName?.message}
              required
            />
            <Input
              label="Biaya Perolehan (Rp)"
              type="number"
              {...register("acquisitionCost")}
              error={errors.acquisitionCost?.message}
              required
            />
          </div>

          <Input
            label="Nomor / Nama Dokumen Pembelian (Faktur/Kwitansi)"
            placeholder="Contoh: Faktur No. INV/2026/09/88 UD Toko Komputer"
            {...register("purchaseDocName")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Inventaris
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Spesifikasi teknis, garansi toko, nomor seri..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mendaftarkan..." : "Daftarkan Aset"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL ASET                                                        */}
      {/* ========================================================================= */}
      {selectedAssetDetail && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedAssetDetail(null)}
          title="Detail Inventaris Aset Tetap"
          description={`Kode Register: ${selectedAssetDetail.code}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Badge
                variant={
                  selectedAssetDetail.condition === "baik"
                    ? "success"
                    : selectedAssetDetail.condition === "perlu_perbaikan"
                    ? "warning"
                    : "danger"
                }
              >
                Kondisi {selectedAssetDetail.condition.replace("_", " ")}
              </Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                {selectedAssetDetail.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">{selectedAssetDetail.notes || "Tidak ada catatan khusus."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Lokasi Fisik:</span>
                <span className="font-semibold">{selectedAssetDetail.location}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Biaya Perolehan:</span>
                <span className="font-semibold font-mono text-primary">
                  {formatRupiah(selectedAssetDetail.acquisitionCost)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Penanggung Jawab:</span>
                <span className="font-semibold">{selectedAssetDetail.picName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Dokumen Faktur:</span>
                <span className="font-semibold truncate block">
                  {selectedAssetDetail.purchaseDocName || "Faktur belum dilampirkan"}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedAssetDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
