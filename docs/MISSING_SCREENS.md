# DOKUMEN RANCANGAN LAYAR TAMBAHAN — KOPDES LADANG LAWEH
*(docs/MISSING_SCREENS.md)*

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Spesifikasi Layar Tambahan Lengkap (Style Stitch Asli)  

Dokumen ini mendokumentasikan seluruh layar, modal dialog, formulir laci (*drawer*), dan panel aksi yang belum tersedia pada paket ekspor Stitch lama, serta menetapkan komponen yang diwarisi dan penanganan status antarmukanya.

---

## 1. Inventaris Layar & Komponen Tambahan (Missing Screens)

| ID Komponen | Nama Layar / Komponen | Tipe Antarmuka | Layar Acuan Stitch | Komponen yang Diwarisi | Breakpoint Utama |
|---|---|---|---|---|---|
| **SCR-ADD-01** | Halaman Daftar Tugas Terpadu (`/pekerjaan`) | Halaman Penuh | `kalender_...` & `dashboard_...` | Sidebar navigasi, kartu metrik atas, tabel baris tugas berprioritas, tab filter. | Desktop (12-col), Tablet (1-col card stack). |
| **SCR-ADD-02** | Form Modal "Buat Agenda Baru" (Contoh Wajib) | Modal Dialog (640px) | `kalender_...` | Card putih, tombol Crimson, Plus Jakarta Sans, status badge. | Tablet (sentuh 48px), Desktop, Mobile (Sheet). |
| **SCR-ADD-03** | Pendaftaran Anggota Lengkap (`/anggota/tambah`) | Halaman / Panel Lebar | `manajemen_data_anggota_...` | Header modul, kartu putih berbingkai lembut, validasi Zod form. | Desktop (2 kolom input), Tablet/Mobile (1 kolom). |
| **SCR-ADD-04** | Detail & Buku Tabungan Anggota (`/anggota/[id]`) | Halaman Penuh | `manajemen_data_anggota_...` | Tabs bar, tabel mutasi simpanan, lencana status keanggotaan. | Desktop & Tablet adaptif. |
| **SCR-ADD-05** | Form Pesanan Pembelian / PO (`/pembelian/po/baru`) | Halaman Penuh | `inventaris_...` | Pemilih barang, tabel item PO, kalkulasi PPN/total otomatis. | Desktop & Tablet lanskap. |
| **SCR-ADD-06** | Modal Persetujuan & Penolakan PO | Modal Dialog (520px) | `inventaris_...` | Tombol hijau/merah, textarea alasan penolakan, rincian biaya. | Semua breakpoint. |
| **SCR-ADD-07** | Form Verifikasi Penerimaan Barang (*Goods Receipt*) | Panel Laci / Modal | `inventaris_...` | Input qty diterima riil, catatan fisik barang cacat/parsial. | Tablet & Desktop. |
| **SCR-ADD-08** | Antarmuka Kasir POS Lengkap (`/penjualan/kasir`) | Halaman Khusus Kasir | `manajemen_gerai_...` | Grid produk sembako visual, tombol angka cepat, keranjang kanan. | Prioritas Tablet Meja (sentuh 48px). |
| **SCR-ADD-09** | Modal Review Pembayaran & Cetak Struk | Modal Dialog (480px) | `portal_masuk_...` & POS | Kalkulator uang diterima, kembalian, preview struk 58mm/80mm. | Tablet Kasir & Desktop. |
| **SCR-ADD-10** | Modal Tutup Shift Kasir (*Blind Count*) | Modal Dialog (540px) | `manajemen_gerai_...` | Input kas fisik register, perbandingan sistem, berita acara selisih. | Tablet Kasir. |
| **SCR-ADD-11** | Modal Jurnal Penyesuaian Seimbang (Multi-baris) | Modal Lebar (800px) | `laporan_keuangan_...` | Baris akun dinamis, validasi otomatis Debit = Kredit. | Desktop & Tablet Lanskap. |
| **SCR-ADD-12** | Halaman Pemulihan Sandi (`/lupa-password`, `/reset-password`)| Halaman Penuh | `portal_masuk_...` | Kolom kanan tengah, kartu putih, logo Merah Putih, input aman. | Desktop, Tablet, Mobile responsif. |
| **SCR-ADD-13** | Halaman Akses Ditolak (`/forbidden` 403) | Halaman Status | `portal_masuk_...` | Ilustrasi perisai netral, penjelasan izin peran, tombol kembali. | Semua breakpoint. |

---

## 2. Spesifikasi Rinci: Form "Buat Agenda Baru" (Contoh Wajib)

Sesuai instruksi Prompt 01A, perancangan form modal ini dijadikan contoh baku penerapan komponen Stitch yang konsisten:

### A. Struktur Form Modal (`SCR-ADD-02`)
- **Penempatan**: Modal Dialog di tengah layar (lebar 640 px di desktop/tablet; otomatis menjadi *bottom sheet* di layar ponsel).
- **Header Modal**:
  - Judul: *"Buat Agenda Jadwal Operasional Baru"*.
  - Subjudul: *"Jadwalkan rapat pengurus, inspeksi audit, atau rencana operasional gerai sembako."*
  - Tombol Tutup (`X`) di sudut kanan atas.
- **Formulir Isian & Validasi**:
  1. **Judul Agenda (Wajib)**: Input teks, placeholder *"Misal: Rapat Pleno Persiapan Gerai Sembako"*, min 5 char.
  2. **Kategori Agenda (Wajib)**: Dropdown pilihan:
     - `Rapat Pengurus` (Badge Amber `#D97706`)
     - `Audit & Pengawasan` (Badge Indigo `#6366F1`)
     - `Operasional Gerai` (Badge Crimson `#BE123C`)
     - `Kewajiban Legal & Notaris` (Badge Hijau `#059669`)
  3. **Rentang Tanggal & Waktu (Wajib)**:
     - Tanggal Pelaksanaan: Datepicker baku format `YYYY-MM-DD`.
     - Pilihan Centang: `Seharian Penuh (All-Day Event)`.
     - Jika tidak seharian: Jam Mulai dan Jam Akhir (Zona Waktu: `Asia/Jakarta / WIB`). Validasi: Jam akhir wajib lebih besar dari jam mulai.
  4. **Keterkaitan Unit Usaha (Opsional)**: Dropdown pilihan unit (*Konsolidasi Pusat / Gerai Sembako Ladang Laweh*).
  5. **Penanggung Jawab / PIC (Wajib)**: Dropdown staf/pengurus terdaftar (misal: Bpk. Abdul Halim).
  6. **Lokasi / Tautan Pertemuan (Wajib)**:
     - Opsi Tab: `Lokasi Fisik` (contoh: *"Kantor Koperasi Desa Ladang Laweh"*) atau `Tautan Online` (validasi protokol URL `http://` atau `https://`).
  7. **Deskripsi & Agenda Pembahasan (Opsional)**: Textarea multi-baris untuk poin bahasan.
  8. **Lampiran Berkas Pendukung (Opsional)**: Area drag-and-drop berkas (PDF, DOCX, JPG; ukuran maksimal 5 MB per berkas).
  9. **Tugas Terkait (Opsional)**: Menghubungkan agenda dengan daftar tugas persiapan yang aktif di modul `/pekerjaan`.
- **Tombol Aksi Bawah (*Footer Action*)**:
  - Tombol **Batal**: Menutup form; jika terdapat isian yang sudah diketik, sistem memunculkan konfirmasi *"Perubahan belum disimpan. Yakin ingin membatalkan?"*.
  - Tombol **Simpan Agenda**: Tombol utama berwarna Crimson `#BE123C` dengan animasi pemrosesan (*loading state*) saat validasi berhasil.

### B. Penanganan Status Interaksi (*States*)
- **Status Memuat (*Loading*)**: Tombol simpan menampilkan teks *"Menyimpan Agenda..."* dengan status disabled agar tidak terjadi klik ganda.
- **Status Gagal (*Error*)**: Kotak pemberitahuan merah lembut muncul di atas form; isian yang sudah diketik pengguna **tetap dipertahankan** (tidak di-reset).
- **Status Berhasil (*Success*)**: Notifikasi hijau muncul (*toast*), modal tertutup, dan kalender operasional langsung menampilkan agenda baru pada kotak tanggal yang tepat.
- **Aksi Lanjutan**: Klik pada kartu agenda kalender menyediakan tombol **Edit Agenda**, **Jadwal Ulang**, dan **Batalkan Agenda** (dengan wajib mengisi alasan pembatalan).

---

## 3. Penanganan 9 Kondisi Antarmuka Khusus (*Special UI States*)

Seluruh layar tambahan wajib menyediakan rancangan 9 kondisi status berikut:
1. **Loading State**: Tampilan kerangka abu-abu berkilau (*skeleton loading*) berdimensi persis sama dengan kartu data asli.
2. **Empty State**: Ilustrasi netral, pesan bersahabat bahwa data masih dalam persiapan, dan tombol ajakan memulai input pertama.
3. **No-Results State**: Tampilan jika pencarian/filter tidak menemukan data, disertai tombol *"Bersihkan Filter"*.
4. **Invalid Form State**: Pesan validasi Zod berwarna merah tegas di bawah field isian yang tidak memenuhi aturan.
5. **Error State**: Pesan kesalahan sistem dalam bahasa Indonesia lugas disertai tombol *"Coba Lagi"*.
6. **Pending/Processing State**: Tombol aksi dikunci (*disabled*) dengan spinner lembut untuk mencegah pengiriman berulang.
7. **Offline Warning**: Banner atas berwarna kuning jika koneksi internet terputus pada perangkat tablet.
8. **Permission Denied (403)**: Informasi jelas bahwa wewenang peran akun tidak mencukupi untuk mengeksekusi aksi.
9. **Unsaved Changes Dialog**: Dialog peringatan jika pengguna hendak berpindah halaman saat formulir belum tersimpan.
