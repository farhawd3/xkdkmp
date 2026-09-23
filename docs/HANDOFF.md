# Serah Terima Utama Lintas Tahap — Kopdes Merah Putih Ladang Laweh

> **Status Terbaru (23 September 2026):**
> Sistem telah ditransformasikan menjadi **Sistem Informasi Manajemen & Pemantauan Gerai Koperasi**. Database 7 tabel inti (`20260923000007_clean_simple_schema.sql`) telah sukses dieksekusi di Supabase Cloud. Fondasi visual v2.2 kini menyatukan input, dropdown, tanggal, textarea, dialog responsif, kalender, dan pilihan tema per perangkat. Lihat `docs/STATUS.md` untuk hasil pengujian paling baru.

**Pemilik Kebutuhan**: Abdul Halim (pemula di bidang IT, bertugas mulai awal 2027)  
**Tujuan Utama Sistem**: Memantau operasional seluruh gerai koperasi, mengelola penugasan instruksi kerja tim, memantau angka ketersediaan stok barang pokok, dan mengelola keanggotaan warga nagari.

---

## 1. Arsitektur Modul Aplikasi

### A. Menu Utama
- **Dashboard Manajer** (`/dashboard`):
  - 4 Kartu Metrik Pastel: Unit Usaha, Omset Bulan Ini, Tugas Operasional, Data Anggota.
  - Panel Kinerja Gerai (Laporan hari ini, pengeluaran, estimasi laba kotor).
  - Panel Fokus Tugas Manajer dan aksi cepat navigasi.
  - Membaca data eksekutif dari `/api/dashboard/executive`.
- **Manajemen Tugas & Agenda** (`/pekerjaan`):
  - Tab 1: Daftar Tugas — filter gerai, status, prioritas, aksi 1-klik.
  - Tab 2: Kalender Agenda — grid bulanan, navigasi bulan, indikator tugas per tanggal.
  - Kartu ber-gradient warna pastel (`rose`, `sky`, `amber`, `emerald`).
  - Terhubung ke `/api/tasks` (CRUD lengkap).

### B. Operasional Gerai
- **Pemantauan Gerai** (`/monitoring`):
  - Tab 1: Form input rekap harian manual (omset, pengeluaran kas, laba kotor otomatis, uang setoran, kendala).
  - Tab 2: Riwayat rekapitulasi seluruh gerai.
  - Terhubung ke `/api/monitoring/records` (GET & POST).
- **Daftar & Edit Gerai** (`/unit-usaha`):
  - Kartu gerai, edit form, tambah gerai baru.
  - Terhubung ke `/api/units` (GET, POST, PATCH).
- **Barang & Stok** (`/stok`):
  - Memantau jumlah dan angka ketersediaan fisik stok barang.
  - Terhubung ke `/api/stock-simple`.

### C. Keuangan & Laporan
- **Kas & Buku Besar** (`/keuangan`):
  - Tab: Buku Besar Kas, Mutasi Kas Setoran Gerai, Simpanan Anggota.
  - Terhubung ke `/api/finance/summary`.
- **Neraca & SHU** (`/laporan`):
  - Tab: Posisi Keuangan (Neraca), Laba Rugi, Alokasi Pembagian SHU.
  - Alokasi SHU: Cadangan 40%, Jasa Usaha 25%, Jasa Modal 20%, Pengurus 5%, Pendidikan 5%, Sosial 5%.

### D. Kelembagaan & Sistem
- **Data Anggota** (`/anggota`): Daftar, jumlah total, status keanggotaan, kontak. Terhubung ke `/api/members`.
- **Kesiapan Buka** (`/persiapan`): Instrumen checklist kesiapan operasional pra-buka.
- **Tata Kelola & RAT** (`/tata-kelola`): Informasi tata kelola koperasi dan RAT.
- **Pengaturan** (`/pengaturan`): Konfigurasi sistem dan slot integrasi API kasir kelak.
- **Panduan Sistem** (`/bantuan`): Bantuan dan SOP tata kelola manajer.

---

## 2. Struktur Database Supabase (7 Tabel Inti)

Migrasi `supabase/migrations/20260923000007_clean_simple_schema.sql` telah dieksekusi di Supabase Cloud:
1. `business_units`: Profil unit usaha/gerai (nama, jenis, PIC, telepon, lokasi, target bulanan, status).
2. `unit_daily_reports`: Rekapitulasi laporan pemantauan harian gerai (omset, pengeluaran, laba kotor, kas setoran, kendala).
3. `tasks`: Manajemen tugas dan instruksi kerja tim manajer.
4. `products`: Katalog barang dan angka ketersediaan stok fisik.
5. `members`: Data anggota koperasi warga nagari.
6. `user_roles`: Hak akses peran akun pengguna (admin, manajer, pengurus, operator).
7. `organization_profile`: Profil kelembagaan koperasi.

---

## 3. API Route Handlers Aktif

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/dashboard/executive` | GET | Ringkasan KPI eksekutif manajer |
| `/api/tasks` | GET, POST, PATCH, DELETE | CRUD tugas operasional |
| `/api/units` | GET, POST, PATCH | CRUD unit usaha/gerai |
| `/api/monitoring/records` | GET, POST | Rekap harian gerai |
| `/api/stock-simple` | GET, PATCH | Stok barang sederhana |
| `/api/members` | GET, POST, PATCH | Data anggota koperasi |
| `/api/finance/summary` | GET | Kalkulasi keuangan (neraca, SHU, buku besar) |

---

## 4. Rangkuman Pengujian & Verifikasi

```sh
npm.cmd test -- --maxWorkers=1  # Unit test Vitest lulus 100%
npm.cmd run typecheck           # 0 galat TypeScript
npm.cmd run build               # Rute terkompilasi optimal
```

---

## 5. Identitas Visual & Desain

- **Warna Aksen**: Rose `#A64768`
- **Latar Terang**: `#F7F8FC` | **Dark Mode**: `#1D2533`
- **Kartu Terang**: Gradient pastel halus (`from-white to-rose-50/70`, `to-sky-50/60`, `to-emerald-50/80`)
- **Kartu Gelap**: `#252F40`
- **Font**: Plus Jakarta Sans
- **Navigasi**: Sidebar kiri responsif
- **Target**: Tablet (sentuh 44–48px, teks 14–16px) dan Desktop

---

## 6. Aturan Keamanan & Data

- **RLS**: Seluruh tabel dilindungi Row Level Security
- **Validasi Server**: Semua mutasi divalidasi Zod di Route Handlers
- **Format Uang**: Rupiah `id-ID`, zona waktu `Asia/Jakarta`
- **Hosting**: Vercel Hobby (gratis, nonkomersial)
- **DILARANG**: Service Role Key, Secret API, atau token di browser/NEXT_PUBLIC/git

---

## 7. Rencana Pembangunan Terperinci (Pegangan AI/Pengembang Berikutnya)

Urutan ini wajib dipertahankan agar proyek tidak kembali melebar menjadi aplikasi kasir dan tidak membuat data contoh terlihat seperti data nyata.

### Tahap A — Audit sebelum perubahan

1. Baca `AGENTS.md`, `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, dan `docs/DESIGN_SYSTEM.md`.
2. Jalankan `git status --short --branch` dan `git diff --stat`. Workspace saat ini mengandung perubahan tahap sebelumnya; jangan melakukan reset atau menimpa perubahan yang tidak terkait.
3. Periksa rute yang hendak diubah, endpoint servernya, skema Zod, dan tabel Supabase yang dipakai.
4. Bedakan pemeriksaan sumber kode, pengujian otomatis, dan pemeriksaan visual. Jangan mengaku semua halaman telah diperiksa visual jika sesi login belum tersedia.

### Tahap B — Fondasi tampilan bersama

1. Gunakan token di `globals.css` dan `tailwind.config.ts`; hindari warna hex baru per halaman kecuali benar-benar diperlukan.
2. Gunakan komponen bersama di `src/components/ui/`. Kontrol formulir baku: `Input`, `Select`, `DateInput`, `Textarea`; aksi: `Button`; popup: `Dialog` atau `Drawer`.
3. Pertahankan area sentuh 44–48 px, teks isi 14–16 px, fokus keyboard jelas, dark mode, dan `prefers-reduced-motion`.
4. Setiap halaman wajib mempunyai keadaan memuat, gagal, kosong, berhasil, dan penolakan izin yang dapat dipahami pengguna awam.

### Tahap C — Alur kerja utama manajer

Urutan harian yang disarankan:

1. **Dashboard**: manajer melihat gerai belum melapor, omset bulan berjalan, stok perlu perhatian, dan tugas mendesak.
2. **Pemantauan Gerai**: operator/manajer mencatat rekap harian tiap gerai; laba kotor dihitung server dari omset dikurangi pengeluaran yang didefinisikan sistem.
3. **Tugas & Agenda**: kendala dari laporan diubah menjadi tugas dengan PIC, prioritas, dan tenggat; kalender menjadi pandangan waktu dari tugas yang sama, bukan tabel agenda terpisah.
4. **Barang & Stok**: stok fisik disesuaikan berdasarkan hasil hitung lapangan dan dicatat dengan keterangan.
5. **Anggota**: data identitas minimum dikelola tanpa membuka data pribadi berlebihan.
6. **Keuangan/Laporan**: angka hanya ditampilkan bila sumber datanya nyata dan dapat ditelusuri. Tidak boleh ada saldo atau transaksi contoh pada mode produksi.

### Tahap D — Kustomisasi koperasi

- Sudah tersedia: tema Terang/Gelap/Ikuti perangkat pada `/pengaturan`; preferensi disimpan lokal pada perangkat.
- Profil koperasi yang perlu dapat disesuaikan: nama tampilan, nama badan hukum, wilayah, alamat, tahun buku, status dokumen, dan rekening resmi.
- **Batas aktif:** halaman profil organisasi masih memakai repository persiapan lama. Jangan mengklaim perubahan profil tersimpan permanen ke Supabase sampai endpoint server khusus `organization_profile` selesai.
- Sebelum membuat endpoint tersebut, audit kolom nyata tabel `organization_profile` di Supabase. Jika membutuhkan migrasi baru, jelaskan SQL kepada Bapak Abdul Halim dan minta konfirmasi sebelum menjalankannya.

### Tahap E — Efisiensi dan kerapian kode

1. Hindari menyalin kelas Tailwind formulir di setiap halaman. Tarik pola berulang ke komponen UI bersama.
2. Pisahkan pengambilan data, validasi, dan tampilan. Semua mutasi tetap melalui Route Handler dan Zod server.
3. Jangan menambah pustaka besar untuk fungsi yang bisa dibuat sederhana dengan React/Tailwind.
4. Pecah halaman yang melebihi kira-kira 500–700 baris menjadi komponen berfokus, tetapi lakukan bertahap dan sertai tes agar perilaku tidak berubah diam-diam.
5. Hapus kode lama hanya jika rute pengganti sudah pasti dan referensi/test terkait sudah dibersihkan.

### Tahap F — Verifikasi wajib sebelum serah terima

```powershell
npm.cmd test -- --maxWorkers=1
npm.cmd run typecheck
npm.cmd run build
```

Pemeriksaan manual minimum:

- desktop 1280 px, tablet 768 px, ponsel sekitar 390 px;
- tema terang dan gelap;
- navigasi sidebar/drawer, pencarian menu, dialog panjang, dropdown, input tanggal;
- kalender: pindah bulan, pilih tanggal, tambah/edit agenda;
- kondisi database kosong, galat, sesi habis, serta akses ditolak;
- tidak ada tombol buntu, link mati, angka fiktif, atau label yang menjanjikan penyimpanan padahal belum permanen.

---

## 8. Prioritas Lanjutan yang Belum Selesai

1. **P0 — Kejujuran data keuangan:** `/api/finance/summary` masih perlu diaudit karena terdapat konstanta keuangan di kode. Sebelum dipakai operasional, semua angka harus berasal dari data sah atau tampil sebagai “belum tersedia”.
2. **P0 — Profil organisasi permanen:** buat GET/PATCH terproteksi untuk `organization_profile` setelah skema cloud dipastikan.
3. **P1 — Audit visual internal:** periksa seluruh modul setelah tersedia sesi akun uji yang aman; audit saat ini hanya dapat memeriksa layar login secara langsung.
4. **P1 — Pecah halaman besar:** prioritaskan `/pekerjaan`, `/anggota`, dan modul warisan yang masih sangat panjang.
5. **P1 — E2E:** Playwright belum dikonfigurasi. Tambahkan skenario login, input rekap, pembuatan tugas, perubahan stok, dan akses berbasis peran.
6. **P2 — Fitur manajer yang disarankan:** pusat notifikasi berbasis data, ringkasan mingguan yang dapat dicetak, penanda laporan terlambat, serta ekspor CSV terkontrol. Jangan menambah fitur sebelum sumber data dan perannya jelas.

---

## 9. Catatan Pemeriksaan Visual v2.2

- Server audit pada `http://localhost:3001` berhasil merespons dan dihentikan setelah pemeriksaan; proses lama pada port 3000 sempat mengembalikan 500 dan sebaiknya dihentikan/dijalankan ulang oleh pengguna bila masih aktif.
- Layar login diperiksa langsung pada desktop dan viewport tablet 768×1024 dalam dark mode: susunan stabil, teks terbaca, dan target sentuh memadai.
- Halaman internal mengarahkan ke login. Pemeriksaan visual internal belum dilakukan karena penggunaan kredensial tersimpan tidak diotorisasi dalam sesi audit ini.
- Pemeriksaan sumber kode dan tes otomatis tetap dilakukan untuk komponen serta halaman yang diubah.
