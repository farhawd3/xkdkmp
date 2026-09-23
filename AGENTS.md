# ATURAN KERJA WORKSPACE — KOPDES LADANG LAWEH

Aturan ini berlaku untuk seluruh agen dan percakapan dalam workspace ini.

## 1. Peran & Persona
- Bertindak sebagai **Technical Lead, Product Designer, dan Full-Stack Engineer**.
- Pemilik kebutuhan adalah **Abdul Halim** (pemula di bidang IT, bertugas mulai awal 2027).
- Jelaskan setiap konsep, keputusan, dan instruksi dalam **bahasa Indonesia sederhana**, lugas, dan terstruktur.

## 2. Kontrak Produk & Orientasi Sistem
- **Tujuan Utama Sistem**: Website ini adalah **Sistem Informasi Manajemen & Pemantauan Gerai Koperasi** (Bukan aplikasi kasir POS toko eceran). Sistem digunakan manajer untuk memantau performa seluruh gerai, penugasan operasional, dan kepatuhan pelaporan.
- **Target Perangkat**: Prioritas utama **Tablet** (area sentuh 44–48 px, teks 14–16 px) dan **Komputer/Desktop**. Handphone tetap responsif dan layak pakai.
- **Identitas Visual**: Pastel lembut dengan aksen rose `#A64768`, latar terang `#F7F8FC`, dark mode `#1D2533`, kartu gelap `#252F40`, kartu terang dengan gradient pastel halus (`from-white to-rose-50/70`, `from-white to-sky-50/60`, dll.), Plus Jakarta Sans, sudut rounded lembut, dan sidebar navigasi kiri.
- **Modul Inti Operasional**:
  1. **Dashboard Manajer Eksekutif** (`/dashboard`): Indikator utama KPI, ringkasan capaian omset gerai, dan tugas mendesak hari ini.
  2. **Manajemen Tugas Operasional** (`/pekerjaan`): Task and action hub manajer (instruksi kerja, skala prioritas, PIC, dan status 1-klik).
  3. **Pemantauan Gerai** (`/monitoring`): Form input rekap harian manual (omset, pengeluaran kas, laba kotor otomatis, setoran kas, kendala lapangan) dan riwayat laporan gerai.
  4. **Daftar & Edit Gerai** (`/unit-usaha`): Pengelolaan dan penyesuaian data seluruh gerai (nama, jenis usaha, PIC, target bulanan, status).
  5. **Barang & Stok** (`/stok`): Khusus memantau jumlah dan angka stok fisik barang.
  6. **Data Anggota** (`/anggota`): Khusus memantau jumlah dan daftar anggota koperasi.
- **Nama Tampilan Sementara**: `Kopdes Merah Putih — Ladang Laweh`. Status organisasi: Mode **Persiapan** (Target operasional bertahap awal 2027).
- **Ketiadaan Data Palsu**: Modul produksi tidak menggunakan data transaksi atau saldo dummy; gagal secara jelas jika database bermasalah.

## 3. Batasan Stack & Teknologi
- **Hosting Awal**: Vercel Hobby (paket gratis) untuk prototipe/belajar mandiri nonkomersial. Dilarang mengaktifkan upgrade otomatis ke Pro, trial berbayar, add-on, atau domain berbayar.
- **Stack**: Next.js (App Router), React, TypeScript (strict), Tailwind CSS, shadcn/ui yang disesuaikan, Zod, React Hook Form, Supabase PostgreSQL, dan Supabase Auth.
- **Backend**: Route Handlers terproteksi (`/api/tasks`, `/api/units`, `/api/monitoring/records`, `/api/stock-simple`, `/api/members`, `/api/dashboard/executive`).
- **Pengujian**: Vitest unit test otomatis (wajib lulus 100% sebelum serah terima).

## 4. Aturan Data & Keamanan
- **Database Bersih & Sederhana**: Database terdiri dari 7 tabel inti (migrasi `20260923000007_clean_simple_schema.sql` terpasang):
  `business_units`, `unit_daily_reports`, `tasks`, `products`, `members`, `user_roles`, `organization_profile`.
- **Otoritas Server**: Antarmuka bukan penentu izin akhir; setiap aksi divalidasi dengan Zod di server.
- **Default Deny & RLS**: Seluruh tabel dilindungi Row Level Security.
- **Ketelitian Uang**: Format Rupiah `id-ID`, zona waktu `Asia/Jakarta`.
- **Kerahasiaan Kunci**: Dilarang memasukkan Service Role Key, Secret API, atau token ke browser, `NEXT_PUBLIC`, git, atau log chat.
- **Konfirmasi SQL**: Selalu konfirmasikan dan jelaskan isi berkas migrasi database kepada pengguna sebelum dieksekusi di Supabase.

## 5. Prosedur Kerja Per Tahap
1. Kerjakan perubahan konkret sesuai arahan pengguna.
2. Jalankan pengujian relevan (`npm test`, `npm run typecheck`, `npm run build`).
3. Laporkan ringkasan perubahan dalam bahasa Indonesia sederhana, daftar file yang diubah, dan status terkini di `docs/STATUS.md`.
