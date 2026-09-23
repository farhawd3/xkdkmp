"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { DemoBanner } from "./DemoBanner";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Drawer } from "@/components/ui/Drawer";
import { ToastProvider } from "@/components/ui/Toast";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Halaman autentikasi ditampilkan mandiri tanpa shell (sidebar/header/banner)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/lupa-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthPage) {
    return (
      <ToastProvider>
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,228,230,0.55),_transparent_34%),#F7F8FC] font-sans text-on-surface antialiased dark:bg-[radial-gradient(circle_at_top_left,_rgba(166,71,104,0.12),_transparent_32%),#1D2533] dark:text-slate-100">
          <div className="flex-1 overflow-y-auto">
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-white focus:p-3 focus:text-slate-900"
      >
        Lewati ke konten utama
      </a>
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,228,230,0.55),_transparent_34%),#F7F8FC] font-sans text-on-surface antialiased dark:bg-[radial-gradient(circle_at_top_left,_rgba(166,71,104,0.12),_transparent_32%),#1D2533] dark:text-slate-100">
        {/* Banner Mode Persiapan */}
        <div className="shrink-0 z-40">
          <DemoBanner />
        </div>

        {/* Kontainer Utama Dua Kolom: Sidebar Sticky Kiri + Kolom Kanan */}
        <div className="flex flex-1 overflow-hidden min-h-0 relative">
          {/* Sidebar Desktop (>=1024px) */}
          <aside className="hidden lg:flex flex-col h-full w-64 xl:w-72 shrink-0 z-20">
            <Sidebar />
          </aside>

          {/* Drawer Sidebar untuk Layar Mobile & Tablet Potret (<1024px) */}
          <Drawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            hideHeader
            noPadding
          >
            <Sidebar
              onItemClick={() => setIsMobileMenuOpen(false)}
              onClose={() => setIsMobileMenuOpen(false)}
              className="w-full border-r-0 h-full"
            />
          </Drawer>

          {/* Kolom Kanan: Header + Area Konten Scrollable */}
          <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
            {/* Header di LUAR div scroll */}
            <div className="shrink-0">
              <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
            </div>
            {/* Area Konten yang Bisa Digulir */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-gutter-stable"
              style={{ scrollbarGutter: "stable" }}
            >
              <main id="main-content" tabIndex={-1} className="pt-6 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};
