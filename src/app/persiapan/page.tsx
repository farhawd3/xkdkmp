"use client";

import { CATEGORY_LABELS } from "@/lib/checklist";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  FileText,
  ExternalLink,
  Edit2,
  Trash2,
  Info,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
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
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { Dialog } from "@/components/ui/Dialog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { ChecklistItem, ChecklistCategory, ChecklistStatus } from "@/types";



function PersiapanContent() {
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");
  const filterParam = searchParams.get("filter");

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(kategoriParam || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [requiredFilter, setRequiredFilter] = useState<string>(
    filterParam === "wajib" ? "wajib" : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (kategoriParam) {
      setSelectedCategory(kategoriParam);
    }
    if (filterParam === "wajib") {
      setRequiredFilter("wajib");
    }
  }, [kategoriParam, filterParam]);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State form tambah
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ChecklistCategory>("legalitas");
  const [newDesc, setNewDesc] = useState("");
  const [newRequired, setNewRequired] = useState(true);
  const [newPic, setNewPic] = useState("Abdul Halim");
  const [newTargetDate, setNewTargetDate] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await preparationRepository.getChecklistItems();
        setItems(data);
      } catch (err) {
        console.error("Gagal memuat checklist:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (item: ChecklistItem, newStatus: ChecklistStatus) => {
    const updated = await preparationRepository.updateChecklistItem(item.id, {
      status: newStatus,
    });
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(
        "success",
        "Status Diperbarui",
        `"${item.title}" ditandai: ${newStatus.replace("_", " ").toUpperCase()}`
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const updated = await preparationRepository.updateChecklistItem(editingItem.id, {
      title: editingItem.title,
      description: editingItem.description,
      picName: editingItem.picName,
      targetDate: editingItem.targetDate,
      reasonOrNotes: editingItem.reasonOrNotes,
      status: editingItem.status,
    });

    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      showToast("success", "Perubahan Disimpan", "Detail poin checklist telah diperbarui.");
      setEditingItem(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await preparationRepository.addChecklistItem({
      category: newCategory,
      title: newTitle,
      description: newDesc,
      isRequired: newRequired,
      picName: newPic,
      targetDate: newTargetDate || "2026-12-31",
      status: "belum_selesai",
      reasonOrNotes: "Ditambahkan manual oleh manajer persiapan.",
    });

    setItems((prev) => [...prev, created]);
    showToast("success", "Poin Baru Ditambahkan", `"${newTitle}" telah ditambahkan ke checklist.`);
    setNewTitle("");
    setNewDesc("");
    setIsAddModalOpen(false);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (requiredFilter === "wajib" && !item.isRequired) return false;
    if (requiredFilter === "opsional" && item.isRequired) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.picName && item.picName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Perhitungan progres aman pembagian nol
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === "selesai").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Perhitungan progres 4 Pilar Kesiapan
  const pilarLegalitas = items.filter((i) => i.category === "legalitas" || i.category === "keputusan_pembukaan");
  const pilarFisik = items.filter((i) => i.category === "tempat_fisik" || i.category === "pendataan_anggota");
  const pilarBisnis = items.filter((i) => i.category === "pemasok_produk" || i.category === "anggaran");
  const pilarOperasional = items.filter((i) => i.category === "sop" || i.category === "sdm_petugas" || i.category === "keuangan_bank" || i.category === "uji_sistem");

  const calcPilarPercent = (list: ChecklistItem[]) => {
    if (list.length === 0) return 0;
    const done = list.filter((i) => i.status === "selesai").length;
    return Math.round((done / list.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Standar */}
      <PageHeader
        breadcrumbItems={[
          { label: "Ringkasan", href: "/dashboard" },
          { label: "Workspace Checklist Kesiapan", active: true },
        ]}
        title="Workspace Kesiapan Pembukaan"
        badgeText="Target: Awal 2027"
        badgeVariant="crimson"
        description="Pantau pemenuhan persyaratan legalitas, infrastruktur gerai, permodalan simpanan, dan prosedur kasir sebelum tanggal pembukaan resmi ditetapkan."
        actions={
          <>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-right shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Total Kesiapan
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Poin Kustom
            </Button>
          </>
        }
      >
        {/* Edukasi & Disclaimer Hukum yang Rapi */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Perhatian Tata Kelola Koperasi</p>
            <p className="text-amber-800 dark:text-amber-300">
              Seluruh poin dalam checklist ini berfungsi sebagai panduan kerja mandiri operasional pengurus. Checklist ini{" "}
              <strong>bukan pengakuan hukum</strong> bahwa perizinan resmi telah terbit tanpa adanya akta otentik notaris, SK Kemenkumham, dan rekening giro resmi bank.
            </p>
          </div>
        </div>
      </PageHeader>

      {/* 4 Kartu Pilar Kesiapan (Clean, Informatif, & Terarah) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Pilar 1: Legalitas & Hukum */}
        <Card
          className={`cursor-pointer transition-all hover:border-rose-300 dark:hover:border-rose-800 ${
            selectedCategory === "legalitas" ? "ring-2 ring-primary-container border-transparent" : ""
          }`}
          onClick={() => setSelectedCategory(selectedCategory === "legalitas" ? "all" : "legalitas")}
        >
          <CardContent className="p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilar 1: Legalitas
              </span>
              <Badge variant={calcPilarPercent(pilarLegalitas) >= 70 ? "success" : "warning"} size="sm">
                {calcPilarPercent(pilarLegalitas)}%
              </Badge>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hukum & Perizinan
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: `${calcPilarPercent(pilarLegalitas)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              Akta Notaris, NPWP, NIB & SK Kemenkumham
            </p>
          </CardContent>
        </Card>

        {/* Pilar 2: Sarana Fisik & Gerai */}
        <Card
          className={`cursor-pointer transition-all hover:border-sky-300 dark:hover:border-sky-800 ${
            selectedCategory === "tempat_fisik" ? "ring-2 ring-sky-600 border-transparent" : ""
          }`}
          onClick={() => setSelectedCategory(selectedCategory === "tempat_fisik" ? "all" : "tempat_fisik")}
        >
          <CardContent className="p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilar 2: Fisik Gerai
              </span>
              <Badge variant={calcPilarPercent(pilarFisik) >= 70 ? "success" : "info"} size="sm">
                {calcPilarPercent(pilarFisik)}%
              </Badge>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tempat & Peralatan
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 rounded-full"
                style={{ width: `${calcPilarPercent(pilarFisik)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              Lokasi toko sembako, rak display, timbangan digital
            </p>
          </CardContent>
        </Card>

        {/* Pilar 3: Komoditas & Mitra */}
        <Card
          className={`cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-800 ${
            selectedCategory === "pemasok_produk" ? "ring-2 ring-emerald-600 border-transparent" : ""
          }`}
          onClick={() => setSelectedCategory(selectedCategory === "pemasok_produk" ? "all" : "pemasok_produk")}
        >
          <CardContent className="p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilar 3: Komoditas
              </span>
              <Badge variant={calcPilarPercent(pilarBisnis) >= 70 ? "success" : "neutral"} size="sm">
                {calcPilarPercent(pilarBisnis)}%
              </Badge>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pemasok & Produk
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${calcPilarPercent(pilarBisnis)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              Katalog Beras, Minyak, Gula & kesepakatan grosir
            </p>
          </CardContent>
        </Card>

        {/* Pilar 4: Operasional & Kasir */}
        <Card
          className={`cursor-pointer transition-all hover:border-amber-300 dark:hover:border-amber-800 ${
            selectedCategory === "sop" ? "ring-2 ring-amber-600 border-transparent" : ""
          }`}
          onClick={() => setSelectedCategory(selectedCategory === "sop" ? "all" : "sop")}
        >
          <CardContent className="p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilar 4: Operasional
              </span>
              <Badge variant={calcPilarPercent(pilarOperasional) >= 70 ? "success" : "warning"} size="sm">
                {calcPilarPercent(pilarOperasional)}%
              </Badge>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              SOP & Kasir POS
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full"
                style={{ width: `${calcPilarPercent(pilarOperasional)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              SOP kasir, akun petugas, rekening Bank Nagari
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar Filter & Pencarian */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari poin checklist, kata kunci, atau nama PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 pl-10 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Filter Sifat (Wajib vs Opsional) */}
            <div className="flex items-center gap-2">
              <select
                value={requiredFilter}
                onChange={(e) => setRequiredFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="all">Semua Sifat (Wajib & Opsional)</option>
                <option value="wajib">Hanya Wajib</option>
                <option value="opsional">Hanya Opsional</option>
              </select>

              {/* Filter Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="all">Semua Status</option>
                <option value="belum_selesai">Belum Selesai</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Bar Kategori Horisontal (10 Kategori) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Kategori ({items.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as ChecklistCategory[]).map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daftar Item Checklist */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-500 dark:text-slate-400">
              <CheckSquare className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tidak ada poin checklist yang sesuai.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Ubah filter atau gunakan kata kunci pencarian lainnya.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Kolom Informasi Utama */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <Badge variant={item.isRequired ? "danger" : "neutral"} size="default">
                        {item.isRequired ? "Wajib" : "Opsional"}
                      </Badge>
                      <Badge
                        variant={
                          item.status === "selesai"
                            ? "success"
                            : item.status === "dalam_proses"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {item.status === "selesai"
                          ? "Selesai"
                          : item.status === "dalam_proses"
                          ? "Dalam Proses"
                          : "Belum Selesai"}
                      </Badge>
                    </div>

                    <h3 className={`text-base font-bold text-slate-900 dark:text-slate-100 ${item.status === "selesai" ? "line-through text-slate-500 dark:text-slate-500" : ""}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata Catatan & Bukti */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      {item.picName && (
                        <span>PIC: <strong className="text-slate-700 dark:text-slate-300">{item.picName}</strong></span>
                      )}
                      {item.targetDate && (
                        <span>Target: <strong className="text-slate-700 dark:text-slate-300">{item.targetDate}</strong></span>
                      )}
                      {item.completedAt && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          Diselesaikan: {item.completedAt}
                        </span>
                      )}
                      {item.proofFileName && (
                        <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 font-medium">
                          <FileText className="h-3.5 w-3.5" />
                          Bukti: {item.proofFileName}
                        </span>
                      )}
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-container dark:text-rose-400 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Rujukan Resmi
                        </a>
                      )}
                      {item.relatedTaskId && (
                        <Link
                          href="/pekerjaan"
                          className="flex items-center gap-1 text-primary-container dark:text-rose-400 font-semibold hover:underline"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Lihat Tugas Terkait
                        </Link>
                      )}
                    </div>

                    {item.reasonOrNotes && (
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-2.5 text-xs text-slate-600 dark:text-slate-300 mt-2">
                        <strong className="text-slate-800 dark:text-slate-200">Catatan/Alasan:</strong> {item.reasonOrNotes}
                      </div>
                    )}
                  </div>

                  {/* Kolom Aksi Cepat */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Ubah Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value as ChecklistStatus)}
                      className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-container"
                    >
                      <option value="belum_selesai">Belum Selesai</option>
                      <option value="dalam_proses">Dalam Proses</option>
                      <option value="selesai">Tandai Selesai</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem({ ...item })}
                      className="gap-1.5 text-xs h-9"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      Sunting Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Sunting Detail Checklist */}
      <Dialog
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Sunting Detail Poin Checklist"
        description="Perbarui informasi penanggung jawab, catatan pelaksanaan, atau status."
        maxWidth="lg"
      >
        {editingItem && (
          <div className="space-y-4">
            <Input
              label="Judul Poin"
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              required
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Deskripsi / Sasaran</label>
              <textarea
                rows={3}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Penanggung Jawab (PIC)"
                value={editingItem.picName ?? ""}
                onChange={(e) => setEditingItem({ ...editingItem, picName: e.target.value })}
              />

              <DateInput
                label="Target Selesai"
                value={editingItem.targetDate ?? ""}
                onChange={(e) => setEditingItem({ ...editingItem, targetDate: e.target.value })}
              />
            </div>

            <Select
              label="Status Pelaksanaan"
              value={editingItem.status}
              onChange={(e) =>
                setEditingItem({ ...editingItem, status: e.target.value as ChecklistStatus })
              }
              options={[
                { value: "belum_selesai", label: "Belum Selesai" },
                { value: "dalam_proses", label: "Dalam Proses" },
                { value: "selesai", label: "Selesai" },
              ]}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Alasan / Catatan Kemajuan Lapangan
              </label>
              <textarea
                rows={2}
                value={editingItem.reasonOrNotes ?? ""}
                onChange={(e) => setEditingItem({ ...editingItem, reasonOrNotes: e.target.value })}
                placeholder="Tuliskan kendala atau ringkasan dokumen yang telah diverifikasi..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog Tambah Poin Kustom */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Poin Checklist Persiapan Baru"
        description="Tambahkan kebutuhan fisik atau administrasi tambahan sesuai kondisi Nagari Ladang Laweh."
        maxWidth="lg"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input
            label="Nama Poin Kebutuhan"
            placeholder="Contoh: Pengadaan Genset Cadangan Listrik Toko"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
              options={Object.entries(CATEGORY_LABELS).map(([val, label]) => ({
                value: val,
                label,
              }))}
            />

            <Select
              label="Sifat Poin"
              value={newRequired ? "true" : "false"}
              onChange={(e) => setNewRequired(e.target.value === "true")}
              options={[
                { value: "true", label: "Wajib (Prasyarat Pembukaan)" },
                { value: "false", label: "Opsional (Dapat Menyusul)" },
              ]}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Deskripsi Sasaran</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Jelaskan spesifikasi dan tujuan dari poin ini..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Penanggung Jawab (PIC)"
              value={newPic}
              onChange={(e) => setNewPic(e.target.value)}
              required
            />

            <DateInput
              label="Target Tanggal"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Poin Checklist
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default function PersiapanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat checklist persiapan...</div>}>
      <PersiapanContent />
    </Suspense>
  );
}
