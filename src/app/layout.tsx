import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "Kopdes Merah Putih — Ladang Laweh",
  description:
    "Sistem Tata Kelola dan Dashboard Operasional Koperasi Desa Ladang Laweh. Mode Persiapan menuju target operasional awal 2027.",
  keywords: ["Koperasi Desa", "Ladang Laweh", "Kopdes Merah Putih", "Sumatera Barat"],
  authors: [{ name: "Abdul Halim - Manajer Persiapan" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#1D2533" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('kopdes_theme');
                if (theme === 'dark' || ((theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="h-full bg-background dark:bg-slate-950 text-on-surface dark:text-slate-100 antialiased selection:bg-rose-100 dark:selection:bg-rose-950/60 selection:text-rose-900 dark:selection:text-rose-200">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

