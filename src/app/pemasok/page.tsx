"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Search,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  Archive,
  Pencil,
  AlertCircle,
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
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { Supplier } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

export default function PemasokPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Supplier | null>(null);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suppliedCategory, setSuppliedCategory] = useState("Beras & Minyak Goreng");

  const { showToast } = useToast();

  const loadSuppliers = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [data, orders] = await Promise.all([preparationRepository.getSuppliers(), preparationRepository.getPurchaseOrders()]);
      setSuppliers(data);
      setOrderCounts(orders.reduce<Record<string, number>>((counts, order) => {
        counts[order.supplierId] = (counts[order.supplierId] || 0) + 1;
        return counts;
      }, {}));
    } catch (err) {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !name.trim() || !code.trim()) return;
    if (suppliers.some((supplier) => supplier.id !== editingSupplier?.id && supplier.code.toLowerCase() === code.trim().toLowerCase())) {
      showToast("error", "Kode sudah digunakan", "Gunakan kode pemasok yang berbeda.");
      return;
    }
    setIsSaving(true);
    try {
    const values = {
      code: code.trim(),
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      address: address.trim(),
      suppliedCategory: suppliedCategory.trim(),
    };
    if (editingSupplier) {
      const updated = await preparationRepository.updateSupplier(editingSupplier.id, values);
      if (!updated) throw new Error("Pemasok tidak ditemukan");
    } else {
      await preparationRepository.addSupplier(values);
    }

    showToast("success", editingSupplier ? "Pemasok diperbarui" : "Pemasok ditambahkan", `Perubahan "${name}" dicatat pada sesi ini.`);
    setCode("");
    setName("");
    setContactPerson("");
    setPhone("");
    setAddress("");
    setIsAddModalOpen(false);
    await loadSuppliers();
    } catch {
      showToast("error", "Perubahan belum dicatat", "Coba lagi. Isian formulir tetap tersedia.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget || isSaving) return;
    setIsSaving(true);
    try {
      if (!await preparationRepository.archiveSupplier(archiveTarget.id)) throw new Error("Tidak ditemukan");
      showToast("info", "Pemasok diarsipkan", `"${archiveTarget.name}" tidak lagi ditampilkan pada daftar aktif.`);
      setArchiveTarget(null);
      await loadSuppliers();
    } catch {
      showToast("error", "Arsip belum berhasil", "Coba lagi untuk mengarsipkan pemasok.");
    } finally {
      setIsSaving(false);
    }
  };

  const openSupplierForm = (supplier?: Supplier) => {
    setEditingSupplier(supplier ?? null);
    setCode(supplier?.code ?? `SUP-${Date.now().toString().slice(-6)}`);
    setName(supplier?.name ?? "");
    setContactPerson(supplier?.contactPerson ?? "");
    setPhone(supplier?.phone ?? "");
    setAddress(supplier?.address ?? "");
    setSuppliedCategory(supplier?.suppliedCategory ?? "");
    setIsAddModalOpen(true);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.suppliedCategory.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Unit Usaha" },
          { label: "Mitra Pemasok (Distributor)", active: true },
        ]}
        title="Mitra pemasok"
        badgeText="Master Data Rekanan"
        badgeVariant="crimson"
        description="Pendataan calon pemasok sembako grosir untuk pasokan gerai Nagari Ladang Laweh."
        actions={
          <Button
            variant="primary"
            size="default"
            onClick={() => openSupplierForm()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah pemasok
          </Button>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Pemasok (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Distributor Terdata"
          value={suppliers.length.toString()}
          subtitle="Calon rekanan pasokan pangan grosir"
          icon={<Truck className="h-4 w-4 text-sky-600" />}
          trend={{ label: "Grosir Terdata", positive: true }}
          accentColor="sky"
         action={{ label: "Tambah pemasok", onClick: () => { openSupplierForm(); } }}/>
        <CardMetric
          title="Kategori Komoditas"
          value={new Set(suppliers.map((supplier) => supplier.suppliedCategory).filter(Boolean)).size}
          subtitle="Kategori pasokan yang dicatat pada daftar pemasok."
          icon={<ShoppingBag className="h-4 w-4 text-rose-600" />}
          trend={{ label: "Pasokan Gerai", positive: true }}
          accentColor="crimson"
         action={{ label: "Buka katalog barang", href: "/stok" }}/>
        <CardMetric
          title="Status Kemitraan"
          value="Belum dinilai"
          subtitle="Perjanjian dan syarat pembayaran perlu diperiksa."
          icon={<Archive className="h-4 w-4 text-amber-600" />}
          trend={{ label: "Persiapan 2027", positive: true }}
          accentColor="amber"
         action={{ label: "Tinjau dokumen", href: "/tata-kelola" }}/>
      </div>

      {/* Toolbar Pencarian */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              aria-label="Cari pemasok"
              type="text"
              placeholder="Cari nama mitra grosir, kontak person, atau kategori pasokan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid Pemasok */}
      {loadError ? <ErrorState message="Daftar pemasok gagal dimuat." onRetry={loadSuppliers} /> : isLoading ? <LoadingState /> : filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-8 w-8 text-slate-400 dark:text-slate-500" />}
          title="Tidak Ada Pemasok Ditemukan"
          description={searchQuery ? "Coba kata kunci lain atau hapus pencarian." : "Tambahkan pemasok untuk mulai menyiapkan pengadaan barang."}
          action={<Button variant="outline" onClick={() => searchQuery ? setSearchQuery("") : openSupplierForm()}>{searchQuery ? "Hapus pencarian" : "Tambah pemasok"}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredSuppliers.map((sup) => (
            <Card key={sup.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary-container block">
                      {sup.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{sup.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sup.suppliedCategory}</p>
                  </div>
                  <Badge variant="neutral">{orderCounts[sup.id] || 0} pesanan</Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Penanggung jawab: <strong>{sup.contactPerson || "Belum diisi"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="font-mono">{sup.phone || "Telepon belum diisi"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mt-0.5" />
                    <span>{sup.address || "Alamat belum diisi"}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" onClick={() => openSupplierForm(sup)} className="gap-2"><Pencil className="h-4 w-4" />Edit pemasok</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setArchiveTarget(sup)}
                    className="text-xs h-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 gap-1"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Arsipkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah Pemasok */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => { if (!isSaving) setIsAddModalOpen(false); }}
        title={editingSupplier ? "Edit pemasok" : "Tambah pemasok"}
        description="Pencatatan data kontak grosir bahan pokok."
        maxWidth="md"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <Input
            label="Kode Pemasok"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="Nama Toko / Distributor Grosir"
            placeholder="Contoh: Kilang Padi Harapan Banuhampu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Kontak Person (PIC)"
              placeholder="Contoh: Pak Haji Rusdi"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />

            <Input
              label="Nomor Telepon / WA"
              placeholder="0812xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Alamat Gudang / Lokasi Usaha"
            placeholder="Contoh: Jl. Raya Padang Luar - Bukittinggi"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Komoditas yang Dipasok"
            placeholder="Contoh: Beras Solok, Telur Ayam Ras"
            value={suppliedCategory}
            onChange={(e) => setSuppliedCategory(e.target.value)}
          />

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
              {isSaving ? "Menyimpan..." : "Simpan Data Pemasok"}
            </Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog isOpen={!!archiveTarget} onClose={() => { if (!isSaving) setArchiveTarget(null); }} onConfirm={handleArchive} title="Arsipkan pemasok?" message={`Pemasok "${archiveTarget?.name ?? ""}" akan disembunyikan dari daftar aktif. Catatan pesanan pada sesi ini tetap tersedia.`} confirmText="Arsipkan" isLoading={isSaving} />
    </div>
  );
}
