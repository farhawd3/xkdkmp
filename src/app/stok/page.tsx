"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Archive,
  Pencil,
  Tag,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  Layers,
  History,
  Check,
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
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { Product, StockMutation, StockOpname } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { isProductionDatabaseConfigured } from "@/lib/repository";
import { ProductionStockPage } from "./ProductionStockPage";

const CATEGORY_NAMES: Record<string, string> = {
  beras: "Beras & Padi",
  minyak_goreng: "Minyak Goreng",
  gula_tepung: "Gula & Tepung",
  telur: "Telur Ayam",
  bumbu_dapur: "Bumbu Dapur",
  lainnya: "Pangan Pokok Lainnya",
};

function PreparationStockPage() {
  const [activeTab, setActiveTab] = useState<"katalog" | "mutasi" | "opname">("katalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [quarantineMap, setQuarantineMap] = useState<Record<string, number>>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationProductFilter, setMutationProductFilter] = useState("all");

  // State Modal Tambah Master
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("beras");
  const [baseUnit, setBaseUnit] = useState("Kg");
  const [conversionUnit, setConversionUnit] = useState("");
  const [conversionFactor, setConversionFactor] = useState<number>(1);
  const [barcode, setBarcode] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [hasExpiry, setHasExpiry] = useState(false);

  // State Modal Usulan Opname
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameProductId, setOpnameProductId] = useState("");
  const [physicalCountQty, setPhysicalCountQty] = useState<number>(0);
  const [opnameReason, setOpnameReason] = useState("");

  const { showToast } = useToast();

  const loadAllData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
    const [prods, muts, ops] = await Promise.all([
      preparationRepository.getProducts(),
      preparationRepository.getStockMutations(),
      preparationRepository.getStockOpnames(),
    ]);
    setProducts(prods);
    setMutations(muts);
    setOpnames(ops);

    const qMap: Record<string, number> = {};
    for (const p of prods) {
      qMap[p.id] = await preparationRepository.getQuarantineStock(p.id);
    }
    setQuarantineMap(qMap);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Tambah Master Produk Baru
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !name.trim() || !sku.trim()) return;
    if (products.some((product) => product.id !== editingProduct?.id && product.sku.toUpperCase() === sku.trim().toUpperCase())) {
      showToast("error", "Kode barang sudah digunakan", "Gunakan SKU yang berbeda.");
      return;
    }
    setIsSaving(true);
    try {

    const values = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      baseUnit,
      conversionUnit: conversionUnit || undefined,
      conversionFactor: conversionFactor > 1 ? conversionFactor : undefined,
      barcode: barcode || undefined,
      estimatedCost: Number(estimatedCost),
      sellingPrice: Number(sellingPrice),
      minStock: Number(minStock),
      hasExpiry,
    };
    if (editingProduct) {
      const updated = await preparationRepository.updateProduct(editingProduct.id, values);
      if (!updated) throw new Error("Barang tidak ditemukan");
    } else {
      await preparationRepository.addProduct(values);
    }

    showToast(
      "success",
      editingProduct ? "Barang diperbarui" : "Barang ditambahkan",
      `Data "${name}" dicatat pada sesi ini. Mengubah katalog tidak mengubah stok fisik.`
    );

    // Reset Form
    setSku("");
    setName("");
    setConversionUnit("");
    setConversionFactor(1);
    setBarcode("");
    setEstimatedCost(0);
    setSellingPrice(0);
    setMinStock(10);
    setHasExpiry(false);
    setIsAddModalOpen(false);
    await loadAllData();
    } catch {
      showToast("error", "Barang belum dicatat", "Coba lagi. Isian formulir masih tersedia.");
    } finally {
      setIsSaving(false);
    }
  };

  // Buat Usulan Opname Fisik
  const handleCreateOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === opnameProductId);
    if (!prod) {
      showToast("error", "Pilih Komoditas", "Komoditas sembako wajib dipilih.");
      return;
    }
    if (!opnameReason.trim()) {
      showToast("error", "Alasan Wajib", "Harap isi berita acara alasan perbedaan fisik.");
      return;
    }

    const diff = physicalCountQty - prod.currentStock;

    await preparationRepository.createStockOpname({
      date: new Date().toISOString().split("T")[0],
      performedBy: "Abdul Halim (Petugas Toko)",
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          systemQty: prod.currentStock,
          physicalQty: Number(physicalCountQty),
          diffQty: diff,
          reason: opnameReason.trim(),
        },
      ],
      notes: "Usulan penyesuaian stok opname fisik gerai.",
    });

    showToast(
      "success",
      "Usulan Opname Dicatat",
      `Berita acara opname fisik untuk "${prod.name}" berhasil dibuat. Menunggu persetujuan manajer.`
    );

    setIsOpnameModalOpen(false);
    setOpnameProductId("");
    setPhysicalCountQty(0);
    setOpnameReason("");
    await loadAllData();
  };

  // Setujui Opname
  const handleApproveOpname = async (opId: string) => {
    const res = await preparationRepository.approveStockOpname(opId, "Abdul Halim (Manajer)");
    if (res.success) {
      showToast(
        "success",
        "Opname Disetujui",
        "Kuantitas stok fisik di sistem telah disesuaikan dan kartu mutasi diposting."
      );
      await loadAllData();
    }
  };

  // Arsipkan
  const handleArchive = async () => {
    if (!archiveTarget || isSaving) return;
    setIsSaving(true);
    try {
      if (!await preparationRepository.archiveProduct(archiveTarget.id)) throw new Error("Tidak ditemukan");
      showToast("info", "Barang diarsipkan", `"${archiveTarget.name}" telah diarsipkan.`);
      setArchiveTarget(null);
      await loadAllData();
    } catch {
      showToast("error", "Arsip belum berhasil", "Coba lagi untuk mengarsipkan barang.");
    } finally {
      setIsSaving(false);
    }
  };

  const openProductForm = (product?: Product) => {
    setEditingProduct(product ?? null);
    setSku(product?.sku ?? `SKU-${Date.now().toString().slice(-6)}`);
    setName(product?.name ?? ""); setCategory(product?.category ?? "beras");
    setBaseUnit(product?.baseUnit ?? "Kg"); setConversionUnit(product?.conversionUnit ?? "");
    setConversionFactor(product?.conversionFactor ?? 1); setBarcode(product?.barcode ?? "");
    setEstimatedCost(product?.estimatedCost ?? 0); setSellingPrice(product?.sellingPrice ?? 0);
    setMinStock(product?.minStock ?? 0); setHasExpiry(product?.hasExpiry ?? false);
    setIsAddModalOpen(true);
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    if (stockFilter === "safe" && !(p.currentStock > p.minStock)) return false;
    if (stockFilter === "low" && !(p.currentStock > 0 && p.currentStock <= p.minStock)) return false;
    if (stockFilter === "empty" && p.currentStock > 0) return false;
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
      );
    }
    return true;
  });

  // Filter Mutasi
  const filteredMutations = mutations.filter((m) => {
    if (mutationProductFilter !== "all" && m.productId !== mutationProductFilter) return false;
    return true;
  });

  // Metrik Status Ketersediaan Sesuai Aturan Tunggal:
  // - Habis: currentStock <= 0
  // - Kritis/Menipis: currentStock > 0 && currentStock <= minStock
  // - Aman: currentStock > minStock
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
  const safeStockCount = products.filter((p) => p.currentStock > p.minStock).length;

  if (loadError) return <ErrorState message="Data persediaan gagal dimuat." onRetry={loadAllData} />;
  if (isLoading) return <LoadingState label="Memuat persediaan…" />;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Manajemen Persediaan & Stok Sembako", active: true },
        ]}
        title="Barang & stok"
        badgeText="Simulasi Persediaan"
        badgeVariant="crimson"
        description="Pemantauan saldo fisik di gerai, kartu mutasi kronologis, stok karantina, dan berita acara opname."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === "opname" && (
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsOpnameModalOpen(true)}
                className="gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Usulkan Opname Fisik
              </Button>
            )}
            {activeTab === "katalog" && (
              <Button
                variant="primary"
                size="default"
                onClick={() => openProductForm()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Master Komoditas
              </Button>
            )}
          </div>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Stok (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Stok Aman (> Minimum)"
          value={`${safeStockCount} SKU`}
          subtitle="Kuantitas siap jual mencukupi batas aman"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          trend={{ label: "Siap Jual", positive: true }}
          accentColor="emerald"
         action={{ label: "Lihat stok cukup", onClick: () => { setActiveTab("katalog"); setStockFilter("safe"); setSearchQuery(""); setSelectedCategory("all"); } }}/>
        <CardMetric
          title="Stok Menipis / Kritis"
          value={`${lowStockCount} SKU`}
          subtitle="Perlu re-order ke pemasok distributor"
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          trend={{
            label: lowStockCount > 0 ? "Perlu Restok" : "Aman",
            positive: lowStockCount === 0,
          }}
          accentColor="amber"
         action={{ label: "Lihat stok menipis", onClick: () => { setActiveTab("katalog"); setStockFilter("low"); setSearchQuery(""); setSelectedCategory("all"); } }}/>
        <CardMetric
          title="Stok Habis (0 Unit)"
          value={`${outOfStockCount} SKU`}
          subtitle="Komoditas membutuhkan restok segera"
          icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
          trend={{
            label: outOfStockCount > 0 ? "Darurat Restok" : "Nihil Kosong",
            positive: outOfStockCount === 0,
          }}
          accentColor="crimson"
         action={{ label: "Lihat stok kosong", onClick: () => { setActiveTab("katalog"); setStockFilter("empty"); setSearchQuery(""); setSelectedCategory("all"); } }}/>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="stock-availability" className="text-sm font-medium">Ketersediaan barang</label>
        <select id="stock-availability" value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setActiveTab("katalog"); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="all">Semua ketersediaan</option><option value="safe">Stok cukup</option><option value="low">Stok menipis</option><option value="empty">Stok kosong</option>
        </select>
        {stockFilter !== "all" && <Button variant="ghost" onClick={() => setStockFilter("all")}>Hapus filter stok</Button>}
      </div>
      {/* Navigasi Sub-Tab */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("katalog")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "katalog"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Package className="h-4 w-4" />
          Stok Fisik & Katalog
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("mutasi")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "mutasi"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          Kartu Mutasi Persediaan
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {mutations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("opname")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "opname"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Stok Opname Fisik
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {opnames.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOK FISIK & KATALOG                                              */}
      {/* ========================================================================= */}
      {activeTab === "katalog" && (
        <div className="space-y-6">

          {/* Toolbar Filter & Pencarian */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama komoditas, SKU, atau kode barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-container w-full sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">Semua Kategori Pangan</option>
                  <option value="beras">Beras & Padi</option>
                  <option value="minyak_goreng">Minyak Goreng</option>
                  <option value="gula_tepung">Gula & Tepung</option>
                  <option value="telur">Telur</option>
                  <option value="bumbu_dapur">Bumbu Dapur</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Tabel Master & Kuantitas Fisik */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">SKU & Barcode</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Nama Komoditas</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Kategori</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-right">Harga Jual</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-center">Stok Siap Jual</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-center">Stok Karantina</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-center">Status Ketersediaan</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const quarantine = quarantineMap[p.id] || 0;
                  const isOutOfStock = p.currentStock <= 0;
                  const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;

                  return (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{p.sku}</span>
                        <span className="text-slate-500 dark:text-slate-400 block text-xs">{p.barcode || "Tanpa Barcode"}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{p.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Satuan: {p.baseUnit}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        {CATEGORY_NAMES[p.category] || p.category}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {formatRupiah(p.sellingPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {p.currentStock} {p.baseUnit}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Min: {p.minStock} {p.baseUnit}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {quarantine > 0 ? (
                          <Badge variant="danger" size="sm">
                            {quarantine} {p.baseUnit} (Cacat)
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">0 {p.baseUnit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">
                            Habis
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="sm">
                            Menipis (Kritis)
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Aman
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => openProductForm(p)} className="mr-2 gap-2"><Pencil className="h-4 w-4" />Edit barang</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchiveTarget(p)}
                          className="h-8 px-2 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 gap-1"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Arsip
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KARTU MUTASI PERSEDIAAN                                           */}
      {/* ========================================================================= */}
      {activeTab === "mutasi" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs md:text-sm leading-relaxed space-y-1 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <History className="h-4 w-4 text-primary" />
              Rekam Jejak Mutasi Audit Persediaan
            </div>
            <p>
              Seluruh penambahan dan pengurangan saldo fisik dicatat secara kronologis melalui dokumen sah
              (penerimaan PO, penjualan kasir, retur pelanggan, atau opname fisik). Sistem melarang penimpaan
              saldo stok secara langsung tanpa jejak mutasi.
            </p>
          </div>

          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter Komoditas:</span>
                <select
                  value={mutationProductFilter}
                  onChange={(e) => setMutationProductFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">Semua Komoditas</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total Mutasi: <strong>{filteredMutations.length}</strong> Pergerakan
              </span>
            </div>

            {filteredMutations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                Belum ada pergerakan mutasi fisik yang tercatat. Lakukan penerimaan barang PO atau transaksi kasir.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Komoditas</th>
                      <th className="py-3 px-4">Jenis Mutasi</th>
                      <th className="py-3 px-4">No. Referensi</th>
                      <th className="py-3 px-4 text-center">Perubahan</th>
                      <th className="py-3 px-4 text-center">Saldo Sebelum</th>
                      <th className="py-3 px-4 text-center">Saldo Akhir</th>
                      <th className="py-3 px-4">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMutations.map((m) => {
                      const isPositive = m.qtyChange > 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.date}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{m.productName}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                m.mutationType === "masuk_po"
                                  ? "success"
                                  : m.mutationType === "keluar_kasir"
                                  ? "info"
                                  : m.mutationType === "karantina_rusak"
                                  ? "danger"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {m.mutationType.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {m.referenceNumber}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span
                              className={`flex items-center justify-center gap-0.5 ${
                                isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              )}
                              {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-500 dark:text-slate-400">
                            {m.qtyBefore}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                            {m.qtyAfter}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.operatorName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STOK OPNAME FISIK                                                 */}
      {/* ========================================================================= */}
      {activeTab === "opname" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Prosedur Rekonsiliasi Fisik vs Sistem</p>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                Stok opname mencatat hasil penghitungan fisik langsung di rak gerai. Jika terdapat selisih
                (akibat penyusutan, tercecer, atau barang rusak), wajib mengisi berita acara alasan selisih.
                Persetujuan manajer akan memperbarui kuantitas sistem dan memposting kartu mutasi penyesuaian.
              </p>
            </div>
          </div>

          <Card>
            {opnames.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-7 w-7 text-slate-400 dark:text-slate-500" />}
                title="Belum Ada Berkas Stok Opname"
                description="Klik tombol 'Usulkan Opname Fisik' di atas untuk memulai pencatatan rekonsiliasi fisik barang."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {opnames.map((op) => (
                  <div key={op.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {op.opnameNumber}
                        </span>
                        <Badge variant={op.status === "disetujui" ? "success" : "warning"} size="sm">
                          {op.status}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Tanggal: {op.date} | Petugas: {op.performedBy}
                        </span>
                      </div>

                      {/* Rincian Item Opname */}
                      <div className="space-y-1 pt-1">
                        {op.items.map((it, idx) => (
                          <div key={idx} className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <strong>{it.productName}</strong>
                              <span className="block text-slate-500 dark:text-slate-400 text-xs">Alasan: {it.reason}</span>
                            </div>
                            <div className="flex items-center gap-4 font-mono">
                              <span>Sistem: {it.systemQty}</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100">Fisik: {it.physicalQty}</span>
                              <span
                                className={`font-bold ${
                                  it.diffQty === 0
                                    ? "text-slate-500 dark:text-slate-400"
                                    : it.diffQty > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                Selisih: {it.diffQty > 0 ? `+${it.diffQty}` : it.diffQty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {op.status === "usulan" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveOpname(op.id)}
                        className="h-8 px-3 text-xs gap-1 self-start md:self-center"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Setujui &amp; Sesuaikan Stok
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH MASTER PRODUK                                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProduct ? "Edit barang" : "Tambah barang"}
        description="Pencatatan spesifikasi produk dagang. Kuantitas fisik awal selalu 0."
        maxWidth="lg"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode SKU Produk"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />

            <Select
              label="Kategori Pangan"
              value={category}
              onChange={(e) => setCategory(e.target.value as Product["category"])}
              options={Object.entries(CATEGORY_NAMES).map(([val, label]) => ({
                value: val,
                label,
              }))}
            />
          </div>

          <Input
            label="Nama Lengkap Komoditas Dagang"
            placeholder="Contoh: Beras Kuriak Kusuik Solok 10 Kg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Satuan Dasar (Unit)"
              placeholder="Contoh: Kg, Pcs, Pouch"
              value={baseUnit}
              onChange={(e) => setBaseUnit(e.target.value)}
              required
            />

            <Input
              label="Satuan Grosir / Dus (Opsional)"
              placeholder="Contoh: Sak, Dus, Karton"
              value={conversionUnit}
              onChange={(e) => setConversionUnit(e.target.value)}
            />

            <Input
              label="Faktor Konversi (Isi)"
              type="number"
              min={1}
              value={conversionFactor}
              onChange={(e) => setConversionFactor(Number(e.target.value))}
              helperText="Jumlah satuan dasar per grosir"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Estimasi Harga Beli (Rp)"
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Number(e.target.value))}
              required
            />

            <Input
              label="Harga Jual Eceran (Rp)"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              required
            />

            <Input
              label="Batas Minimum Stok"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hasExpiry"
              checked={hasExpiry}
              onChange={(e) => setHasExpiry(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-primary-container focus:ring-primary-container"
            />
            <label htmlFor="hasExpiry" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Komoditas memiliki masa kedaluwarsa (memerlukan pelacakan tanggal exp)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Master Produk"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: USULKAN OPNAME FISIK                                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isOpnameModalOpen}
        onClose={() => { if (!isSaving) setIsOpnameModalOpen(false); }}
        title="Formulir Usulan Stok Opname Fisik"
        description="Pencatatan hasil hitung fisik di gerai sembako dengan berita acara selisih."
        maxWidth="md"
      >
        <form onSubmit={handleCreateOpname} className="space-y-4">
          <Select
            label="Pilih Komoditas Sembako"
            value={opnameProductId}
            onChange={(e) => {
              setOpnameProductId(e.target.value);
              const p = products.find((x) => x.id === e.target.value);
              if (p) setPhysicalCountQty(p.currentStock);
            }}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (Stok Sistem: ${p.currentStock} ${p.baseUnit})`,
            }))}
            required
          />

          <Input
            label="Hasil Hitungan Fisik Riil di Gerai"
            type="number"
            min={0}
            value={physicalCountQty}
            onChange={(e) => setPhysicalCountQty(Number(e.target.value))}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Berita Acara Alasan Selisih (Wajib)
            </label>
            <textarea
              value={opnameReason}
              onChange={(e) => setOpnameReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Penyusutan berat butir beras sebesar 2 kg akibat kelembapan udara atau kemasan bocor..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpnameModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              Simpan Usulan Opname
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => { if (!isSaving) setArchiveTarget(null); }}
        onConfirm={handleArchive}
        title="Arsipkan barang?"
        message={
          archiveTarget && archiveTarget.currentStock > 0
            ? `Perhatian: Barang "${archiveTarget.name}" masih memiliki stok fisik sebesar ${archiveTarget.currentStock} ${archiveTarget.baseUnit} di gudang. Mengarsipkan barang akan menyembunyikannya dari katalog aktif namun saldo fisik tetap tercatat.`
            : `Barang "${archiveTarget?.name ?? ""}" akan disembunyikan dari katalog aktif. Riwayat mutasi sesi tetap tersedia.`
        }
        confirmText="Arsipkan"
        isLoading={isSaving}
      />
    </div>
  );
}

export default function StokPage() {
  return isProductionDatabaseConfigured() ? <ProductionStockPage /> : <PreparationStockPage />;
}
