"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShoppingBag,
  Plus,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  Package,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Search,
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
import { DateInput } from "@/components/ui/DateInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { formatRupiah } from "@/lib/utils";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  Product,
  GoodsReceipt,
} from "@/types";

// Schema Form Buat PO Baru
const poSchema = z.object({
  supplierId: z.string().min(1, "Pilih mitra pemasok"),
  orderDate: z.string().min(1, "Tanggal pesanan wajib diisi"),
  expectedDeliveryDate: z.string().min(1, "Perkiraan tanggal kirim wajib diisi"),
  productId: z.string().min(1, "Pilih komoditas sembako"),
  orderedQty: z.coerce.number().min(1, "Jumlah pesanan minimal 1"),
  unitPrice: z.coerce.number().min(100, "Harga satuan minimal Rp100"),
  notes: z.string().optional(),
});

type PoFormData = z.infer<typeof poSchema>;

export default function PembelianPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoForDetail, setSelectedPoForDetail] = useState<PurchaseOrder | null>(null);
  const [selectedPoForReceipt, setSelectedPoForReceipt] = useState<PurchaseOrder | null>(null);
  const [selectedPoForReject, setSelectedPoForReject] = useState<PurchaseOrder | null>(null);

  // Form Penerimaan Barang Fisik
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [receivedDate, setReceivedDate] = useState("2026-09-22");
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});
  const [damagedQtyMap, setDamagedQtyMap] = useState<Record<string, number>>({});

  // Form Tolak PO
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PoFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      orderDate: "2026-09-22",
      expectedDeliveryDate: "2026-09-29",
      orderedQty: 10,
    },
  });

  const selectedProductId = watch("productId");

  // Otomatis isi harga beli acuan saat produk dipilih
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        setValue("unitPrice", prod.estimatedCost);
      }
    }
  }, [selectedProductId, products, setValue]);

  const loadAllData = async () => {
    const [pos, sups, prods] = await Promise.all([
      preparationRepository.getPurchaseOrders(),
      preparationRepository.getSuppliers(),
      preparationRepository.getProducts(),
    ]);
    setPurchaseOrders(pos);
    setSuppliers(sups);
    setProducts(prods);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Submit Buat PO
  const onSubmitPo = async (data: PoFormData) => {
    setIsSubmitting(true);
    try {
      const sup = suppliers.find((s) => s.id === data.supplierId);
      const prod = products.find((p) => p.id === data.productId);

      if (!sup || !prod) {
        showToast("error", "Gagal", "Data pemasok atau produk tidak valid.");
        return;
      }

      const subtotal = data.orderedQty * data.unitPrice;
      const poItem: PurchaseOrderItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.baseUnit,
        orderedQty: data.orderedQty,
        receivedQty: 0,
        invoicedQty: 0,
        unitPrice: data.unitPrice,
        subtotal,
      };

      const newPo = await preparationRepository.addPurchaseOrder({
        supplierId: sup.id,
        supplierName: sup.name,
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        items: [poItem],
        totalAmount: subtotal,
        notes: data.notes || "Surat Pesanan tahap persiapan gerai sembako.",
        createdBy: "Abdul Halim",
      });

      showToast(
        "success",
        "PO Berhasil Dibuat",
        `Nomor ${newPo.poNumber} telah diajukan. Ingat: PO belum menambah stok fisik barang!`
      );

      setIsCreateModalOpen(false);
      reset();
      await loadAllData();
    } catch {
      showToast("error", "Gagal", "Gagal membuat surat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setujui PO
  const handleApprovePo = async (poId: string, poNum: string) => {
    await preparationRepository.approvePurchaseOrder(poId, "Abdul Halim (Manajer)");
    showToast(
      "success",
      "PO Disetujui",
      `Surat Pesanan ${poNum} telah disetujui. Menunggu pengiriman fisik dari pemasok.`
    );
    await loadAllData();
  };

  // Tolak PO
  const handleRejectPoSubmit = async () => {
    if (!selectedPoForReject || !rejectionReason.trim()) {
      showToast("error", "Alasan Wajib", "Harap isi alasan penolakan PO.");
      return;
    }

    await preparationRepository.rejectPurchaseOrder(selectedPoForReject.id, rejectionReason.trim());
    showToast("info", "PO Ditolak", `Surat Pesanan ${selectedPoForReject.poNumber} telah ditolak.`);
    setSelectedPoForReject(null);
    setRejectionReason("");
    await loadAllData();
  };

  // Buka Modal Terima Barang
  const handleOpenReceiptModal = (po: PurchaseOrder) => {
    setSelectedPoForReceipt(po);
    setDeliveryNoteNumber(`SJ-${Date.now().toString().slice(-6)}`);
    const initialRec: Record<string, number> = {};
    const initialDam: Record<string, number> = {};
    po.items.forEach((item) => {
      const remaining = Math.max(0, item.orderedQty - item.receivedQty);
      initialRec[item.productId] = remaining;
      initialDam[item.productId] = 0;
    });
    setReceivedQtyMap(initialRec);
    setDamagedQtyMap(initialDam);
  };

  // Submit Penerimaan Barang (Goods Receipt)
  const handleSubmitReceipt = async () => {
    if (!selectedPoForReceipt || !deliveryNoteNumber.trim()) {
      showToast("error", "Gagal", "Nomor Surat Jalan pemasok wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptItems = selectedPoForReceipt.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        receivedQty: Number(receivedQtyMap[item.productId] || 0),
        damagedQty: Number(damagedQtyMap[item.productId] || 0),
      }));

      const res = await preparationRepository.createGoodsReceipt({
        poId: selectedPoForReceipt.id,
        poNumber: selectedPoForReceipt.poNumber,
        deliveryNoteNumber: deliveryNoteNumber.trim(),
        receivedDate,
        receivedBy: "Abdul Halim (Gudang)",
        items: receiptItems,
        notes: "Pemeriksaan fisik barang datang di gerai sembako Ladang Laweh.",
      });

      if (!res.success) {
        showToast("error", "Gagal", res.error || "Gagal mencatat penerimaan barang.");
        return;
      }

      showToast(
        "success",
        "Penerimaan Barang Selesai",
        `Dokumen ${res.receipt?.receiptNumber} diposting. Kuantitas stok fisik di gudang telah bertambah!`
      );

      setSelectedPoForReceipt(null);
      await loadAllData();
    } catch {
      showToast("error", "Gagal", "Gagal menyimpan dokumen penerimaan barang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter PO
  const filteredPos = purchaseOrders.filter((po) => {
    const matchesStatus = selectedStatus === "all" || po.status === selectedStatus;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const poNumMatch = po.poNumber.toLowerCase().includes(q);
    const supplierMatch = po.supplierName.toLowerCase().includes(q);
    const itemMatch = po.items.some((item) =>
      item.productName.toLowerCase().includes(q)
    );
    return poNumMatch || supplierMatch || itemMatch;
  });

  const pendingApprovalCount = purchaseOrders.filter((p) => p.status === "diajukan").length;
  const completedReceiptCount = purchaseOrders.filter((p) => p.status === "selesai").length;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Pembelian & penerimaan", active: true },
        ]}
        title="Pembelian & penerimaan"
        badgeText="Simulasi Pengadaan"
        badgeVariant="warning"
        description="Siklus pengadaan komoditas pangan: Pemesanan ke mitra grosir, persetujuan PO, dan verifikasi fisik penerimaan gudang."
        actions={
          <Button
            variant="primary"
            size="default"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Buat Surat Pesanan (PO)
          </Button>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Pengadaan (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Total Pesanan (PO)"
          value={purchaseOrders.length.toString()}
          subtitle="Seluruh arsip pengadaan sembako"
          icon={<ShoppingBag className="h-4 w-4 text-rose-600" />}
          trend={{ label: "Arsip Pengadaan", positive: true }}
          accentColor="crimson"
         action={{ label: "Lihat semua pesanan", onClick: () => { setSelectedStatus("all"); setSearchQuery(""); } }}/>
        <CardMetric
          title="Menunggu Otorisasi"
          value={pendingApprovalCount.toString()}
          subtitle="PO butuh persetujuan pengurus"
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          trend={{
            label: pendingApprovalCount > 0 ? "Perlu Ditinjau" : "Nihil Antrean",
            positive: pendingApprovalCount === 0,
          }}
          accentColor="amber"
         action={{ label: "Tinjau pengajuan", onClick: () => { setSelectedStatus("diajukan"); setSearchQuery(""); } }}/>
        <CardMetric
          title="Penerimaan Fisik Selesai"
          value={`${completedReceiptCount} / ${purchaseOrders.length}`}
          subtitle="Penerimaan gudang diverifikasi"
          icon={<Truck className="h-4 w-4 text-emerald-600" />}
          trend={{ label: "Stok Masuk Gudang", positive: true }}
          accentColor="emerald"
          progress={purchaseOrders.length > 0 ? Math.round((completedReceiptCount / purchaseOrders.length) * 100) : 0}
         action={{ label: "Lihat pesanan selesai", onClick: () => { setSelectedStatus("selesai"); setSearchQuery(""); } }}/>
      </div>

      {/* Banner Edukasi Prinsip Pemisahan PO vs Mutasi Stok */}
      <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-start gap-3 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
        <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sky-900 dark:text-sky-200 mb-1">Prinsip Integritas Persediaan: PO Tidak Menambah Saldo Fisik</p>
          <p className="leading-relaxed text-sky-800 dark:text-sky-300">
            Pembuatan dan persetujuan Surat Pesanan (PO) merupakan komitmen administratif.{" "}
            <strong>Saldo fisik barang di gudang BELUM bertambah</strong> sampai barang tiba di Ladang Laweh dan
            petugas mencatat dokumen <strong>Penerimaan Barang</strong>. Status pemesanan,
            penerimaan fisik, dan penagihan dipisahkan tegas secara mandiri.
          </p>
        </div>
      </div>

      {/* Bar Filter Status & Pencarian PO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Status Pesanan:
          </span>
          {[
            { id: "all", label: "Semua PO" },
            { id: "diajukan", label: "Diajukan" },
            { id: "disetujui", label: "Disetujui" },
            { id: "diterima_sebagian", label: "Parsial" },
            { id: "selesai", label: "Selesai" },
            { id: "ditolak", label: "Ditolak" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === st.id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari PO, pemasok, produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Hapus kata kunci pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Total: <strong>{filteredPos.length}</strong> PO
          </span>
        </div>
      </div>

      {/* Daftar Kartu Dokumen PO */}
      {filteredPos.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7 text-slate-400 dark:text-slate-500" />}
          title={searchQuery ? "Surat Pesanan Tidak Ditemukan" : "Tidak Ada Surat Pesanan"}
          description={
            searchQuery
              ? `Tidak ada dokumen PO yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada dokumen Purchase Order yang sesuai dengan kriteria filter saat ini."
          }
          action={
            (searchQuery || selectedStatus !== "all") ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
              >
                Reset Filter & Pencarian
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredPos.map((po) => {
            const isApproved = po.status === "disetujui" || po.status === "diterima_sebagian";
            const isCompleted = po.status === "selesai";
            const isRejected = po.status === "ditolak";

            return (
              <Card key={po.id} className="bg-white border-slate-200 hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Kolom Info PO */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {po.poNumber}
                        </span>
                        <Badge
                          variant={
                            isCompleted
                              ? "success"
                              : isApproved
                              ? "info"
                              : isRejected
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          Status PO: {po.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          Tagihan: {po.paymentStatus.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                        <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{po.supplierName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          Tgl Pesan: {po.orderDate}
                        </span>
                        <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-medium">
                          <Truck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          Estimasi Tiba: {po.expectedDeliveryDate}
                        </span>
                        <span>Dibuat: {po.createdBy}</span>
                        {po.approvedBy && <span className="text-emerald-700 dark:text-emerald-400">Disetujui: {po.approvedBy}</span>}
                      </div>

                      {/* Rincian Item PO */}
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Daftar Komoditas Dipesan:</span>
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                            <div>
                              <strong className="text-slate-800 dark:text-slate-100">{item.productName}</strong> ({item.sku})
                            </div>
                            <div className="flex items-center gap-3">
                              <span>
                                Dipesan: <strong>{item.orderedQty} {item.unit}</strong>
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                Diterima: {item.receivedQty} {item.unit}
                              </span>
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                                {formatRupiah(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {po.rejectionReason && (
                        <p className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/30 p-2 rounded-md">
                          <strong>Alasan Penolakan:</strong> {po.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Kolom Total & Tombol Aksi */}
                    <div className="flex flex-col lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Nilai Pesanan</span>
                        <span className="text-xl font-bold font-mono text-primary">
                          {formatRupiah(po.totalAmount)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Aksi Diajukan -> Setujui / Tolak */}
                        {po.status === "diajukan" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPoForReject(po)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-2.5 text-xs"
                            >
                              Tolak PO
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprovePo(po.id, po.poNumber)}
                              className="h-8 px-3 text-xs gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Setujui PO
                            </Button>
                          </>
                        )}

                        {/* Aksi Disetujui / Parsial -> Terima Barang Fisik */}
                        {isApproved && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenReceiptModal(po)}
                            className="h-8 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Package className="h-3.5 w-3.5" />
                            Terima Barang Fisik
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPoForDetail(po)}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Rincian
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT SURAT PESANAN (PO) BARU                                      */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Surat Pesanan Pembelian (PO)"
        description="Pengajuan pemesanan komoditas sembako ke mitra grosir resmi."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitPo)} className="space-y-4">
          <Select
            label="Mitra Pemasok Grosir"
            {...register("supplierId")}
            options={suppliers.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.suppliedCategory})`,
            }))}
            error={errors.supplierId?.message}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateInput
              label="Tanggal Pesanan"
              {...register("orderDate")}
              error={errors.orderDate?.message}
              required
            />
            <DateInput
              label="Perkiraan Pengiriman Tiba"
              {...register("expectedDeliveryDate")}
              error={errors.expectedDeliveryDate?.message}
              required
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Pilih Komoditas Dagang Sembako:
            </span>

            <Select
              label="Produk Sembako"
              {...register("productId")}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} [${p.sku}] - Acuan: ${formatRupiah(p.estimatedCost)}/${p.baseUnit}`,
              }))}
              error={errors.productId?.message}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Jumlah Dipesan"
                type="number"
                min={1}
                {...register("orderedQty")}
                error={errors.orderedQty?.message}
                required
              />
              <Input
                label="Harga Satuan Disepakati (Rp)"
                type="number"
                {...register("unitPrice")}
                error={errors.unitPrice?.message}
                required
              />
            </div>
          </div>

          <Input
            label="Catatan Pengadaan"
            placeholder="Contoh: Kemasan wajib tersegel rapi dan tidak bocor"
            {...register("notes")}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Kirim Pengajuan PO
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TERIMA BARANG FISIK (GOODS RECEIPT)                                */}
      {/* ========================================================================= */}
      {selectedPoForReceipt && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedPoForReceipt(null)}
          title="Verifikasi Penerimaan Barang Fisik (Goods Receipt)"
          description={`Pemeriksaan fisik komoditas yang tiba dari PO: ${selectedPoForReceipt.poNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Pemberitahuan Gudang</p>
                <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                  Memposting dokumen penerimaan barang ini akan{" "}
                  <strong>langsung menambah kuantitas stok fisik</strong> di gerai sembako. Jika terdapat barang
                  cacat/rusak, barang tersebut akan otomatis dialihkan ke gudang karantina (bukan stok jual).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor Surat Jalan Pemasok"
                placeholder="Contoh: SJ-2026/09/889"
                value={deliveryNoteNumber}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                required
              />
              <DateInput
                label="Tanggal Penerimaan"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Cek Kuantitas Barang Datang:
              </span>
              {selectedPoForReceipt.items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-100">
                    <span>{item.productName}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Total Pesanan: {item.orderedQty} {item.unit} (Telah Diterima: {item.receivedQty})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Input
                      label={`Kuantitas Kondisi Baik (${item.unit})`}
                      type="number"
                      min={0}
                      value={receivedQtyMap[item.productId] ?? 0}
                      onChange={(e) =>
                        setReceivedQtyMap((prev) => ({
                          ...prev,
                          [item.productId]: Number(e.target.value),
                        }))
                      }
                      helperText="Akan masuk ke stok siap jual"
                    />
                    <Input
                      label={`Kuantitas Cacat/Rusak (${item.unit})`}
                      type="number"
                      min={0}
                      value={damagedQtyMap[item.productId] ?? 0}
                      onChange={(e) =>
                        setDamagedQtyMap((prev) => ({
                          ...prev,
                          [item.productId]: Number(e.target.value),
                        }))
                      }
                      helperText="Akan dialihkan ke karantina"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPoForReceipt(null)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmitReceipt}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Posting Penerimaan & Tambah Stok
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOLAK PO (DENGAN ALASAN WAJIB)                                     */}
      {/* ========================================================================= */}
      {selectedPoForReject && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedPoForReject(null)}
          title="Tolak Surat Pesanan (PO)"
          description={`Tolak pengajuan ${selectedPoForReject.poNumber} dari ${selectedPoForReject.supplierName}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Penolakan (Wajib Dicatat)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Harga satuan yang diajukan melebihi pagu anggaran persiapan atau stok pemasok kosong..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPoForReject(null)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleRejectPoSubmit}>
                Konfirmasi Tolak PO
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL PO                                                         */}
      {/* ========================================================================= */}
      {selectedPoForDetail && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedPoForDetail(null)}
          title="Rincian Surat Pesanan (Purchase Order)"
          description={`Nomor Dokumen: ${selectedPoForDetail.poNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Pemasok:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedPoForDetail.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Tanggal Pesan:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedPoForDetail.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Status Pesanan:</span>
                <Badge variant="info">{selectedPoForDetail.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Total Pembelian:</span>
                <span className="font-mono font-bold text-primary">
                  {formatRupiah(selectedPoForDetail.totalAmount)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Catatan Pengadaan:
              </span>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                {selectedPoForDetail.notes || "Tidak ada catatan."}
              </p>
            </div>

            <div className="pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedPoForDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
