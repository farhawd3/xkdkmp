# Serah Terima Utama Lintas Tahap — Kopdes Merah Putih Ladang Laweh

> **Serah terima terkini:** Login Supabase Auth telah terbukti berhasil 100% oleh pengguna (menggunakan kunci Legacy anon JWT). Masalah tampilan dashboard ("Ringkasan belum dapat dimuat") telah berhasil diperbaiki dengan pola delegasi repositori yang aman dan *fail-fast*. Seluruh 71 tes unit Vitest, typecheck, dan build Next.js (26 rute) lulus 100%. Rujukan serah terima instan untuk AI lain / ChatGPT: [docs/HANDOFF_CHATGPT.md](HANDOFF_CHATGPT.md).


**Tanggal Pembaruan**: 23 September 2026  
**Tahap Aktif Terkini**: **Tahap 10 — Supabase Auth Nyata & Manajemen Akses Berwenang (SELESAI)**  
**Tahap Berikutnya**: **Tahap 11 — Integrasi Modul Operasional & Penegakan Otorisasi End-to-End**  
**Pemilik Kebutuhan**: Abdul Halim (pemula di bidang IT, bertugas mulai awal 2027)  
**Dokumen Riwayat Sebelumnya**: [docs/HANDOFF_08B.md](HANDOFF_08B.md) (arsip catatan riwayat perbaikan UI & frontend 08B)

---

## 1. Ringkasan Eksekutif & Hasil Implementasi Tahap 10

Tahap 10 mengimplementasikan autentikasi dan manajemen akses nyata berbasis **Supabase Auth** dengan pola **Next.js 15 Server-Side Rendering (SSR)**, perlindungan rute via Middleware, halaman login dan reset password yang selaras dengan tema pastel lembut, serta otorisasi berbasis peran di database (`public.user_roles`):

1. **Pola SSR Next.js 15 dengan `@supabase/ssr`**:
   - `src/lib/supabase/client.ts`: Klien peramban untuk formulir autentikasi di sisi klien.
   - `src/lib/supabase/server.ts`: Klien server asinkron yang memanfaatkan `await cookies()` dari `next/headers` untuk Server Actions dan Route Handlers.
   - `src/lib/supabase/admin.ts`: Klien administrasi privat dengan `SUPABASE_SERVICE_ROLE_KEY` yang dilindungi agar dilarang dijalankan di peramban.

2. **Middleware & Proteksi Open Redirect (`src/middleware.ts` & `src/lib/supabase/middleware.ts`)**:
   - Memvalidasi pengguna resmi langsung ke server Supabase (`supabase.auth.getUser()`).
   - Melindungi rute privat internal (`/dashboard`, `/anggota`, `/persiapan`, dll.) dan mengalihkan pengguna anonim ke `/login`.
   - Menguji dan menerapkan fungsi `sanitizeRedirectUrl` untuk mencegah serangan *Open Redirect* (menolak `//`, `/\\`, `http:`, `javascript:`, dll.).

3. **Antarmuka Autentikasi Pastel Responsif (Tablet & Komputer)**:
   - `/login` (`src/app/login/page.tsx`): Formulir masuk dengan validasi Zod, pesan galat aman yang tidak membocorkan keberadaan akun (*User Enumeration Protection*), tombol sentuh 48px, dan indikator status konfigurasi yang jujur.
   - `/lupa-password` (`src/app/lupa-password/page.tsx`): Alur permohonan tautan pemulihan kata sandi dengan penjelasan batas frekuensi.
   - `/reset-password` (`src/app/reset-password/page.tsx`): Formulir kata sandi baru dengan validasi kekuatan sandi (minimal 8 karakter, huruf besar, dan angka).
   - `/auth/callback` (`src/app/auth/callback/route.ts`): Penukaran kode verifikasi email / undangan staf menjadi sesi cookie aman.
   - `/auth/logout` (`src/app/auth/logout/route.ts`): Penanganan keluar sistem, pembersihan sesi, dan pengalihan ke `/login`.

4. **Sesi Nyata & Tombol Keluar di Navigasi**:
   - [src/components/layout/Sidebar.tsx](file:///d:/Koding/kopdes-ladang-laweh/src/components/layout/Sidebar.tsx) kini memiliki tombol **Keluar (*Logout*)** dengan ikon `LogOut` di samping info pengguna.
   - Pemilihan peran mandiri (*role switcher*) ditiadakan; peran dibaca murni dari tabel `public.user_roles`.

5. **Prosedur Bootstrap Admin & Penautan Profil Abdul Halim**:
   - [supabase/migrations/20260923000004_auth_bootstrap.sql](file:///d:/Koding/kopdes-ladang-laweh/supabase/migrations/20260923000004_auth_bootstrap.sql):
     - `bootstrap_initial_admin(p_admin_email)`: Prosedur satu kali untuk mengangkat admin pertama.
     - `link_abdul_halim_profile(p_email)`: Menautkan email resmi Abdul Halim dengan peran `manajer`.
     - `rpc_assign_user_role(...)`: Prosedur pemberian peran staf oleh admin dengan audit log lengkap.

---

## 2. Berkas & Migrasi Database yang Berubah

| Berkas / Direktori | Status | Deskripsi Perubahan |
|---|---|---|
| `supabase/migrations/20260923000004_auth_bootstrap.sql` | Baru | Prosedur bootstrap admin satu kali, penautan akun resmi Abdul Halim, dan penugasan peran staf via RPC. |
| `src/lib/supabase/client.ts` | Baru | Inisialisasi klien browser Supabase dengan `@supabase/ssr`. |
| `src/lib/supabase/server.ts` | Baru | Inisialisasi klien server Supabase dengan `await cookies()` Next.js 15. |
| `src/lib/supabase/admin.ts` | Baru | Klien administrasi server privat dengan penolakan ketat jika dijalankan di browser. |
| `src/lib/supabase/middleware.ts` | Baru | Logika penyegaran sesi cookie dan sanitasi URL pengalihan (*Open Redirect Protection*). |
| `src/middleware.ts` | Baru | Next.js Edge Middleware untuk proteksi rute aplikasi. |
| `src/lib/auth/utils.ts` | Baru | Utilitas autentikasi murni (sanitasi galat akun) aman diimpor komponen klien. |
| `src/lib/auth/session.ts` | Baru | Helper server untuk `getCurrentUser()`, `requireUser()`, `requireRole()`, dan `requireUnitScope()`. |
| `src/app/login/page.tsx` | Baru | Halaman masuk staf bertema pastel rose & dark mode lembut, responsif tablet/desktop. |
| `src/app/lupa-password/page.tsx` | Baru | Halaman pemulihan kata sandi dengan sanitasi enumerasi akun. |
| `src/app/reset-password/page.tsx` | Baru | Halaman penetapan kata sandi baru. |
| `src/app/auth/callback/route.ts` | Baru | Handler penukaran kode sesi Supabase Auth. |
| `src/app/auth/logout/route.ts` | Baru | Handler keluar dari sistem dan pembersihan cookie. |
| `src/components/layout/Sidebar.tsx` | Diperbarui | Penambahan tombol logout dan inisial dinamis. |
| `src/types/index.ts` & `src/lib/constants.ts` | Diperbarui | Penyelarasan tipe `UserRole` dan `ROLE_LABELS` (menambahkan peran `kasir` dan `anggota`). |
| `tests/phase10-auth.test.ts` | Baru | 9 pengujian unit untuk open redirect, sanitasi galat, bootstrap SQL, dan proteksi admin client. |
| `docs/STATUS.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md` | Diperbarui | Pembaruan dokumentasi serah terima dan status Tahap 10 Selesai. |

---

## 3. Status Eksekusi Migrasi Database

| Berkas Migrasi | Status Saat Ini | Keterangan & Tindakan Selanjutnya |
|---|---|---|
| `20260923000001_core_schema.sql` | **File Siap (Pending Execution)** | Skema DDL 20 tabel inti, tipe ENUM, kolom `NUMERIC(15, 2)`. |
| `20260923000002_rls_policies.sql` | **File Siap (Pending Execution)** | Kebijakan RLS default deny dan imutabilitas transaksi. |
| `20260923000003_atomic_rpcs.sql` | **File Siap (Pending Execution)** | Fungsi transaksi atomik gudang, POS kasir, dan jurnal akuntansi. |
| `20260923000004_auth_bootstrap.sql` | **File Siap (Pending Execution)** | Prosedur bootstrap admin dan penautan profil resmi Abdul Halim. |

---

## 4. Konfigurasi Lingkungan (Environment Variables)

Variabel yang diperlukan pada berkas `.env.local` di lingkungan produksi:

```env
# URL Project Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co

# Anon Public Key (Aman diakses browser klien, tunduk pada RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# Service Role Key (HANYA untuk server privat/bootstrap, DILARANG diekspos ke publik)
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Database URL (Untuk migrasi CLI)
DATABASE_URL=postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
```

---

## 5. Bukti Pengujian Aktual & Hasil Eksekusi

1. **Pemeriksaan Tipe TypeScript (`npm.cmd run typecheck`)**:
   - Hasil: **Lulus tanpa galat (Exit code 0)**.
2. **Pengujian Unit Vitest (`npm.cmd test -- --maxWorkers=1`)**:
   - Hasil: **6 berkas lulus, 69/69 pengujian sukses 100% (Exit code 0)**:
     - `tests/phase10-auth.test.ts` (11 tes): Validasi open redirect, sanitasi enumerasi akun, bootstrap admin SQL, keamanan client admin, default user non-ekspos, dan eliminasi route preview.
     - `tests/phase09-database.test.ts` (9 tes): Integritas DDL 20 tabel, tipe moneter `NUMERIC(15, 2)`, RLS default deny, dan RPC atomik.
     - `tests/phase08b.test.tsx` (7 tes): Paginasi keanggotaan, filter verified, proteksi stok produk, master pemasok, dan aksi CardMetric.
     - `tests/csv.test.ts` (10 tes): Parser CSV dan proteksi injeksi formula spreadsheet.
     - `tests/navigation-dialog.test.tsx` (6 tes): Dialog konfirmasi dan aksesibilitas keyboard.
     - `tests/components.test.tsx` (26 tes): Format moneter, tanggal Indonesia, dan komponen UI dasar.
3. **Kompilasi Produksi Next.js (`npm.cmd run build`)**:
   - Hasil: **Lulus tanpa galat (Exit code 0)**.
   - 26/26 rute statis/dinamis dan Middleware berhasil di-generate secara optimal.

---

## 6. Kekurangan & Keputusan Bisnis Terbuka

1. Kredensial Supabase live belum dihubungkan ke proyek ini; sistem berjalan dalam mode kesiapan auth (menampilkan peringatan jelas pada `/login` dan `/lupa-password` bila kredensial belum ada di `.env.local`).
2. 10 keputusan bisnis terbuka (nama badan hukum definitif, rekening bank operasional, tanggal peluncuran fisik, AD/ART simpanan pokok/wajib) tetap berstatus **TERBUKA** sesuai [docs/DECISIONS.md](file:///d:/Koding/kopdes-ladang-laweh/docs/DECISIONS.md).

---

## 7. Panduan Pelaksanaan Tahap Berikutnya (Tahap 11)

Setelah Tahap 10 disetujui, tahap berikutnya adalah **Tahap 11: Integrasi Modul Operasional & Penegakan Otorisasi End-to-End**.
- Menghubungkan setiap Server Action dan Route Handler ke guard `requireRole()` dan `requireUnitScope()`.
- Mengunci mutasi formulir sesuai matriks wewenang: Kasir hanya bisa transaksi kasir, Operator Gudang hanya bisa penerimaan barang, dan Bendahara mengelola jurnal.
