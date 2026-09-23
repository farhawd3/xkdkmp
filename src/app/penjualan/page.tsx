"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  DollarSign,
  QrCode,
  CreditCard,
  RotateCcw,
  Receipt,
  Store,
  ChevronRight,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
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
import {
  Product,
  Member,
  CashierShift,
  PosCartItem,
  PosTransaction,
} from "@/types";

export default function PenjualanPage() {
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);

  // Keranjang Kasir
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerType, setCustomerType] = useState<"umum" | "anggota">("umum");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "transfer_manual" | "qris_manual">("tunai");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal Buka Shift
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [shiftCashierName, setShiftCashierName] = useState("Abdul Halim");
  const [shiftRegisterNum, setShiftRegisterNum] = useState("REG-01");
  const [shiftInitialCash, setShiftInitialCash] = useState<number>(200000);

  // Modal Tutup Shift (Blind Count)
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [blindCashCount, setBlindCashCount] = useState<number>(0);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [shiftCloseSummary, setShiftCloseSummary] = useState<any>(null);

  // Modal Struk Belanja
  const [completedTx, setCompletedTx] = useState<PosTransaction | null>(null);

  // Modal Retur Penjualan
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReceiptNum, setReturnReceiptNum] = useState("");
  const [returnReason, setReturnReason] = useState<"cacat_rusak" | "salah_beli" | "kedaluwarsa">("cacat_rusak");
  const [returnQty, setReturnQty] = useState<number>(1);
  const [selectedReturnItem, setSelectedReturnItem] = useState<PosCartItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    const [prods, mbrRes, shift, txs] = await Promise.all([
      preparationRepository.getProducts(),
      preparationRepository.getMembers(undefined, undefined, 1, 100),
      preparationRepository.getActiveShift(),
      preparationRepository.getPosTransactions(),
    ]);
    setProducts(prods);
    setMembers(mbrRes.members);
    setActiveShift(shift);
    setTransactions(txs);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hitung Subtotal & Grand Total Keranjang
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const cartGrandTotal = cartSubtotal; // PPN 0% sembako
  const cashChange = Math.max(0, cashReceived - cartGrandTotal);

  // Tambah Produk ke Keranjang
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      showToast("error", "Stok Habis", `Komoditas "${product.name}" sedang habis di rak gerai.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          showToast(
            "warning",
            "Batas Stok Tercapai",
            `Maksimal kuantitas tersedia di rak: ${product.currentStock} ${product.baseUnit}.`
          );
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.baseUnit,
            unitPrice: product.sellingPrice,
            quantity: 1,
            discount: 0,
            subtotal: product.sellingPrice,
          },
        ];
      }
    });
  };

  // Ubah Jumlah Item Keranjang
  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const prod = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;
            if (prod && newQty > prod.currentStock) {
              showToast("warning", "Stok Tidak Cukup", `Stok fisik di rak hanya ${prod.currentStock}.`);
              return item;
            }
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[];
    });
  };

  // Hapus Item dari Keranjang
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Scan Barcode / Search Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBarcode.trim()) return;

    const term = searchBarcode.trim().toLowerCase();
    const found = products.find(
      (p) =>
        p.sku.toLowerCase() === term ||
        (p.barcode && p.barcode.toLowerCase() === term) ||
        p.name.toLowerCase().includes(term)
    );

    if (found) {
      addToCart(found);
      setSearchBarcode("");
    } else {
      showToast("error", "Barang Tidak Ditemukan", `Tidak ada produk dengan kode/nama "${searchBarcode}".`);
    }
  };

  // Buka Shift Kasir
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const shift = await preparationRepository.openShift(
        shiftCashierName,
        shiftRegisterNum,
        Number(shiftInitialCash)
      );
      setActiveShift(shift);
      setIsOpenShiftModalOpen(false);
      showToast(
        "success",
        "Shift Kasir Dibuka",
        `Kasir ${shift.cashierName} aktif di ${shift.registerNumber}. Modal awal tercatat ${formatRupiah(shift.initialCash)}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selesaikan Transaksi Penjualan Atomik
  const handleCompleteTransaction = async () => {
    if (cart.length === 0) {
      showToast("error", "Keranjang Kosong", "Pilih produk sembako terlebih dahulu.");
      return;
    }

    if (paymentMethod === "tunai" && cashReceived < cartGrandTotal) {
      showToast(
        "error",
        "Uang Pembayaran Kurang",
        `Total belanja ${formatRupiah(cartGrandTotal)}, uang yang diterima ${formatRupiah(cashReceived)}.`
      );
      return;
    }

    if ((paymentMethod === "transfer_manual" || paymentMethod === "qris_manual") && !referenceNumber.trim()) {
      showToast("error", "Nomor Referensi Wajib", "Masukkan nomor referensi transaksi bukti bayar.");
      return;
    }

    setIsSubmitting(true);
    try {
      let memberName: string | undefined;
      if (customerType === "anggota" && selectedMemberId) {
        const m = members.find((x) => x.id === selectedMemberId);
        memberName = m?.fullName;
      }

      const res = await preparationRepository.createPosTransaction({
        shiftId: activeShift?.id || "demo-shift",
        cashierName: activeShift?.cashierName || "Kasir Demo",
        customerType,
        memberId: selectedMemberId || undefined,
        memberName,
        items: cart,
        subtotal: cartSubtotal,
        discountTotal: 0,
        grandTotal: cartGrandTotal,
        paymentMethod,
        cashReceived: paymentMethod === "tunai" ? cashReceived : undefined,
        cashChange: paymentMethod === "tunai" ? cashChange : undefined,
        referenceNumber: referenceNumber || undefined,
      });

      if (!res.success) {
        showToast("error", "Transaksi Gagal", res.error || "Gagal memproses transaksi kasir.");
        return;
      }

      showToast(
        "success",
        "Transaksi Berhasil Selesai",
        `Struk ${res.transaction?.receiptNumber} terbit. Stok persediaan berkurang otomatis.`
      );

      setCompletedTx(res.transaction || null);
      setCart([]);
      setCashReceived(0);
      setReferenceNumber("");
      await loadData();
    } catch {
      showToast("error", "Gagal", "Terjadi kesalahan sistem saat memproses transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tutup Shift Kasir (Blind Count)
  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    setIsSubmitting(true);
    try {
      const res = await preparationRepository.closeShift(
        activeShift.id,
        Number(blindCashCount),
        discrepancyReason
      );

      if (!res.success) {
        showToast("error", "Gagal Tutup Shift", res.error || "Terjadi kesalahan.");
        return;
      }

      setShiftCloseSummary(res.shift);
      setActiveShift(null);
      showToast("info", "Shift Kasir Ditutup", "Rekonsiliasi blind count kas register selesai.");
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retur Penjualan
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReceiptNum.trim() || !selectedReturnItem) {
      showToast("error", "Lengkapi Data", "Pilih transaksi dan barang yang diretur.");
      return;
    }

    setIsSubmitting(true);
    try {
      const refundAmount = selectedReturnItem.unitPrice * returnQty;
      const res = await preparationRepository.createPosReturn({
        originalReceiptNumber: returnReceiptNum.trim(),
        authorizedBy: "Abdul Halim (Manajer)",
        reason: returnReason,
        returnedItems: [
          {
            productId: selectedReturnItem.productId,
            name: selectedReturnItem.name,
            quantity: returnQty,
            refundAmount,
          },
        ],
        totalRefund: refundAmount,
        allocatedTo: returnReason === "cacat_rusak" ? "karantina" : "stok_jual",
      });

      if (!res.success) {
        showToast("error", "Retur Gagal", res.error || "Gagal mencatat retur.");
        return;
      }

      showToast(
        "success",
        "Retur Berhasil Diproses",
        `Dana ${formatRupiah(refundAmount)} dikembalikan. Barang dialihkan ke gudang ${
          returnReason === "cacat_rusak" ? "karantina (rusak)" : "siap jual"
        }.`
      );

      setIsReturnModalOpen(false);
      setReturnReceiptNum("");
      setSelectedReturnItem(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    return true;
  });

  // Hitung metrik ringkasan
  const totalSalesAmount = useMemo(
    () => transactions.reduce((acc, t) => acc + t.grandTotal, 0),
    [transactions]
  );
  const qrisTransactionsCount = useMemo(
    () => transactions.filter((t) => t.paymentMethod === "qris_manual").length,
    [transactions]
  );

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Titik Penjualan Kasir (POS)", active: true },
        ]}
        title="Kasir Ritel Sembako (POS)"
        badgeText="Simulasi Kasir Ritel"
        badgeVariant="crimson"
        description="Pencatatan transaksi eceran sembako, cetak struk belanja, pembayaran tunai/QRIS, dan rekonsiliasi kas register."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {activeShift ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Shift Aktif: {activeShift.cashierName} ({activeShift.registerNumber})
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBlindCashCount(activeShift.initialCash);
                    setIsCloseShiftModalOpen(true);
                  }}
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 text-xs"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Tutup Shift
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsOpenShiftModalOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Unlock className="h-4 w-4" />
                Buka Shift Kasir Baru
              </Button>
            )}

            <Button
              variant="outline"
              size="default"
              onClick={() => setIsReturnModalOpen(true)}
              className="gap-1.5 text-xs text-slate-700 dark:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Otorisasi Retur
            </Button>
          </div>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Kasir (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Status Register Kasir"
          value={activeShift ? "Shift Terbuka" : "Shift Tertutup"}
          subtitle={
            activeShift
              ? `${activeShift.cashierName} • Reg #${activeShift.registerNumber}`
              : "Buka shift untuk input transaksi"
          }
          icon={<Store className="h-4 w-4 text-emerald-600" />}
          trend={{
            label: activeShift ? "Kas Siap" : "Standby",
            positive: !!activeShift,
          }}
          accentColor={activeShift ? "emerald" : "neutral"}
        />
        <CardMetric
          title="Total Penjualan Shift"
          value={formatRupiah(totalSalesAmount)}
          subtitle={`${transactions.length} struk penjualan tersimpan`}
          icon={<Receipt className="h-4 w-4 text-rose-600" />}
          trend={{ label: "Omset Sembako", positive: true }}
          accentColor="crimson"
         action={{ label: "Lihat laporan", href: "/laporan" }}/>
        <CardMetric
          title="Kanal Penerimaan"
          value={`${qrisTransactionsCount} QRIS • ${transactions.length - qrisTransactionsCount} Tunai`}
          subtitle="Pemisahan akun kas vs bank giro"
          icon={<CreditCard className="h-4 w-4 text-sky-600" />}
          trend={{ label: "Multi-Metode", positive: true }}
          accentColor="sky"
         action={{ label: "Tinjau kas & bank", href: "/keuangan" }}/>
      </div>

      {/* Banner Peringatan Demo Pelatihan */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <Store className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Lingkungan Demo Latihan Kasir</p>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300">
            Unit Gerai Sembako berada dalam status <strong>Mode Persiapan (2027)</strong>. Transaksi di bawah
            ini berfungsi sebagai simulasi kasir pelatihan petugas toko dan tidak memengaruhi buku besar
            akuntansi resmi.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN DUA PANEL POS: KATALOG DI KIRI, KERANJANG DI KANAN                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL KIRI: KATALOG PRODUK SEMBAKO (7 Kolom pada Desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {/* Barcode & Search Input */}
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Scan barcode / cari nama sembako (Tekan Enter)..."
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 text-xs">
                  Cari / Scan
                </Button>
              </form>

              {/* Filter Kategori Pangan */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "Semua" },
                  { id: "beras", label: "Beras" },
                  { id: "minyak_goreng", label: "Minyak" },
                  { id: "gula_tepung", label: "Gula/Tepung" },
                  { id: "telur", label: "Telur" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grid Kartu Produk Kasir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.currentStock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between select-none ${
                    isOutOfStock
                      ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed dark:bg-slate-900/40 dark:border-slate-800"
                      : "bg-white border-slate-200 hover:border-primary hover:shadow-sm cursor-pointer active:scale-98 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-primary"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{p.sku}</span>
                      <Badge
                        variant={isOutOfStock ? "danger" : p.currentStock <= p.minStock ? "warning" : "success"}
                        size="sm"
                      >
                        {isOutOfStock ? "Habis" : `Stok: ${p.currentStock}`}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-primary">
                      {formatRupiah(p.sellingPrice)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">per {p.baseUnit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL KANAN: KERANJANG KASIR & PEMBAYARAN (5 Kolom pada Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm sticky top-6 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Keranjang Belanja
                </CardTitle>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {cart.length} Jenis Barang
                </span>
              </div>

              {/* Pemilihan Tipe Pelanggan */}
              <div className="pt-2 flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={customerType === "umum"}
                    onChange={() => setCustomerType("umum")}
                    className="text-primary focus:ring-primary"
                  />
                  Pembeli Umum
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={customerType === "anggota"}
                    onChange={() => setCustomerType("anggota")}
                    className="text-primary focus:ring-primary"
                  />
                  Anggota Koperasi
                </label>
              </div>

              {customerType === "anggota" && (
                <div className="pt-2">
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-1.5 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Pilih Anggota Terdaftar --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.maskedNik})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardHeader>

            {/* List Item Belanja */}
            <CardContent className="p-4 max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Keranjang belanja masih kosong. Klik barang di katalog atau scan barcode.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h5>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {formatRupiah(item.unitPrice)} / {item.unit}
                      </span>
                    </div>

                    {/* Pengatur Kuantitas */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQty(item.productId, -1)}
                        className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-200">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, 1)}
                        className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 w-20 text-right">
                      {formatRupiah(item.subtotal)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>

            {/* Bagian Total & Pembayaran */}
            <CardFooter className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-3 dark:bg-slate-900/90 dark:border-slate-800">
              <div className="w-full space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal Belanja</span>
                  <span className="font-mono font-semibold">{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>PPN Sembako (Bebas)</span>
                  <span className="font-mono">Rp 0</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-slate-100 text-sm font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-primary text-base">{formatRupiah(cartGrandTotal)}</span>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Metode Pembayaran:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("tunai")}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "tunai"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer_manual")}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "transfer_manual"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris_manual")}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "qris_manual"
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    QRIS Statis
                  </button>
                </div>

                {/* Input Tunai / Referensi */}
                {paymentMethod === "tunai" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Uang Tunai Diterima:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        Kembalian: {formatRupiah(cashChange)}
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={cashReceived || ""}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      placeholder="Masukkan nominal uang tunai..."
                      className="font-mono font-bold"
                    />
                  </div>
                )}

                {(paymentMethod === "transfer_manual" || paymentMethod === "qris_manual") && (
                  <div className="space-y-1 pt-1">
                    <Input
                      label="Nomor Referensi Transaksi (Bukti Bayar)"
                      placeholder="Contoh: REF/2026/09/12345"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      required
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Kasir memeriksa bukti transfer/QRIS secara fisik sebelum menyelesaikan.
                    </span>
                  </div>
                )}
              </div>

              {/* Tombol Selesaikan Transaksi */}
              <Button
                variant="primary"
                size="default"
                onClick={handleCompleteTransaction}
                disabled={cart.length === 0 || !activeShift || isSubmitting}
                isLoading={isSubmitting}
                className="w-full mt-2 py-3 text-sm font-bold gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Selesaikan Transaksi ({formatRupiah(cartGrandTotal)})
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BUKA SHIFT KASIR BARU                                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Buka Shift Kasir Baru"
        description="Pendaftaran petugas kasir yang bertugas dan modal awal kas register."
        maxWidth="md"
      >
        <form onSubmit={handleOpenShift} className="space-y-4">
          <Input
            label="Nama Petugas Kasir"
            value={shiftCashierName}
            onChange={(e) => setShiftCashierName(e.target.value)}
            required
          />

          <Input
            label="Nomor Register / Mesin Kasir"
            value={shiftRegisterNum}
            onChange={(e) => setShiftRegisterNum(e.target.value)}
            required
          />

          <Input
            label="Modal Awal Kas Register (Rp)"
            type="number"
            min={0}
            value={shiftInitialCash}
            onChange={(e) => setShiftInitialCash(Number(e.target.value))}
            helperText="Uang pecahan kecil untuk kembalian pembeli"
            required
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsOpenShiftModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Buka Shift Kasir
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TUTUP SHIFT KASIR (BLIND COUNT)                                    */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isCloseShiftModalOpen}
        onClose={() => setIsCloseShiftModalOpen(false)}
        title="Tutup Shift Kasir (Blind Count)"
        description="Penghitungan fisik uang tunai register tanpa melihat saldo akhir sistem terlebih dahulu."
        maxWidth="md"
      >
        <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Prosedur Blind Count</p>
              <p className="text-amber-800 dark:text-amber-300">
                Hitung seluruh uang kertas dan koin yang ada di laci register. Masukkan jumlah riil yang
                Anda hitung tangan di bawah ini.
              </p>
            </div>
          </div>

          <Input
            label="Hasil Hitung Uang Tunai Fisik di Register (Rp)"
            type="number"
            min={0}
            value={blindCashCount}
            onChange={(e) => setBlindCashCount(Number(e.target.value))}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Berita Acara Alasan Selisih (Jika Ada)
            </label>
            <textarea
              value={discrepancyReason}
              onChange={(e) => setDiscrepancyReason(e.target.value)}
              rows={2}
              placeholder="Jelaskan bila terdapat selisih uang kembalian atau pembulatan kasir..."
              className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCloseShiftModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" isLoading={isSubmitting}>
              Konfirmasi Tutup Shift
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: STRUK BELANJA SIAP CETAK (80mm / A4)                              */}
      {/* ========================================================================= */}
      {completedTx && (
        <Dialog
          isOpen={true}
          onClose={() => setCompletedTx(null)}
          title="Bukti Transaksi Struk Kasir"
          description={`Nomor Struk: ${completedTx.receiptNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-mono">
            {/* Tampilan Struk Format 80mm */}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm text-center space-y-2 text-slate-800 dark:text-slate-100 print:bg-white print:text-black print:border-slate-300">
              <div className="font-bold text-sm uppercase">KOPDES MERAH PUTIH</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Gerai Sembako Nagari Ladang Laweh</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Kec. Banuhampu, Kab. Agam, Sumbar</div>
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

              <div className="text-left text-xs space-y-0.5 text-slate-700 dark:text-slate-300">
                <div>No. Struk: {completedTx.receiptNumber}</div>
                <div>Waktu: {new Date(completedTx.timestamp).toLocaleString("id-ID")} WIB</div>
                <div>Kasir: {completedTx.cashierName}</div>
                <div>Pelanggan: {completedTx.memberName || "Umum (Non-Anggota)"}</div>
              </div>

              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

              {/* Rincian Item */}
              <div className="space-y-1 text-left text-slate-800 dark:text-slate-200">
                {completedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-slate-400 dark:text-slate-400">
                        {item.quantity} x {formatRupiah(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-bold">{formatRupiah(item.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />

              <div className="space-y-0.5 text-right text-xs text-slate-800 dark:text-slate-200">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(completedTx.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Metode:</span>
                  <span className="uppercase">{completedTx.paymentMethod.replace("_", " ")}</span>
                </div>
                {completedTx.cashReceived !== undefined && (
                  <>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Tunai:</span>
                      <span>{formatRupiah(completedTx.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Kembali:</span>
                      <span>{formatRupiah(completedTx.cashChange || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 my-2" />
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Terima kasih telah berbelanja di Gerai Sembako Desa.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1 text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Struk
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCompletedTx(null)}
                className="text-xs"
              >
                Transaksi Baru
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OTORISASI RETUR PENJUALAN                                         */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Otorisasi Retur Penjualan"
        description="Pengembalian barang belanjaan pelanggan berbasis nomor struk asal."
        maxWidth="md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Input
            label="Nomor Struk Transaksi Asal"
            placeholder="Contoh: TRX-20260922-001"
            value={returnReceiptNum}
            onChange={(e) => {
              setReturnReceiptNum(e.target.value);
              const tx = transactions.find((t) => t.receiptNumber === e.target.value);
              if (tx && tx.items.length > 0) {
                setSelectedReturnItem(tx.items[0]);
              }
            }}
            required
          />

          <Select
            label="Alasan Pengembalian Barang"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value as any)}
            options={[
              { value: "cacat_rusak", label: "Barang Cacat / Rusak (Dialihkan ke Karantina)" },
              { value: "salah_beli", label: "Salah Beli (Kembali ke Stok Siap Jual)" },
              { value: "kedaluwarsa", label: "Masa Kedaluwarsa Terlewat" },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kuantitas Retur"
              type="number"
              min={1}
              value={returnQty}
              onChange={(e) => setReturnQty(Number(e.target.value))}
              required
            />
            <div className="text-xs pt-6 text-slate-500">
              {returnReason === "cacat_rusak" ? (
                <Badge variant="danger">Stok Karantina</Badge>
              ) : (
                <Badge variant="success">Stok Siap Jual</Badge>
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsReturnModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Proses Retur Penjualan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
