"use client";

import { useState } from "react";
import { AlertTriangle, Package, PackageX, Search, Edit3, CheckCircle2, Download, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardMetric } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { useResource } from "@/lib/useResource";
import { downloadCsvFile } from "@/lib/csv";
import { getTodayWIB } from "@/lib/utils";
import { CatalogProduct } from "@/types/models";

async function loadCatalog(): Promise<CatalogProduct[]> {
  const response = await fetch("/api/stock-simple", { cache: "no-store" });
  if (!response.ok) throw new Error("Katalog stok belum dapat diakses.");
  const result = await response.json() as { products: CatalogProduct[] };
  return result.products;
}

export function ProductionStockPage() {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("semua");
  const { data, loading, error, reload } = useResource(loadCatalog);

  // Modal Penyesuaian Angka Stok
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [newStock, setNewStock] = useState("");
  const [newMinStock, setNewMinStock] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const handleOpenEdit = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setNewStock(String(product.current_stock));
    setNewMinStock(String(product.min_stock));
    setStockNotes(product.notes || "");
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/stock-simple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          current_stock: parseFloat(newStock) || 0,
          min_stock: parseFloat(newMinStock) || 0,
          notes: stockNotes.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memperbarui stok.");

      showToast("success", "Stok Diperbarui", `Angka stok ${selectedProduct.name} berhasil disesuaikan.`);
      setSelectedProduct(null);
      reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      showToast("error", "Gagal", msg);
    } finally {
      setUpdating(false);
    }
  };

  if (error) return <ErrorState message="Katalog stok belum dapat dimuat. Periksa koneksi dan kesesuaian struktur database." onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Membaca katalog stok Supabase…" />;

  const empty = data.filter((product) => product.current_stock === 0).length;
  const low = data.filter((product) => product.current_stock > 0 && product.current_stock <= product.min_stock).length;
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const visibleProducts = data.filter((product) => {
    const matchesQuery = `${product.sku} ${product.name} ${product.category}`.toLocaleLowerCase("id-ID").includes(normalizedQuery);
    const productCondition = product.current_stock === 0 ? "kosong" : product.current_stock <= product.min_stock ? "menipis" : "cukup";
    return matchesQuery && (condition === "semua" || condition === productCondition);
  });

  const isFilterActive = query.trim() !== "" || condition !== "semua";

  const handleResetFilters = () => {
    setQuery("");
    setCondition("semua");
  };

  const handleExportCsv = () => {
    if (visibleProducts.length === 0) {
      showToast("error", "Tidak Ada Data", "Tidak ada barang terfilter untuk diekspor.");
      return;
    }

    const headers = [
      "SKU",
      "Nama Barang / Komoditas",
      "Kategori",
      "Stok Fisik",
      "Satuan",
      "Batas Minimum",
      "Kondisi Stok",
      "Catatan",
    ];

    const rows = visibleProducts.map((p) => {
      const cond = p.current_stock === 0 ? "Kosong" : p.current_stock <= p.min_stock ? "Menipis" : "Cukup";
      return [
        p.sku,
        p.name,
        p.category,
        p.current_stock,
        p.base_unit,
        p.min_stock,
        cond,
        p.notes || "",
      ];
    });

    const todayStr = getTodayWIB();
    downloadCsvFile(`stok-komoditas-kopdes-${todayStr}.csv`, [headers, ...rows]);
    showToast("success", "Ekspor Berhasil", "Berkas CSV stok fisik telah diunduh.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Operasional Gerai" },
          { label: "Barang & Stok", active: true },
        ]}
        title="Pemantauan Jumlah & Angka Stok"
        badgeText="Monitoring Stok"
        badgeVariant="crimson"
        description="Pantau angka ketersediaan fisik komoditas gerai, batas minimum stok, dan sesuaikan angka fisik barang secara langsung."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <CardMetric title="Produk terdaftar" value={data.length} icon={<Package className="h-4 w-4" />} subtitle="Produk komoditas aktif." />
        <CardMetric title="Stok menipis" value={low} icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} accent="amber" subtitle="Di bawah atau sama batas minimum." />
        <CardMetric title="Stok habis / kosong" value={empty} icon={<PackageX className="h-4 w-4 text-rose-600" />} accent="crimson" subtitle="Barang yang perlu segera disediakan." />
      </div>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-sm">
              <label htmlFor="stock-search" className="mb-1.5 block text-sm font-semibold">Cari barang</label>
              <div className="relative flex items-center">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="stock-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nama, SKU, atau kategori"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-600 dark:bg-[#1D2533] dark:text-slate-100"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="stock-condition" className="mb-1.5 block text-sm font-semibold">Kondisi stok</label>
              <select
                id="stock-condition"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-600 dark:bg-[#1D2533] dark:text-slate-100"
              >
                <option value="semua">Semua kondisi</option>
                <option value="cukup">Cukup</option>
                <option value="menipis">Menipis</option>
                <option value="kosong">Kosong</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              <span>
                Menampilkan <strong>{visibleProducts.length}</strong> dari {data.length} komoditas barang.
              </span>
              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Filter
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={visibleProducts.length === 0}
              className="min-h-11 sm:min-h-9 gap-1.5 font-bold text-xs"
            >
              <Download className="h-3.5 w-3.5 text-primary-container" />
              Ekspor CSV ({visibleProducts.length})
            </Button>
          </div>

          {data.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
              Belum ada produk yang tercatat di database Supabase.
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
              Tidak ada barang yang cocok dengan kata pencarian atau filter kondisi stok.
            </p>
          ) : (
            <div role="region" aria-label="Daftar stok produk" tabIndex={0} className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                    <th scope="col" className="p-3">SKU</th>
                    <th scope="col" className="p-3">Nama Barang</th>
                    <th scope="col" className="p-3">Kategori</th>
                    <th scope="col" className="p-3 text-right">Stok Fisik</th>
                    <th scope="col" className="p-3">Kondisi</th>
                    <th scope="col" className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-rose-50/40 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
                    >
                      <td className="p-3 font-mono text-xs">{product.sku}</td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-xs">{product.category.replaceAll("_", " ")}</td>
                      <td className="p-3 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {product.current_stock} <span className="font-normal text-xs text-slate-500">{product.base_unit}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            product.current_stock === 0
                              ? "font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md text-xs"
                              : product.current_stock <= product.min_stock
                              ? "font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md text-xs"
                              : "font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-xs"
                          }
                        >
                          {product.current_stock === 0
                            ? "Kosong"
                            : product.current_stock <= product.min_stock
                            ? "Menipis"
                            : "Cukup"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(product)}
                          className="h-8 text-xs font-semibold"
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> Sesuaikan
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog Sesuaikan Angka Stok */}
      <Dialog
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Sesuaikan Angka Stok: ${selectedProduct?.name}`}
        description="Perbarui angka stok fisik nyata hasil pengecekan di gerai secara langsung."
        maxWidth="md"
      >
        {selectedProduct && (
          <form onSubmit={handleSaveStock} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p>SKU Barang: <strong>{selectedProduct.sku}</strong></p>
              <p>Satuan: <strong>{selectedProduct.base_unit}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stok Fisik Nyata <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Stok Minimum
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Penyesuaian
              </label>
              <input
                type="text"
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
                placeholder="Contoh: Hasil cek fisik tanggal..."
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setSelectedProduct(null)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={updating}>
                {updating ? "Menyimpan..." : "Simpan Angka Stok"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
