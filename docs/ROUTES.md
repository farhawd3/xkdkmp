# ROUTES & PERMISSION MATRIX — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Spesifikasi Navigasi dan Batas Akses  

Dokumen ini memetakan arsitektur rute, subhalaman, kebutuhan status bisnis organisasi/unit, tujuan setiap tombol aksi penting, serta matriks perizinan peran (*Role-Based Access Control*).

---

## 1. Peta Rute Navigasi (Maksimal 2 Tingkat)

### A. Autentikasi & Akun
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/login` | Portal Masuk Eksekutif | Semua | Publik / Tamu | Form email & kata sandi; verifikasi via Supabase Auth. Tanpa pemilih peran manual. |
| `/lupa-password` | Permohonan Reset Password | Semua | Publik / Tamu | Input email terdaftar untuk pengiriman tautan pemulihan sandi. |
| `/reset-password` | Pengaturan Sandi Baru | Semua | Publik (Token Sah) | Form input sandi baru setelah validasi token pemulihan dari email. |
| `/profil` | Profil Pengguna | Semua | Semua Pengguna Login | Informasi profil pengguna aktif, ubah sandi, lihat riwayat sesi login. |
| `/notifikasi` | Pusat Notifikasi | Semua | Semua Pengguna Login | Daftar pemberitahuan tugas, persetujuan, dan pengingat agenda. |
| `/bantuan` | Panduan & Bantuan Teknis | Semua | Semua Pengguna Login | Petunjuk penggunaan aplikasi dalam bahasa Indonesia sederhana untuk pemula. |

---

### B. Kelompok Ringkasan & Persiapan
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/dashboard` | Dashboard Terpadu | Persiapan & Aktif | Semua Pengguna Login | Ringkasan kondisi nyata. Menampilkan checklist persiapan saat masa persiapan; metrik omzet/stok hanya jika ada unit aktif. |
| `/persiapan` | Kesiapan Operasional | Persiapan | Admin, Manajer, Pengurus, Pengawas | Checklist kesiapan fisik & legalitas gerai, PIC penanggung jawab, persentase siap buka, bukti verifikasi. |

---

### C. Kelompok Kelembagaan
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/anggota` | Data Keanggotaan | Semua | Admin, Manajer, Bendahara, Pengurus, Pengawas | Daftar anggota, filter status (Calon, Aktif, Nonaktif), pencarian nama/NIK tersensor. Tombol: Ekspor XLSX, Tambah Anggota. |
| `/anggota/tambah` | Pendaftaran Anggota Baru | Semua | Admin, Manajer, Pengurus | Formulir pendaftaran calon anggota, verifikasi NIK, upload berkas KTP. *Tidak otomatis membuat saldo kas*. |
| `/anggota/[id]` | Detail & Buku Anggota | Semua | Admin, Manajer, Bendahara, Pengurus, Pengawas | Detail profil anggota, riwayat perubahan status, buku tabungan simpanan (Pokok, Wajib, Sukarela), riwayat transaksi belanja. |

---

### D. Kelompok Usaha (Operasional)
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/unit-usaha` | Manajemen Unit Usaha | Semua | Admin, Manajer, Pengurus, Pengawas | Daftar unit usaha dinamis (Gerai Sembako = Rencana). Tombol: Tambah Usul Unit Baru, Kelola Kesiapan. |
| `/unit-usaha/[id]` | Detail & Kesiapan Unit | Semua | Admin, Manajer, Pengurus, Pengawas, Operator Unit | Rincian unit, PIC pengelola, daftar aset unit, persyaratan aktivasi menuju Siap Buka/Aktif. |
| `/stok` | Barang & Kartu Stok | Semua | Admin, Manajer, Operator Gudang, Pengawas | Master barang dagangan, kategori, satuan baku, kartu mutasi stok, batas buffer minimum, stok opname fisik. |
| `/aset` | Aset Tetap Operasional | Semua | Admin, Manajer, Bendahara, Pengawas | Inventaris perlengkapan (rak toko, timbangan, meja kasir, komputer). **Terpisah dari stok barang jual**. |
| `/pembelian` | Pengadaan & Tagihan | Semua | Admin, Manajer, Bendahara, Operator Gudang | Daftar pemasok, pembuatan PO, verifikasi Penerimaan Barang (menambah stok), pencatatan tagihan, pembayaran utang. |
| `/penjualan` | Kasir & Riwayat Transaksi | Minimal 1 Unit Aktif | Admin, Manajer, Bendahara, Kasir Unit | Antarmuka kasir POS (hanya untuk unit berstatus Aktif), buka/tutup shift, transaksi atomik, cetak struk, retur penjualan. |
| `/penjualan/[id]` | Rincian Struk & Mutasi | Semua | Admin, Manajer, Bendahara, Kasir Unit, Pengawas | Detail struk penjualan, metode bayar (tunai/manual non-tunai), HPP barang terjual, nomor jurnal akuntansi terkait. |

---

### E. Kelompok Keuangan & Laporan
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/keuangan` | Kas, Bank & Simpanan | Semua | Admin, Manajer, Bendahara, Pengurus, Pengawas | Saldo kas fisik, mutasi bank operasional, penerimaan setoran simpanan pokok/wajib, biaya operasional persiapan. |
| `/keuangan/jurnal` | Buku Jurnal Umum | Semua | Admin, Manajer, Bendahara, Pengawas | Daftar ayat jurnal akuntansi berpasangan (Debit = Kredit). Formulir jurnal koreksi/pembalikan. Tombol: Buat Jurnal Baru. |
| `/laporan` | Pusat Laporan Keuangan | Semua | Admin, Manajer, Bendahara, Pengurus, Pengawas | Laporan Penjualan, Laporan Mutasi Stok, Buku Besar, Neraca Saldo, Laporan Laba/Rugi, Arus Kas. Tombol: Ekspor PDF/XLSX. |

---

### F. Kelompok Manajemen Pekerjaan & Tata Kelola
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/pekerjaan` | Tugas & Agenda Terpadu | Semua | Admin, Manajer, Pengurus, Pengawas, Operator | Daftar tugas manajerial (pengganti menu tugas yang hilang di Stitch), kalender jadwal operasional, bukti verifikasi tugas. |
| `/tata-kelola` | Dokumen Legalitas & RAT | Semua | Admin, Manajer, Pengurus, Pengawas | Arsip AD/ART, SK Kemenkop, SOP gerai, notulen rapat pengurus, sidang RAT, dan modul simulasi perhitungan SHU. |

---

### G. Kelompok Sistem & Penanganan Status
| Rute | Nama Layar | Status Bisnis | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|---|
| `/pengaturan` | Konfigurasi Sistem | Semua | Admin, Manajer | Profil koperasi di Ladang Laweh, manajemen akun staf/operator, kebijakan nilai simpanan, log audit aktivitas sistem. |
| `/forbidden` | Akses Ditolak (403) | Semua | Semua Pengguna Login | Tampilan penolakan akses ramah pengguna jika peran tidak memiliki izin membuka halaman. |
| `/not-found` | Halaman Tidak Ditemukan (404) | Semua | Semua Pengguna | Tampilan navigasi kembali jika URL tidak valid. |

---

## 2. Matriks Hak Akses Peran (Permission Matrix)

Sistem menerapkan **6 Peran Pengguna Resmi** berbasis database:
1. **Admin**: Pengelola sistem teknis dan konfigurasi akun.
2. **Manajer (Bpk. Abdul Halim)**: Penanggung jawab operasional harian, pemantauan, verifikasi tugas, dan persetujuan bertingkat.
3. **Bendahara**: Pengelola kas, simpanan anggota, pembayaran tagihan, jurnal, dan laporan keuangan.
4. **Pengurus**: Penetap kebijakan organisasi, pengesah pembukaan unit usaha, dan pimpinan rapat RAT.
5. **Pengawas**: Pihak peninjau (*read-only*) seluruh transaksi, stok, laporan, serta pencatat temuan audit.
6. **Operator Unit**: Staf pelaksana gerai (Kasir atau Petugas Gudang) dengan cakupan terbatas pada unit tugasnya.

| Modul / Tindakan Utama | Admin | Manajer | Bendahara | Pengurus | Pengawas | Operator Unit |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Konfigurasi Sistem & Pengguna** | Penuh | Kelola | Baca | Baca | Baca | Tolak |
| **Kelola Checklist Persiapan** | Penuh | Penuh | Edit | Penuh | Baca | Tolak |
| **Pendaftaran & Edit Anggota** | Penuh | Penuh | Baca | Penuh | Baca | Tolak |
| **Lihat NIK Anggota Utuh** | Penuh | Penuh | Penuh | Penuh | Sensor | Sensor |
| **Usul & Ubah Status Unit Usaha** | Penuh | Usul | Usul | Sahkan | Baca | Tolak |
| **Input Master Barang & Satuan** | Penuh | Penuh | Baca | Baca | Baca | Usul |
| **Buat Pesanan Pembelian (PO)** | Penuh | Penuh | Baca | Baca | Baca | Usul |
| **Setujui PO (Approval)** | Tolak | Penuh | Verifikasi | Penuh | Baca | Tolak |
| **Verifikasi Penerimaan Barang** | Penuh | Penuh | Baca | Baca | Baca | Penuh (Gudang) |
| **Catat Tagihan & Pembayaran** | Tolak | Setujui | Penuh | Baca | Baca | Tolak |
| **Transaksi Kasir POS** | Tolak | Tolak | Tolak | Tolak | Tolak | Penuh (Kasir) |
| **Otorisasi Retur Penjualan** | Tolak | Penuh | Penuh | Tolak | Baca | Ajukan |
| **Buka & Tutup Shift Kasir** | Tolak | Verifikasi | Setoran | Tolak | Baca | Penuh (Kasir) |
| **Penerimaan Simpanan Anggota** | Tolak | Baca | Penuh | Baca | Baca | Tolak |
| **Posting Jurnal & Koreksi** | Tolak | Baca | Penuh | Baca | Baca | Tolak |
| **Simulasi & Pengesahan SHU** | Tolak | Simulasi | Hitung | Sahkan RAT | Baca | Tolak |
| **Pencairan SHU Anggota** | Tolak | Setujui | Eksekusi | Pantau | Baca | Tolak |
| **Lihat Log Audit Sistem** | Penuh | Penuh | Tolak | Penuh | Penuh | Tolak |

---

## 3. Ketentuan Penanganan Aksi & Tombol

1. **Eliminasi Tautan Buntu (`href="#"`)**:
   - Seluruh tombol pada antarmuka diarahkan ke rute spesifik, modal aksi interaktif, atau laci formulir (*drawer*).
2. **Kondisi Tombol Nonaktif (*Disabled State*)**:
   - Jika pengguna tidak memiliki izin peran, tombol aksi disembunyikan atau ditampilkan nonaktif dengan penjelasan tooltip (*misal: "Memerlukan izin Manajer"*).
3. **Ketergantungan Status Bisnis**:
   - Tombol transaksi kasir (`/penjualan`) otomatis nonaktif jika unit usaha yang dipilih masih berstatus `Rencana` atau `Persiapan`.
