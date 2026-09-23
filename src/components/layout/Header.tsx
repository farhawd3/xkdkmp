"use client";

import { ButtonLink } from "@/components/ui/Button";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
  BookOpen,
  Sun,
  Moon,
  Shield,
} from "lucide-react";
import { PRODUCTION_READY_ROUTES, SEARCH_MODULES } from "@/lib/navigation";
import { formatTanggal } from "@/lib/utils";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/ThemeContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface HeaderProps {
  onMenuToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  time: string;
  type: "warning" | "info" | "success";
}

const PREPARATION_NOTIFICATIONS: NotificationItem[] = [];

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const user = useCurrentUser();

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDateStr(formatTanggal(new Date()));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsNotifOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Menutup popover notifikasi saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const filteredModules = SEARCH_MODULES.filter(
    (m) =>
      (!isSupabaseConfigured() || PRODUCTION_READY_ROUTES.has(m.href)) &&
      (m.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-[70px] w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors">
      <div className="flex h-full w-full items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Kiri: Toggle Menu (Mobile & Tablet) + Status Tanggal */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Buka navigasi menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block shrink-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Zona Waktu Asia/Jakarta</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentDateStr || "Memuat tanggal..."}</p>
          </div>
        </div>

        {/* Tengah: Quick Search Finder */}
        <div className="hidden lg:flex items-center relative max-w-xs w-full">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <button
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(true);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 pl-9 pr-3 text-left text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between shadow-sm"
          >
            <span>Cari menu...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Kanan: Toggle Mode Gelap, Bantuan, Notifikasi, Status Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button aria-label="Cari menu" onClick={() => { setSearchQuery(""); setIsSearchOpen(true); }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 lg:hidden"><Search className="h-5 w-5" /></button>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-amber-300 transition-colors shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          <button
            aria-label="Pusat Bantuan & Panduan"
            title="Buka Panduan Operasional"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={() => setIsHelpOpen(true)}
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Popover Notifikasi Nyata */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notifikasi Persiapan"
              aria-expanded={isNotifOpen}
              title="Notifikasi Tugas Persiapan"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell className="h-5 w-5" />
              {PREPARATION_NOTIFICATIONS.length > 0 && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary-container" />}
            </button>

            {isNotifOpen && (
              <div className="fixed left-4 right-4 mt-2 sm:absolute sm:left-auto sm:right-0 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary dark:text-rose-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Pemberitahuan Persiapan
                    </h4>
                  </div>
                  <Badge variant="crimson" size="sm">
                    {PREPARATION_NOTIFICATIONS.length} Baru
                  </Badge>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto">
                  {PREPARATION_NOTIFICATIONS.length === 0 && <p className="py-6 text-center text-sm text-slate-600 dark:text-slate-300">Belum ada pemberitahuan. Notifikasi otomatis tersedia setelah integrasi database.</p>}
                  {PREPARATION_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 p-3 text-xs space-y-1 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-slate-900 dark:text-slate-100 leading-snug">{n.title}</strong>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">{n.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{n.description}</p>
                      <div className="pt-1.5 flex justify-end">
                        <Link
                          href={n.sourceUrl}
                          onClick={() => setIsNotifOpen(false)}
                          className="text-xs font-bold text-primary dark:text-rose-400 hover:underline flex items-center gap-1"
                        >
                          {n.sourceLabel} <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Indikator Status Mode — menggantikan profil mini (yang sudah ada di Sidebar) */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Sesi Aktif</span>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Pusat Bantuan Operasional */}
      <Dialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Panduan Operasional Persiapan Koperasi"
        description="Petunjuk teknis sistem bagi pengelola dan pengurus menuju target Awal 2027."
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <ButtonLink href="/bantuan" onClick={() => setIsHelpOpen(false)} variant="outline" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4 text-primary-container dark:text-rose-400" />
                Buka Panduan Lengkap
              </ButtonLink>
            <Button variant="primary" size="sm" onClick={() => setIsHelpOpen(false)}>
              Tutup
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5">
            <h5 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Status Sistem Saat Ini: Mode Persiapan
            </h5>
            <p className="mt-1 text-emerald-800 dark:text-emerald-300/90">
              {isSupabaseConfigured()
                ? "Login dan pembacaan data Supabase sudah tersedia pada modul yang terhubung. Transaksi operasional masih ditahan sampai izin dan validasi server selesai diuji."
                : "Supabase belum dikonfigurasi. Data yang Anda isi di mode persiapan hanya tersimpan selama sesi aplikasi ini dan dapat hilang saat halaman dimuat ulang."}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
              Alur Kerja Utama di Lapangan:
            </h5>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Verifikasi Anggota</strong>: Pastikan dokumen calon anggota terinput valid tanpa menampilkan NIK secara terbuka di layar publik.
              </li>
              <li>
                <strong>Siklus PO Sembako</strong>: Pembuatan pesanan ke grosir (PO) tidak otomatis menambah stok fisik sebelum barang diperiksa di gudang kios.
              </li>
              <li>
                <strong>Disiplin Kasir</strong>: Kasir wajib melakukan hitung fisik murni (*blind count*) saat tutup shift tanpa melihat saldo kalkulasi sistem.
              </li>
              <li>
                <strong>Integritas Jurnal</strong>: Seluruh transaksi berstatus posted bersifat permanen; perbaikan wajib menggunakan Jurnal Pembalikan (*reversal entry*).
              </li>
            </ul>
          </div>
        </div>
      </Dialog>

      {/* Modal 2: Quick Search Finder */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Navigasi Cepat Modul Koperasi"
        description="Cari nama menu untuk membuka halaman yang Anda perlukan."
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              aria-label="Cari menu"
              data-autofocus
              placeholder="Ketik kata kunci (misal: Kas, PO, Anggota, Laporan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredModules.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Tidak ada modul yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredModules.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-slate-100 block">{m.title}</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                </Link>
              ))
            )}
          </div>
        </div>
      </Dialog>
    </header>
  );
};
