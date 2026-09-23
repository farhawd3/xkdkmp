# Kopdes Merah Putih — Ladang Laweh

Sistem Informasi Manajemen & Pemantauan Gerai Koperasi berbahasa Indonesia, dioptimalkan untuk perangkat **Tablet** dan **Komputer/Desktop**. Status organisasi: Mode **Persiapan** menuju operasional bertahap awal 2027.

---

## Fokus Utama Sistem
Website ini adalah **Pusat Komando & Pemantauan Manajer Koperasi** (Bukan aplikasi kasir POS toko fisik). Manajer menggunakannya untuk memantau performa harian seluruh unit gerai, mengelola penugasan tim, memantau angka ketersediaan stok komoditas, dan mengelola keanggotaan warga nagari.

---

## Modul Utama

1. **Dashboard Manajer Eksekutif** (`/dashboard`): Indikator utama KPI, ringkasan capaian omset gerai, dan pantauan tugas mendesak hari ini.
2. **Manajemen Tugas Operasional** (`/pekerjaan`): Pusat komando instruksi kerja dengan kartu ber-gradient warna pastel, penanda skala prioritas (Mendesak, Tinggi, Sedang, Rendah), PIC, dan aksi status 1-klik.
3. **Pemantauan Gerai** (`/monitoring`): Form input rekap harian manual (omset penjualan kotor, pengeluaran kas operasional, kalkulasi otomatis laba kotor, uang setoran kas fisik, dan catatan kendala lapangan) serta tab riwayat laporan.
4. **Daftar & Edit Gerai** (`/unit-usaha`): Menampilkan semua unit usaha dengan kartu pastel, dilengkapi tombol *Edit & Sesuaikan Gerai* (nama, jenis, PIC, kontak WA, target omset bulanan, lokasi, dan status) serta tombol *Tambah Gerai Baru*.
5. **Barang & Stok** (`/stok`): Khusus memantau jumlah dan angka stok komoditas sembako, batas minimum, serta tombol cepat *Sesuaikan Angka Stok*.
6. **Data Anggota** (`/anggota`): Khusus memantau data dan jumlah anggota (total anggota, anggota aktif, calon anggota).
7. **Kesiapan Buka** (`/persiapan`), **Pengaturan** (`/pengaturan`), dan **Panduan Sistem** (`/bantuan`).

---

## Database Supabase (Sederhana & Bersih)

Database telah disederhanakan melalui migrasi [20260923000007_clean_simple_schema.sql](supabase/migrations/20260923000007_clean_simple_schema.sql) dan hanya terdiri dari **7 tabel inti**:
- `business_units`: Data profil unit usaha/gerai koperasi.
- `unit_daily_reports`: Rekapitulasi laporan pemantauan harian gerai.
- `tasks`: Manajemen tugas dan instruksi kerja operasional.
- `products`: Katalog barang dan angka ketersediaan stok fisik.
- `members`: Data anggota koperasi.
- `user_roles`: Hak akses peran akun pengguna.
- `organization_profile`: Profil kelembagaan koperasi.

---

## Cara Menjalankan Lokal

```sh
# Instalasi dependensi
npm ci

# Jalankan server pengembangan
npm.cmd run dev
```

Buka `http://localhost:3000` di peramban web (browser/tablet).

---

## Pemeriksaan Kualitas & Pengujian

```sh
# Menjalankan 99 unit test otomatis
npm.cmd test -- --maxWorkers=1

# Pemeriksaan kesesuaian tipe data TypeScript
npm.cmd run typecheck

# Pengujian kompilasi build produksi Next.js
npm.cmd run build
```

**Status Kualitas Terkini:**
- Unit Test Vitest: **99/99 Lulus 100%** (11 berkas uji).
- Typecheck: **Lulus (0 galat)**.
- Build Produksi: **Lulus sukses (38 rute terkompilasi optimal)**.
