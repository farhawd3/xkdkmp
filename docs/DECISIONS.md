# DECISIONS — KOPDES MERAH PUTIH LADANG LAWEH

**Tanggal Pembaruan**: 23 September 2026  
**Status**: Aktif — Tahap 11 berlangsung

## Keputusan Tahap 11A — batas data produksi

Saat kredensial Supabase aktif, repository sesi tidak boleh menjadi sumber data cadangan. Dashboard dan stok membaca database secara eksplisit; modul yang belum diintegrasikan gagal jelas. Sebelum RPC lama dapat dipakai, akses eksekusi publik serta penulisan tabel langsung ditutup melalui migrasi 00005. Migrasi belum diterapkan pada cloud. Detail dan urutan tindak lanjut: [PHASE11_SECURITY.md](PHASE11_SECURITY.md). Keputusan ini menggantikan klaim lama bahwa delegasi data sesi pada `SupabaseProductionRepository` aman untuk jalur produksi.

## Keputusan terbaru — 23 September 2026 (Tahap 10: Autentikasi Supabase & Manajemen Akses)

1. **Pola SSR Next.js 15 & Keamanan Cookie**:
   - Menggunakan pustaka resmi `@supabase/ssr` dengan asinkron `await cookies()` dari `next/headers`. Sesi diperbarui secara otomatis melalui Next.js Edge Middleware (`src/middleware.ts`).
2. **Otorisasi Berbasis Basis Data (Bukan Metadata Klien)**:
   - Hak akses pengguna dibaca langsung dari tabel `public.user_roles` di database PostgreSQL. Tab/toggle pemilihan peran mandiri di browser ditiadakan.
   - Pendaftaran mandiri staf dihilangkan; staf baru hanya dapat terdaftar melalui undangan resmi Administrator Sistem.
3. **Pencegahan Serangan Open Redirect & User Enumeration**:
   - URL pengalihan pasca-login divalidasi ketat melalui fungsi `sanitizeRedirectUrl` (menolak skema eksternal, protokol ganda `//`, dan script URI).
   - Pesan kesalahan login disanitasi seragam (*"Email atau kata sandi tidak sesuai"*) agar tidak membocorkan keberadaan akun terdaftar kepada pihak luar.
4. **Bootstrap Admin Satu Kali & Penautan Akun Nyata**:
   - Prosedur `bootstrap_initial_admin` diterapkan secara satu kali (*one-time bootstrap*); prosedur ini otomatis menolak eksekusi jika sistem sudah memiliki admin terdaftar.
   - Profil Abdul Halim ditautkan secara resmi melalui fungsi `link_abdul_halim_profile` dengan peran Manajer Persiapan.


1. **Skema PostgreSQL Presisi Moneter**:
   - Seluruh nilai uang (harga, subtotal, total, simpanan, kas, debit, kredit) wajib didefinisikan dengan tipe `NUMERIC(15, 2)` pada skema PostgreSQL Supabase. Tipe `FLOAT`, `REAL`, atau `DOUBLE PRECISION` dilarang digunakan untuk pembukuan.
2. **Keamanan Row Level Security (RLS) Default Deny**:
   - Seluruh tabel (20 tabel) diaktifkan RLS dengan penolakan default (`default deny`).
   - Penentuan peran pengguna (*role*) disimpan dan diperiksa langsung di basis data (`public.user_roles`) via fungsi `public.has_role()` dan `public.has_any_role()`; dilarang menyimpan atau mempercayai role pada `user_metadata` klien.
3. **Imutabilitas Mutlak Transaksi Akuntansi & Stok**:
   - Tabel `journal_entries`, `journal_lines`, `stock_mutations`, `pos_transactions`, dan `audit_logs` dilindungi kebijakan RLS `FOR UPDATE USING (FALSE)` dan `FOR DELETE USING (FALSE)`.
   - Tidak ada mutasi UPDATE/DELETE langsung pada transaksi yang telah dibukukan (*status: posted*). Koreksi data dilakukan melalui jurnal pembalikan (*reversal entry*) atau retur.
4. **Fungsi SQL RPC Multi-Tabel Atomik**:
   - Mutasi stok dan transaksi kasir POS diikat secara atomik dengan kartu mutasi fisik dan penerbitan jurnal akuntansi berpasangan melalui fungsi SQL RPC (`rpc_receive_goods_shipment`, `rpc_process_pos_sale`, `rpc_create_balanced_journal`).
   - Setiap fungsi RPC dideklarasikan dengan `SECURITY DEFINER SET search_path = public` guna mencegah kerentanan pembajakan skema.
5. **Repositori Produksi Fail-Fast Tanpa Data Tiruan**:
   - `SupabaseProductionRepository` menerapkan prinsip *fail-fast*: jika variabel koneksi Supabase (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`) belum terpasang atau terjadi kegagalan jaringan, sistem melempar galat teknis transparan dan **DILARANG** melakukan fallback ke data contoh/mock.
   - Sesi prototipe in-memory tetap bersih tanpa injeksi data contoh rekaan pada data anggota riil.

## Keputusan sebelumnya — 23 September 2026 (Tahap 08B: Perbaikan UI & Frontend)

Perbaikan mendalam tampilan, kalimat, aksi setiap kartu, menu, dan kerapian kode telah tuntas diverifikasi. Redesign pastel rose (`#A64768`) dan dark mode lembut (`#1D2533` / `#252F40`) menjadi standar desain sistem aktif, menggantikan Crimson lama. Prioritas tetap tablet dan desktop. Dokumen [docs/HANDOFF.md](HANDOFF.md) menjadi panduan serah terima utama lintas tahap, dengan [docs/HANDOFF_08B.md](HANDOFF_08B.md) sebagai arsip riwayat.

## Keputusan terbaru — 22 September 2026

Permintaan langsung Abdul Halim memperbarui identitas warna menjadi pastel dan dark mode lembut. Keputusan ini menggantikan ketentuan Crimson tetap/no redesign pada catatan sebelumnya. Struktur sidebar, rute, dan font tetap digunakan. Token baru ada di DESIGN_SYSTEM.md.

Checkpoint ini mencakup desain bersama, navigasi, dialog, kejujuran dashboard, dan dokumentasi. Backend tetap mengikuti Tahap 09 dan seterusnya; tidak dianggap selesai oleh perubahan UI. Model AI/editor bebas. Folder yang diperiksa belum merupakan repositori Git.

Bagian berikut menyimpan konteks keputusan awal; untuk status implementasi gunakan STATUS.md.  

Dokumen ini mencatat seluruh keputusan arsitektur, teknologi, dan tata kelola sistem yang telah disepakati, serta memelihara daftar keputusan bisnis yang masih **TERBUKA** (belum ditetapkan).

---

## 1. Keputusan Teknologi & Arsitektur (Stack)

| Komponen | Pilihan Teknologi | Alasan & Rasional bagi Pemula |
|---|---|---|
| **Aplikasi Utama** | Next.js (App Router) + React + TypeScript (Strict) | Menggabungkan antarmuka dan logika server dalam satu proyek terpadu. TypeScript menjamin tipe data aman sehingga mencegah kesalahan kalkulasi data bisnis. |
| **Gaya & Komponen** | Tailwind CSS + shadcn/ui disesuaikan | Menjaga visual Stitch tetap identik (Crimson `#BE123C`, dark `#95002A`, latar `#F8FAFC`). Komponen dialog, tabel, dan formulir konsisten tanpa redesign total. |
| **Basis Data** | PostgreSQL via Supabase | Basis data relasional andal untuk menjaga integritas transaksi anggota, pengadaan, inventaris barang, kasir, dan jurnal buku besar. |
| **Autentikasi & Berkas** | Supabase Auth + Private Storage | Pengelolaan sesi terpusat dengan hak akses ketat. Berkas legalitas, notulen, dan bukti transaksi disimpan privat (tertutup default). |
| **Backend & Mutasi Data** | Server Actions / Route Handlers + SQL RPC | Validasi hak akses dilakukan di server. Mutasi multi-tabel (misal penjualan: stok berkurang + kas bertambah + jurnal terbit) dieksekusi atomik via SQL RPC. |
| **Validasi Formulir** | Zod + React Hook Form | Satu skema validasi untuk tampilan browser dan server. Menghasilkan pesan kesalahan yang jelas dalam bahasa Indonesia. |
| **Pengujian (Testing)** | Vitest + Playwright + Database RLS Tests | Menguji kebenaran rumus finansial, alur pengguna di tablet dan komputer, serta ketahanan hak akses keamanan. |
| **Penyimpanan Kode** | Git lokal + GitHub Private Repository | Pelacakan riwayat perubahan kode secara bertahap dan pencadangan aman. |
| **Hosting Awal** | Vercel Hobby (Paket Gratis) | Untuk prototipe dan pembelajaran mandiri yang memenuhi ketentuan nonkomersial. Dilarang upgrade otomatis ke paket berbayar tanpa persetujuan. |

---

## 2. Keputusan Desain & Antarmuka Pengguna

1. **Mempertahankan Desain Stitch**:
   - Visual dari proyek Stitch adalah acuan tetap: kartu putih, sudut lembut (*rounded*), bayangan halus, sidebar kiri terstruktur, dan font Plus Jakarta Sans.
   - Tidak dilakukan perombakan tema (*no redesign*). Perbaikan difokuskan pada keterbacaan (*touch target* 44–48 px, ukuran teks 14–16 px pada tablet), navigasi rute lengkap, dan kondisi kosong (*empty state*).
2. **Kelengkapan Seluruh Alur Interaksi**:
   - Setiap tombol dan menu harus memiliki alur tuntas: form isian, validasi data, dialog konfirmasi, status berhasil, status gagal, dan penolakan izin akses. Tidak boleh ada tombol buntu tanpa fungsi.
3. **Penyajian Data yang Jujur**:
   - Dilarang menampilkan label “Real-Time”, “2FA Aktif Penuh”, “Tersimpan”, atau “Aman” jika fitur tersebut belum diimplementasikan dan diuji secara nyata.

---

## 3. Keputusan Pengelolaan Data & Finansial

1. **Presisi Moneter (Uang)**:
   - Nilai mata uang wajib menggunakan tipe data `NUMERIC` di PostgreSQL dan kalkulasi desimal berpresisi tinggi di server. Dilarang menggunakan tipe floating point JavaScript untuk pembukuan akuntansi.
   - Format tampilan: Bahasa Indonesia (`id-ID`), Rupiah (IDR). Zona waktu bisnis: `Asia/Jakarta` (WIB).
2. **Imutabilitas Transaksi Pembukuan**:
   - Data transaksi keuangan dan mutasi stok yang telah dibukukan (*status: posted*) tidak boleh diedit atau dihapus langsung di database.
   - Kesalahan pencatatan dikoreksi secara akuntansi menggunakan transaksi pembalikan (*reversal entry*).
3. **Keamanan Default Deny & RLS**:
   - Seluruh tabel database dilindungi Row Level Security (RLS). Akses default ditolak kecuali diizinkan oleh kebijakan peran (*role policy*).
   - Peran pengguna (*role*) dilarang disimpan di `user_metadata` yang bisa dimanipulasi oleh klien browser.
4. **Transformasi Arsitektur: Sistem Informasi Manajemen & Pemantauan Gerai**:
   - Berdasarkan arahan pengguna, sistem BUKAN aplikasi kasir toko fisik (POS). Sistem difokuskan sebagai **Pusat Komando & Pemantauan Operasional Gerai Manajer**.
   - Input rekap harian gerai dilakukan secara manual (default) dengan opsi integrasi API kelak di pengaturan.
   - Database disederhanakan dari belasan tabel transaksi retail menjadi 7 tabel inti pemantauan: `business_units`, `unit_daily_reports`, `tasks`, `products`, `members`, `user_roles`, `organization_profile`. Migrasi `20260923000007_clean_simple_schema.sql` sukses diterapkan.
   - Manajemen Tugas (`/pekerjaan`) dirombak total menjadi task & action hub dengan estetika gradient pastel.

---

## 4. Daftar Keputusan TERBUKA (Menunggu Keputusan Bisnis Nyata)

Status keputusan di bawah ini berstatus **TERBUKA** dan sengaja ditandai **Belum Ditetapkan** sampai terdapat dokumen atau konfirmasi resmi dari Bapak Abdul Halim / Pengurus Koperasi:

- [ ] **[TERBUKA-01] Nama Resmi Badan Hukum & Legalitas**:
  - *Kondisi Saat Ini*: Menggunakan nama tampilan sementara `Kopdes Merah Putih — Ladang Laweh`.
  - *Menunggu*: Nomor Akta Pendirian Notaris, SK Pengesahan Kemenkumham / Kemenkop, dan NPWP resmi koperasi.
- [ ] **[TERBUKA-02] Domisili & Rekening Bank Operasional**:
  - *Kondisi Saat Ini*: Data lokasi dan perbankan dikosongkan.
  - *Menunggu*: Alamat kantor definitif di Ladang Laweh serta nama bank dan nomor rekening resmi atas nama koperasi.
- [ ] **[TERBUKA-03] Susunan Pengurus & Struktur Organisasi**:
  - *Kondisi Saat Ini*: Pengguna tercatat adalah Bapak Abdul Halim sebagai Manajer/Pengelola.
  - *Menunggu*: Penetapan definitif Ketua, Sekretaris, Bendahara, Dewan Pengawas, dan pembagian wewenang persetujuan (*approval limit*).
- [ ] **[TERBUKA-04] Tanggal Pasti Pembukaan Fisik Operasional**:
  - *Kondisi Saat Ini*: Bernilai `null`, target periode `Awal 2027`.
  - *Menunggu*: Keputusan rapat pengurus mengenai tanggal peluncuran fisik gerai sembako.
- [ ] **[TERBUKA-05] Nilai Nominal Simpanan Pokok & Simpanan Wajib**:
  - *Kondisi Saat Ini*: Berstatus belum ditetapkan (nilai contoh pada Stitch Rp150.000 / Rp25.000 diabaikan).
  - *Menunggu*: Ketetapan nilai Simpanan Pokok dan Simpanan Wajib dalam AD/ART koperasi.
- [ ] **[TERBUKA-06] Modal Awal & Saldo Kas Pembukaan**:
  - *Kondisi Saat Ini*: Saldo kas awal berstatus belum ditetapkan (tidak diklaim Rp0 terverifikasi).
  - *Menunggu*: Rekonsiliasi setoran modal awal nyata oleh penanggung jawab keuangan.
- [ ] **[TERBUKA-07] Komoditas Awal & Metode HPP Gerai Sembako**:
  - *Kondisi Saat Ini*: Gerai sembako berstatus rencana.
  - *Menunggu*: Daftar pasokan komoditas awal sembako serta pemilihan metode HPP (FIFO vs Rata-Rata Tertimbang).
- [ ] **[TERBUKA-08] Kebijakan Pembagian SHU**:
  - *Kondisi Saat Ini*: Rumus persentase SHU dinonaktifkan (klausul Stitch 40% vs 70% diabaikan).
  - *Menunggu*: Anggaran Dasar koperasi mengenai persentase hak jasa modal, jasa anggota, dana cadangan, dan dana sosial.
- [ ] **[TERBUKA-09] Aktivasi Unit Simpan Pinjam (USP)**:
  - *Kondisi Saat Ini*: Modul USP berstatus nonaktif bawaan (*disabled by default*).
  - *Menunggu*: Izin operasional simpan pinjam dan kesiapan tata kelola risiko kredit.
- [ ] **[TERBUKA-10] Pemilihan Layanan Hosting untuk Operasional Fisik**:
  - *Kondisi Saat Ini*: Menggunakan Vercel Hobby gratis untuk tahap prototipe/belajar mandiri.
  - *Menunggu*: Evaluasi kepatuhan ketentuan Vercel Hobby versus kebutuhan migrasi ke paket organisasi/VPS menjelang operasional penuh.
