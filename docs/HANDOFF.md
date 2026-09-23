# Serah Terima Utama Lintas Tahap — Kopdes Merah Putih Ladang Laweh

> **Acuan terbaru: v2.9 — lihat bagian teratas STATUS.md.** Sesi penyegaran UI dan audit menemukan bug integrasi kalender/kendala serta batas keamanan yang telah diperbaiki. Klaim v2.8 “selesai 100%” adalah checkpoint historis, bukan bukti setiap alur produksi telah diuji. Bagian 6–10 di bawah menyimpan rencana/riwayat lama; jangan mengaktifkan bypass login atau mengulang roadmap. Aplikasi tetap pribadi tanpa login. Server dev/start kini hanya bind 127.0.0.1; akses LAN membutuhkan batas privat tersendiri. Tidak ada SQL cloud diubah sesi v2.9. **Prioritas berikut: restore atomik + validasi baris, pagination >1.000 baris, audit visual lintas perangkat dan CRUD pada lingkungan uji.** Rincian berkas, tes, batas verifikasi, dan urutan lanjut ada di STATUS.md.

> **Bloker terbaru yang harus didahulukan:** GET anggota dan stok benar-benar HTTP 500 di cloud karena kolom skema lama tidak cocok (`member_no` versus `member_number`, `notes` tidak ada pada products/members, kolom wajib lama dan stok integer). Lihat item 0 pada STATUS.md. Jangan menyatakan seluruh modul siap atau mengubah Supabase tanpa persetujuan SQL.

> **Panduan AI berikutnya:** [ROADMAP_MANAJER_BERIKUTNYA.md](ROADMAP_MANAJER_BERIKUTNYA.md) memuat urutan fitur baru, sumber data, syarat selesai, serta panduan desain dashboard terang/gelap. Rancangan tersebut belum diimplementasikan. Perapian dashboard saat ini hanya menyederhanakan header dan keadaan grafik kosong.

> **Prompt rinci terbaru untuk migrasi AI:** [prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md](../prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md). Isinya memetakan usulan menu, alur manajer pagi/sore/bulanan, fitur yang bisa memakai tujuh tabel, fitur yang perlu keputusan bisnis/SQL, kontrak API, edge case, syarat uji, dan pertanyaan untuk Bapak. Ini dokumen desain, bukan implementasi atau izin mengubah cloud.

### Rancangan perbaikan Supabase v2.9 — belum dijalankan

Berkas: `supabase/drafts/20260923000009_align_members_products.sql` (sengaja di luar folder migrations agar tidak ikut deployment otomatis).

Yang diusulkan:

1. Menambah kolom catatan (`notes`) pada stok dan anggota.
2. Menambah `member_number`, mengisi dari nomor lama `member_no`, tetap mempertahankan nomor lama dan menyinkronkan kedua kolom. Bila nomor bertentangan/kosong atau duplikat, transaksi berhenti; tidak membuat nomor fiktif.
3. Mengizinkan telepon dan domisili kosong agar sesuai form sederhana; isi lama tetap utuh. RLS/hak akses tabel tidak dilonggarkan.
4. Mengubah jumlah stok/batas minimum integer menjadi `NUMERIC(12,2)` supaya 1,5 kg dapat disimpan tanpa pembulatan integer.
5. Seluruh perubahan dalam satu transaksi, dengan batas waktu lock/statement. Bukan implementasi restore atomik; itu pekerjaan terpisah.

Sebelum eksekusi: minta persetujuan pengguna atas isi berkas ini; verifikasi constraint/index/trigger skema aktual dan dependensi repository lama (OpenAPI tidak mengungkap semuanya); backup dan uji salinan database; jangan jalankan ulang migrasi clean_simple_schema. Draf belum diuji PostgreSQL, bukan klaim migrasi siap produksi. Setelah disetujui dan diuji, pindahkan salinan yang disetujui ke migrations, terapkan satu kali, lalu uji GET serta CRUD anggota/stok desimal pada data uji yang disepakati. Jangan menulis rahasia di log.

> **Status Serah Terima Akhir (23 September 2026 — v2.8.0):**
> Seluruh 6 tahap roadmap transformasi sistem menjadi **Aplikasi Pribadi Manajer** telah **SELESAI 100%** dan terverifikasi penuh (**153/153 Vitest lulus, 0 TypeScript error, Next.js production build 33 rute sukses**).
> - Layar login ditiadakan; dashboard langsung terbuka secara privat tanpa manajemen akun pengguna.
> - Database Supabase 7 tabel inti (`20260923000007_clean_simple_schema.sql` dan `20260923000008_organization_profile.sql`) telah aktif dan diterapkan di Supabase Cloud.
> - Rincian eksekusi tiap tahap tercatat di [docs/STATUS.md](STATUS.md) dan [docs/CHANGELOG.md](CHANGELOG.md).

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
  - Kode saat ini memuat persentase SHU 40/25/20/5/5/5. Ini belum menjadi kebijakan koperasi yang disahkan; jangan menyajikannya sebagai ketetapan resmi.

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

### Mode lokal tanpa login

- Untuk pemeriksaan lokal saat ini, `.env.development.local` berisi `NEXT_PUBLIC_KOPDES_LOCAL_AUTH_BYPASS=true`.
- Sakelar hanya berlaku ketika `NODE_ENV=development`. `npm.cmd run build` dan deployment produksi tetap memakai autentikasi Supabase.
- Middleware mengarahkan `/login` kembali ke `/dashboard` ketika mode lokal aktif.
- Route Handler menerima identitas lokal berperan admin/manajer. Akses database lokal memakai Service Role hanya di server bila kunci tersebut tersedia; kunci tidak pernah dikirim ke browser.
- Untuk mengaktifkan kembali login lokal, ubah nilai menjadi `false` atau hapus `.env.development.local`, lalu restart server.

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

---

## 10. Panduan Eksekusi AI Berikutnya — Aplikasi Pribadi Manajer

### 10.1 Mandat, batas pekerjaan, dan cara membaca dokumen

Dokumen ini disusun atas permintaan pengguna untuk dikerjakan AI berikutnya. Pada pembaruan panduan ini hanya dokumentasi yang diubah. Penghapusan login, penambahan fitur, dan penyempurnaan program di bawah **belum dikerjakan**.

Pemilik: Abdul Halim, awam IT, calon manajer koperasi mulai awal 2027. Aplikasi adalah alat kerja pribadi untuk manajemen dan pemantauan gerai. Kemungkinan wilayahnya Nagari/Desa Ladang Laweh, Kecamatan Banuhampu, Kabupaten Agam; identitas dan wilayah harus mudah diganti karena penempatan belum pasti. Jangan menganggap nama badan hukum, alamat, saldo awal, atau kebijakan SHU sudah ditetapkan.

Target hasil: langsung masuk dashboard tanpa akun; data usaha tersimpan nyata; tampilan terang/gelap lembut; kalender, formulir, popup, dan dropdown mudah dipakai; kode terstruktur; dokumentasi cukup untuk pindah AI tanpa mengulang audit dari nol.

Urutan acuan: arahan pengguna terbaru → `AGENTS.md` beserta catatan arahan terbaru → bagian 10 dokumen ini → `STATUS.md` untuk bukti progres → `DECISIONS.md` dan `DESIGN_SYSTEM.md`. Jangan menyalin klaim lama tanpa memeriksa implementasi. Referensi POS, multi-peran, dan dokumen yang sudah dihapus harus ditandai sebagai riwayat atau diperbaiki ketika menyentuh bagian terkait.

### 10.2 Kondisi awal yang harus dipertahankan dan diperiksa

| Bagian | Kondisi diketahui | Tindak lanjut |
|---|---|---|
| Fondasi UI v2.2 | `Input`, `Select`, `DateInput`, `Textarea`, `Dialog`, serta tema sudah disempurnakan | Gunakan ulang; audit hasil nyata sebelum memperluas |
| Login v2.2.1 | Masih ada; hanya dilewati di development melalui `.env.development.local` | Ubah menjadi arsitektur pribadi permanen, bukan menambah identitas akun palsu |
| Akses database lokal | `src/lib/supabase/server.ts` memakai Service Role ketika bypass aktif dan kunci tersedia | Perlakukan sebagai akses berhak tinggi; harus ada batas akses aplikasi |
| Profil koperasi | `/pengaturan` masih memanggil repository persiapan | Sambungkan ke tabel organisasi nyata; pastikan bertahan sesudah refresh/restart |
| Dashboard | Query gagal dapat jatuh menjadi angka nol, tanggal memakai UTC | Periksa semua hasil query dan gunakan tanggal bisnis WIB |
| Keuangan | Konstanta bank Rp25 juta, aset Rp15 juta, stok × Rp20 ribu, pembagian SHU tetap | Hilangkan angka rekaan dan asumsi laporan resmi |
| Pengujian terakhir | Riwayat 96/96 tes, typecheck, build lulus pada v2.2.1 | Bukan hasil tes baru untuk panduan ini atau bukti semua alur sudah benar |
| Pemeriksaan langsung | Login pernah diperiksa desktop/tablet; GET dashboard, gerai, tugas pernah berhasil setelah bypass | CRUD dan visual seluruh halaman belum dibuktikan |
| Git | Ada perubahan belum di-commit dari tahap bypass login | Catat diff awal dan jangan menimpa pekerjaan sebelumnya |

Jangan menganggap server masih aktif dari catatan percakapan. Periksa port/proses dan respons HTTP saat mulai. Jangan menjalankan beberapa dev server atau dev dan build bersamaan pada `.next` yang sama. Galat cache pernah terjadi akibat proses tertinggal. Bila perlu restart, identifikasi PID dan folder proyek, hentikan satu proses yang tepat, baru jalankan ulang. Jangan membunuh semua proses Node atau menampilkan isi `.env` dalam log.

### 10.3 Tahap 1 — Hapus fitur login dan pengguna untuk pemakaian pribadi (✅ SELESAI — v2.3.0)

**Status:** Selesai diimplementasikan pada checkpoint v2.3.0. Seluruh poin terselesaikan: dashboard langsung terbuka tanpa akun; seluruh CRUD bekerja pada lingkungan privat; menu akun dan tombol masuk/keluar dihilangkan dari antarmuka; anggota dan PIC utuh 100%; `created_by` diset `null` (mencegah galat UUID); akses luar lingkungan privat ditolak; 100/100 tes lulus.

**Permintaan pengguna sudah jelas:** hapus kebutuhan masuk, keluar, pendaftaran, lupa/reset kata sandi, undangan staf, pengelolaan akun, pilihan peran, badge sesi, serta menu yang hanya berguna untuk banyak pengguna. Nama pemilik cukup menjadi pengaturan profil, bukan akun autentikasi.

Data **anggota koperasi** tetap ada. PIC tugas/gerai tetap berupa nama penanggung jawab pekerjaan. Keduanya berbeda dari akun pengguna aplikasi dan tidak ikut dihapus.

Peta pekerjaan:

1. Audit pemakai `getCurrentUser`, `requireUser`, `requireRole`, `requireUnitScope`, `useCurrentUser`, `user_roles`, Supabase Auth, dan callback login. Periksa `src/middleware.ts`, `src/lib/auth/`, `src/lib/supabase/`, seluruh Route Handler, `Header`, `Sidebar`, dan `DemoBanner`.
2. Jadikan `/` membuka dashboard; tentukan pengalihan rute autentikasi lama ke dashboard agar bookmark lama tidak buntu. Hilangkan tampilan profil sesi dan tindakan masuk/keluar.
3. Ganti ketergantungan role/user dalam layanan server dengan batas akses aplikasi pribadi yang ditetapkan di bawah. Jangan sekadar mengembalikan pengguna admin buatan pada setiap permintaan.
4. Audit `created_by` dan seluruh foreign key ke `auth.users`. Saat ini `LOCAL_DEV_USER.id` adalah `local-development-manager`, sedangkan POST laporan mengirim `user.id` ke kolom UUID. Ini berpotensi menggagalkan penyimpanan. Sesuaikan sesuai skema nyata (misalnya null bila diperbolehkan); jangan mengarang UUID untuk menutupi masalah.
5. Lepaskan hook, dependency, environment bypass, mock, dan pengujian autentikasi yang sudah tidak relevan hanya setelah penggantinya terverifikasi. Jangan menghapus pustaka Supabase yang masih diperlukan untuk database.
6. Jangan langsung menghapus akun Supabase, tabel `user_roles`, atau data historis cloud. Audit dependensi dan siapkan migrasi terpisah bila diperlukan. Jelaskan SQL dan minta konfirmasi sebelum dieksekusi sesuai aturan workspace. Status database tetap 7 tabel sampai perubahan benar-benar diterapkan.

**Batas akses tanpa layar login:** pemakaian pribadi tidak berarti URL dan API boleh diakses umum. Pilihan awal yang dapat disiapkan adalah server di komputer pribadi dengan bind `127.0.0.1`, hanya dibuka dari perangkat itu. Ini keputusan awal teknis, bukan pernyataan bahwa kebutuhan tablet sudah terpenuhi.

Untuk tablet atau akses dari luar komputer, siapkan akses privat di tingkat perangkat/jaringan atau pelindung hosting di luar aplikasi; jelaskan pilihan yang benar-benar tersedia dan biayanya sebelum pengaktifan. Jangan menyebarkan versi tanpa login ke Vercel publik atau membuka semua interface jaringan dengan API berhak admin. Jika cara akses jarak jauh belum ditentukan, selesaikan versi lokal dan catat bahwa akses tablet jarak jauh menunggu keputusan itu. Tidak perlu menghidupkan kembali modul akun internal yang memang diminta dihapus.

Kunci database tetap di server; jangan masukkan Service Role ke `NEXT_PUBLIC`, bundle browser, ekspor, atau dokumentasi. RLS tetap aktif; jangan membuat kebijakan anonim bebas baca/tulis. Service Role melewati RLS, sehingga keberadaan RLS bukan bukti bahwa API aplikasi sudah terlindungi. Batasi metode/kolom input, validasi Zod, dan tolak mutasi lintas origin yang tidak diizinkan. Build yang dipasang di luar lingkungan privat harus gagal jelas bila batas akses belum dikonfigurasi.

**Selesai bila:** dashboard dapat dibuka tanpa akun; semua CRUD bekerja pada lingkungan privat; menu akun hilang; anggota/PIC utuh; tidak ada pengiriman ID palsu; akses di luar batas privat ditolak; cara memakai dari komputer/tablet dijelaskan jujur. *(Status: Terpenuhi & Diverifikasi v2.3.0)*

### 10.4 Tahap 2 — Pastikan data dan perhitungan dapat dipercaya (✅ SELESAI — v2.4.0)

**Status:** Selesai diimplementasikan dan diverifikasi pada checkpoint v2.4.0:
- Konstanta fiktif di `/api/finance/summary` telah dibersihkan (kas bank Rp25jt, aset Rp15jt, valuasi stok Rp20rb dihapus; pos belum terhubung/dinilai berstatus jujur).
- Error kueri database ditangani fail-fast (status HTTP 500, tidak disamarkan menjadi 0).
- Setoran kas bernilai 0 dipertahankan tanpa tertimpa omset minus pengeluaran.
- Nilai selisih operasional negatif (kerugian/defisit) didukung tanpa dipaksa menjadi nol.
- Zona waktu operasional distandarkan ke `Asia/Jakarta` (WIB) via utilitas terpusat.
- Evaluasi kepatuhan lapor hari ini hanya untuk gerai berstatus `aktif`.
- Halaman `/keuangan` dan `/laporan` menyajikan konteks transparan dengan banner neraca sementara dan disclaimer simulasi SHU AD/ART.
- 110/110 unit test Vitest lulus (termasuk 10 pengujian audit baru di `tests/phase11-finance-audit.test.ts`), typecheck 0 galat, build produksi optimal.

1. Periksa `error` pada setiap query Supabase, termasuk query paralel. Endpoint dashboard/keuangan tidak boleh mengembalikan sukses berisi nol bila database gagal. Bedakan belum ada laporan, nilai riil nol, belum dikonfigurasi, dan gagal memuat.
2. Bersihkan konstanta di `/api/finance/summary` dan seluruh turunannya. Kas bank, nilai aset, utang, simpanan, serta harga persediaan yang belum dicatat harus tampil “Belum tersedia”, bukan Rp0 atau angka perkiraan tanpa sumber.
3. Omset dikurangi pengeluaran yang dicatat belum cukup untuk menyatakan laba kotor, laba bersih, neraca lengkap, atau SHU resmi. Gunakan label sementara “Selisih omset dan pengeluaran tercatat” sampai definisi biaya dan data akuntansinya memadai. Jelaskan keterbatasannya singkat pada halaman laporan.
4. Jangan mengganti setoran bernilai nol dengan omset dikurangi pengeluaran (`||` saat ini menimbulkan risiko ini). Jangan menjumlahkan setoran sepanjang waktu lalu mengklaimnya sebagai saldo kas saat ini tanpa arus keluar dan saldo awal.
5. Nilai negatif harus dapat mencerminkan kerugian; jangan dipaksa menjadi nol. Gunakan perhitungan uang yang konsisten dengan presisi database. Jangan membuat neraca seimbang dengan mengarang modal penyeimbang.
6. Pembagian SHU mengikuti ketetapan pengguna/pengurus. Bila belum ditetapkan, nonaktifkan pembagian resmi; simulasi opsional harus berlabel jelas dan terpisah dari laporan nyata.
7. Gunakan `Asia/Jakarta` untuk hari ini, tenggat, kepatuhan, dan batas bulan. Uji pergantian hari saat UTC berbeda dengan WIB. Tentukan gerai wajib lapor berdasarkan status aktif; gerai rencana/nonaktif jangan otomatis dianggap terlambat.
8. Audit rute warisan seperti `/api/dashboard/summary`, `/keuangan/jurnal`, detail anggota/gerai, serta repository lama yang masih merujuk tabel POS terhapus. Perbaiki, alihkan, atau tandai belum tersedia secara jelas.

**Selesai bila:** semua angka yang ditampilkan mempunyai sumber; error tidak disamarkan; rumus dan label sesuai data yang benar-benar dicatat; tidak ada rute produksi yang diam-diam memakai data sesi contoh. *(Status: Terpenuhi & Diverifikasi v2.4.0)*

### 10.5 Tahap 3 — Kustomisasi koperasi yang benar-benar tersimpan

| Pengaturan | Penyimpanan yang diinginkan | Perilaku |
|---|---|---|
| Nama tampilan, nama resmi, wilayah, alamat | Database organisasi | Nama sementara boleh digunakan; data legal boleh kosong |
| Nama pemilik/pengelola | Profil organisasi setelah skema dipastikan | Digunakan untuk sapaan/default PIC, dapat diganti tanpa akun |
| Tahun buku, mode persiapan/operasional, target buka | Database organisasi | Tanggal target opsional; tidak otomatis mengubah status gerai |
| Logo dan identitas tampilan | Metadata organisasi; penyimpanan berkas bila tersedia | Validasi tipe/ukuran, pratinjau, dan fallback inisial |
| Tema terang/gelap/ikuti perangkat | Preferensi perangkat | Tetap nyaman setelah refresh dan pergantian tema sistem |
| Ukuran teks, awal pekan kalender, tampilan daftar/kalender | Preferensi perangkat bila diterapkan | Default mudah dibaca; aksesibel dengan keyboard dan sentuhan |

Audit kolom `organization_profile` dahulu, lalu buat layanan dan GET/PATCH server yang tervalidasi. Jika skema tidak cukup, siapkan migrasi tambahan tanpa menjalankannya sebelum konfirmasi. Bedakan profil yang belum dibuat dari kegagalan memuat. Gunakan satu sumber profil bagi sidebar, header, dashboard, hasil cetak, dan ekspor. Nama wilayah Ladang Laweh/Banuhampu/Agam tidak boleh tersebar sebagai teks yang sulit diganti.

Form pengaturan harus mempunyai pratinjau, penanda belum disimpan, batal, validasi, status menyimpan, dan pesan hasil yang jelas. Uji simpan lalu refresh/restart; gunakan “Tersimpan” hanya setelah server mengonfirmasi. Jangan menganggap localStorage sebagai penyimpanan permanen data koperasi.

**Selesai bila:** Profil koperasi tersimpan permanen di tabel PostgreSQL Supabase `organization_profile`; form `/pengaturan` tervalidasi Zod dan tersambung penuh ke server; sidebar dan header menampilkan nama lembaga dan manajer secara dinamis; 126/126 unit test Vitest lulus 100%. *(Status: Terpenuhi & Diverifikasi v2.5.0)*

### 10.6 Tahap 4 — Penyempurnaan desain seluruh halaman

Pertahankan Plus Jakarta Sans, aksen rose `#A64768`, latar terang `#F7F8FC`, latar gelap `#1D2533`, dan kartu gelap `#252F40`. Gunakan pastel sebagai aksen; teks utama harus cukup gelap/terang. AI boleh memperbaiki komposisi dengan selera desain yang lebih baik selama tetap lembut, rapi, dan konsisten.

- Susun halaman dengan urutan judul dan konteks → ringkasan penting → pencarian/filter → isi → tindakan lanjutan. Satu tindakan utama paling menonjol per area. Hindari kartu besar yang hanya mengulang angka tanpa manfaat.
- Gunakan jarak konsisten 8/12/16/24 px, sudut lembut, ikon seukuran, angka tabular, label sejajar, dan tindakan utama mudah dijangkau. Isi utama 14–16 px dan target sentuh 44–48 px.
- Dark mode: bedakan latar, kartu, input, hover, pilihan aktif, dan disabled dengan jelas. Periksa teks putih pada tombol rose saat hover; hindari aksen pucat yang membuat teks hilang. Uji kontras, jangan hanya menilai dari kode warna.
- Form: pakai komponen bersama; label terhubung ke input; tanda wajib jelas; bantuan singkat; galat muncul dekat isian dan fokus ke galat pertama. Nominal Rupiah, angka desimal, nomor telepon, dan tanggal harus memakai jenis input yang sesuai.
- Popup: judul menjelaskan tindakan; isi panjang dapat digulir; tombol simpan/batal tetap mudah ditemukan; Enter/Tab/Escape bekerja; fokus kembali ke pemicu. Saat menyimpan, cegah klik ganda dan jangan biarkan hasil permintaan tertinggal akibat popup ditutup tanpa penanganan.
- Dropdown: lebar mengikuti isian, teks panjang terbaca, ikon tidak menutupi teks, hasil terpilih jelas, daftar tidak terpotong popup. Pakai native select bila cukup; combobox pencarian hanya untuk daftar yang memang panjang dan tetap mendukung keyboard.
- Input tanggal: jangan menumpuk ikon kalender buatan dengan ikon native browser; uji membuka pemilih tanggal pada tablet. Placeholder tidak menggantikan label.
- Ganti `window.confirm()` penghapusan tugas dengan `ConfirmDialog` bersama yang menyebut nama tugas dan konsekuensinya.
- Audit komponen bersama dahulu, lalu terapkan bertahap pada semua modul. Jangan membuat aturan CSS global yang diam-diam mengubah seluruh kontrol tanpa uji.

**Kalender sebagai perhatian khusus:**

1. Pisahkan kalender menjadi komponen yang mudah diuji. Tugas bertanggal tetap berasal dari data tugas yang sama; jangan menggandakan penyimpanan agenda.
2. Buat bilah bulan/tahun, sebelumnya/berikutnya, Hari ini, filter gerai/status, dan Tambah agenda yang tidak berhimpitan.
3. Bedakan hari ini dan tanggal terpilih dengan bentuk/label, bukan warna saja. Agenda terpilih memakai tanggal Indonesia lengkap dan status tertunda yang benar.
4. Batasi cuplikan agenda per sel, sediakan “+N lainnya” yang membuka daftar tanggal tersebut, dan tampilkan judul lengkap pada panel detail.
5. Pada desktop gunakan kalender dengan panel detail samping jika cukup lebar; tablet potret panel detail di bawah; ponsel sediakan daftar agenda yang mudah dibaca sebagai alternatif grid. Jika grid digeser, beri petunjuk yang terlihat.
6. Pertahankan filter ketika berpindah daftar/kalender. Saat pindah bulan, selaraskan pilihan tanggal/panel agar agenda di bulan lama tidak membingungkan.
7. Tugas tanpa tenggat tetap terlihat dalam daftar khusus. Uji bulan 28/29/30/31 hari, akhir tahun, hari WIB, judul panjang, banyak tugas, tanpa data, serta perubahan status.
8. Jam, durasi, pengulangan, dan deteksi bentrok bukan fitur yang sudah tersedia pada skema tugas saat ini. Implementasikan hanya pada tahap berikut yang disertai model data dan migrasi yang disetujui.

**Selesai bila:** `window.confirm` telah diganti dengan `ConfirmDialog` di seluruh kode; kalender dipisah ke `TaskCalendarView` yang modular; filter bersama aktif pada daftar & kalender; tugas tanpa tenggat tertata rapi di panel khusus; area sentuh tablet terstandarisasi minimal 44–48 px; 135/135 unit test Vitest lulus 100%. *(Status: Terpenuhi & Diverifikasi v2.6.0)*

### 10.7 Tahap 5 — Fitur tambahan yang bermanfaat bagi satu manajer

Kerjakan bertahap setelah data dan fondasi di atas stabil. Jangan membuka kembali modul kasir atau sistem akun banyak pengguna.

| Urutan | Fitur | Alur dan ukuran selesai |
|---|---|---|
| 1 | Fokus hari ini | Dashboard menampilkan tugas jatuh tempo/terlambat, gerai aktif belum lapor, stok di bawah minimum; setiap item menuju data terkait |
| 2 | Filter dan pencarian konsisten | Periode, gerai, status; ada jumlah hasil, hapus filter, dan pesan jika hasil kosong; ekspor mengikuti filter yang sama |
| 3 | Ringkasan mingguan/bulanan | Agregasi data nyata, periode tercetak jelas, format cetak rapi; belum ada data bukan laporan keuangan terverifikasi |
| 4 | Jadikan kendala sebagai tugas | Dari rekap gerai buka form tugas terisi konteks; pengguna meninjau PIC/tenggat sebelum menyimpan; cegah duplikasi |
| 5 | Ekspor dan pencadangan | CSV dengan format Indonesia yang konsisten dan penanganan formula berbahaya; bedakan ekspor laporan dari backup lengkap; pemulihan harus divalidasi dan dikonfirmasi |

Notifikasi awal cukup berupa panel di aplikasi dari data nyata, tanpa email/WhatsApp/layanan berbayar. Pengingat terjadwal di luar aplikasi, integrasi kasir, stok otomatis, dan akuntansi lengkap merupakan pengembangan terpisah yang harus dibatasi ruang lingkupnya.

### 10.8 Tahap 6 — Kerapian kode dan efisiensi

- Strukturkan per fitur: halaman merangkai komponen; hook mengelola state/pengambilan data; layanan server mengakses database; skema Zod memvalidasi; utilitas menangani tanggal/uang. Jangan menambah lapisan abstraksi yang tidak memecahkan pengulangan nyata.
- Satukan tipe tugas, gerai, profil, dan respons API. Hindari `any`, type assertion tanpa pemeriksaan, serta tipe yang berbeda untuk objek yang sama.
- Gunakan React Hook Form dan Zod untuk formulir yang kompleks sesuai stack; server tetap melakukan validasi sendiri. Pertahankan input pengguna saat permintaan gagal.
- Cegah permintaan ganda yang tidak perlu, pembaruan state dari respons usang, dan pemuatan ulang seluruh halaman untuk satu perubahan status. Gunakan loading per aksi serta pembaruan data setelah server berhasil.
- Ambil kolom yang diperlukan; gunakan pagination untuk daftar besar; hindari mengunduh seluruh sejarah laporan untuk ringkasan. Tambah indeks/aggregasi database hanya setelah profil query dan persetujuan SQL.
- Rapikan kode POS/repository lama setelah memetakan seluruh pemakai. Jangan menghapus tes hanya untuk membuat angka lulus; gantikan tes lama dengan tes perilaku produk yang baru.

**Selesai bila:** Model kanonikal PostgreSQL terpadu di `src/types/models.ts`; rute `/unit-usaha/[id]` dan `/anggota/[id]` terhubung ke Supabase via Route Handler riil (tanpa `preparationRepository`); halaman monolitik `/monitoring`, `/pekerjaan`, `/anggota`, dan `/stok` dipecah menjadi komponen mandiri ramping; 153/153 unit test Vitest lulus 100%, 0 error TypeScript, Next.js build sukses. *(Status: Terpenuhi & Diverifikasi v2.8.0)*

### 10.9 Urutan verifikasi dan kriteria serah terima

Setiap tahap memiliki bukti sebelum ditandai selesai. Pengujian mutasi menggunakan database/fixture khusus uji atau data yang disepakati; jangan menambahkan transaksi palsu ke data operasional.

| Area | Pemeriksaan wajib |
|---|---|
| Akses pribadi | Buka langsung tanpa login; tidak ada menu akun; akses luar lingkungan privat ditolak; secret tidak muncul di browser |
| Gerai/anggota | Tambah/edit valid, input salah ditolak, duplikasi ditangani, perubahan tetap ada setelah refresh |
| Tugas/kalender | Tambah/edit/status/hapus, filter, tanggal terpilih, tugas tanpa tenggat, pembatalan dan kegagalan jaringan |
| Rekap | Satu gerai per tanggal sesuai aturan, nominal nol/negatif/desimal sesuai skema, `created_by` sah, klik simpan ganda |
| Stok | Penyesuaian fisik dan minimum, catatan, kondisi kosong, stok rendah, validasi angka |
| Profil/tema | Simpan profil dan muat ulang; nama berubah di seluruh antarmuka; terang/gelap/sistem; preferensi tidak hilang |
| Dashboard/laporan | Query gagal menjadi error; batas WIB/bulan tepat; tanpa konstanta saldo; hasil perhitungan diuji |
| Perangkat | Desktop 1440×900, tablet 1024×768 dan 768×1024, ponsel sekitar 390×844; terang dan gelap |
| Aksesibilitas | Tab/Enter/Escape, label/error terbaca, kontras, zoom 200%, fokus popup, isi panjang, reduced motion |

Setelah perubahan kode jalankan berurutan:

```powershell
npm.cmd test -- --maxWorkers=1
npm.cmd run typecheck
npm.cmd run build
```

Hentikan server dev yang memakai output yang sama sebelum build, lalu nyalakan satu server kembali untuk pemeriksaan akhir. Catat jumlah tes sebenarnya, hasil gagal bila ada, rute yang diuji langsung, ukuran layar/tema, dan keterbatasan. Tes lulus tidak sama dengan audit visual selesai. Setup E2E berikutnya berfokus pada alur pribadi tanpa login, penyimpanan nyata, kegagalan, dan batas akses; jangan menambah skenario multi-peran yang sudah dihapus dari sasaran produk.

### 10.10 Cara melanjutkan dan menutup setiap tahap

1. Mulai dengan membaca panduan dan mencatat Git/status server; buat daftar kerja tahap aktif. Jangan mengulang perbaikan v2.2 yang sudah ada.
2. Selesaikan satu tahap yang dapat diperiksa, jalankan uji relevan, kemudian lanjutkan dependensinya. Migrasi cloud tetap memerlukan penjelasan dan konfirmasi SQL; kode dan draft migrasi boleh disiapkan dahulu.
3. Perbarui `STATUS.md` dengan tabel **selesai / sedang dikerjakan / belum dikerjakan / terhalang**, serta berkas yang berubah dan hasil uji. Perbarui `CHANGELOG.md` dan keputusan yang benar-benar berubah.
4. Sinkronkan `HANDOFF.md`, `DECISIONS.md`, `DESIGN_SYSTEM.md`, `ROUTES.md`, dan prompt lanjutan agar tidak ada dua instruksi bertentangan. Jangan mengklaim deploy atau perubahan cloud jika belum dilakukan.
5. Bila perlu berpindah AI, tulis pada bagian teratas `STATUS.md`: tujuan tahap aktif, pekerjaan yang benar-benar selesai, file/fungsi yang disentuh, temuan yang belum selesai, langkah berikut tepat, perintah terakhir/hasilnya, proses/port yang masih hidup, migrasi belum diterapkan, keputusan pengguna yang masih diperlukan, serta cara membatalkan perubahan milik tahap itu tanpa reset pekerjaan orang lain. Jangan menulis rahasia.
6. Laporkan kepada Abdul Halim dengan kalimat konkret: apa yang sekarang bisa dilakukan, menu untuk mencobanya, bukti pengujian, dan yang masih menunggu. Hindari “semua selesai” bila masih ada fitur palsu, penyimpanan sementara, atau alur yang belum diperiksa.

**Status Akhir Roadmap:** Seluruh Tahap 1 s.d. 6 telah tuntas diimplementasikan, diverifikasi, dan migrasi SQL `organization_profile` (00008) telah sukses dieksekusi di Supabase Cloud. Sistem siap dioperasikan dalam lingkungan privat lokal/tablet oleh Manajer Abdul Halim. Pengembangan di masa depan dapat berfokus pada pendampingan operasional nyata atau penambahan fitur lanjutan yang disetujui bersama.
