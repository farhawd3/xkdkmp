# PROJECT BRIEF — KOPDES MERAH PUTIH LADANG LAWEH

**Tanggal Dokumen**: 22 September 2026  
**Target Pelaksanaan**: Awal 2027  
**Pemilik Kebutuhan**: Abdul Halim (Pemula IT, mulai bertugas awal 2027)  
**Status Organisasi**: Persiapan (Bukan data demo; fase bisnis nyata)  
**Tampilan Nama Sementara**: Kopdes Merah Putih — Ladang Laweh  

---

## 1. Latar Belakang & Tujuan Proyek

Proyek ini bertujuan membangun aplikasi tata kelola, manajemen persiapan operasional, dan dashboard terpadu untuk Koperasi Desa Merah Putih di Ladang Laweh. 

Koperasi saat ini berada pada **Mode Persiapan** menuju target operasional fisik pada **Awal 2027**. Sistem ini dirancang untuk mendampingi Bapak Abdul Halim dalam mencatat seluruh persiapan legalitas, keanggotaan awal, rencana unit usaha, inventaris aset persiapan, tata kelola dokumen, hingga kesiapan operasional gerai sembako pertama tanpa manipulasi data atau klaim palsu.

---

## 2. Profil Pemilik Kebutuhan & Pendekatan Kerja

- **Pengguna Utama**: Abdul Halim.
- **Karakteristik**: Pemula di bidang teknologi informasi.
- **Prinsip Komunikasi**: Penjelasan teknis dan keputusan disajikan dalam bahasa Indonesia sederhana, lugas, tanpa istilah rumit yang membingungkan.
- **Keamanan Akun**: Akun pengguna, alamat email, NIK, dan data pribadi tidak boleh dikarang bebas (dummy fiktif) dalam basis data produksi.

---

## 3. Identitas Visual & Kontrak Desain

Desain mengacu pada referensi proyek Stitch yang telah dipilih:
- **Palet Warna Utama**: Crimson `#BE123C`, warna aksen gelap `#95002A`, latar belakang aplikasi `#F8FAFC`, dan kartu putih bersih (`#FFFFFF`).
- **Tipografi**: Plus Jakarta Sans.
- **Gaya Komponen**: Bentuk lembut (*rounded corners*), bayangan halus (*subtle shadow*), sidebar navigasi terstruktur, dan tata letak kartu (*card-based layout*).
- **Perangkat Sasaran**:
  - **Prioritas Utama**: Komputer (Desktop) dan Tablet (orientasi lanskap maupun potret). Target sentuh minimum 44–48 px dan ukuran teks utama 14–16 px agar nyaman digunakan pada layar sentuh.
  - **Perangkat Pendukung**: Handphone (Smartphone) tetap responsif dan layak digunakan untuk pemantauan serta tugas darurat.
- **Aturan Desain**: Mempertahankan karakter visual Stitch; memperbaiki kepadatan layout dan eror tampilan tanpa melakukan desain ulang total (*no total redesign*).

---

## 4. Kondisi Awal & Kontrak Data Produk

1. **Status Bisnis Persiapan**:
   - Status organisasi dimulai dari **Persiapan**.
   - Tanggal mulai operasional bernilai `null` sampai ditetapkan secara definitif oleh pengurus koperasi. Tanggal sistem komputer tidak di-hardcode ke tahun 2027.
2. **Ketiadaan Data Operasional Fiktif**:
   - Tidak ada anggota terverifikasi, saldo kas terverifikasi, modal disetor, transaksi penjualan, pinjaman, atau Sisa Hasil Usaha (SHU) awal.
   - Angka-angka pada file referensi HTML Stitch (seperti Rp1,4 miliar omzet, 1.247 anggota) adalah contoh prototipe dan **dilarang** dimasukkan sebagai data produksi awal.
3. **Unit Usaha Dinamis**:
   - Usulan unit usaha pertama adalah **Gerai Sembako** dengan status **Rencana**.
   - Sistem tidak boleh mengunci (*hardcode*) 7 unit usaha otomatis aktif.
   - Unit Simpan Pinjam (USP) dan unit layanan khusus default **Nonaktif** sampai terdapat izin dan regulasi resmi.
4. **Pemisahan Lingkungan**:
   - Lingkungan Demo/Pengembangan, Staging/Uji, dan Produksi dipisahkan secara tegas.
   - Mode Persiapan adalah status proses bisnis, bukan penanda data tiruan (*demo dummy*).
   - Sistem dilarang menampilkan data sampel palsu jika koneksi database gagal (*no fallback to mock data on error*).

---

## 5. Sumber Daya & Lokasi Workspace

- **Panduan Lengkap**: `brief/Panduan_Antigravity_Kopdes_Ladang_Laweh_2027.md` (Revisi 22 September 2026).
- **Metadata Referensi**: `brief/REFERENSI_DAN_ISI.json`.
- **Referensi Desain Stitch**: `references/stitch/stitch_koperasi_merah_putih_dashboard/` (berisi 9 halaman HTML referensi, 2 file spesifikasi desain, dan aset pratinjau).
- **Koleksi Prompt**: `prompts/` (29 file prompt bertahap 00–22 dan 90–93).
- **Dokumentasi Proyek**: `docs/`.
- **Aturan Kerja Antigravity**: `.agents/rules/kopdes-rules.md` dan `AGENTS.md`.

---

## 6. Rencana Tahapan Rilis (Roadmap)

1. **Rilis 1: Fondasi & Tata Kelola Persiapan**
   - Dashboard kesiapan persiapan jujur.
   - Pendaftaran calon anggota & pencatatan anggota.
   - Manajemen unit usaha rencana & checklist prasyarat aktivasi.
   - Manajemen tugas, kalender agenda, notulen rapat, dan dokumen tata kelola (AD/ART).
   - Pengaturan hak akses peran dasar.
2. **Rilis 2: Operasional Gerai Sembako & Akuntansi Dasar**
   - Master data barang, kategori, satuan, dan kartu stok.
   - Alur pengadaan (Pemasok, PO, Penerimaan Barang, Tagihan, Pembayaran).
   - Kasir penjualan tunai/manual non-tunai, mutasi stok otomatis, tutup shift.
   - Buku simpanan pokok & wajib, kas/bank, jurnal umum berpasangan seimbang, dan laporan keuangan dasar.
3. **Rilis 3: Fitur Lanjutan (Opsional & Bertahap)**
   - Asisten AI pembantu analisis data internal (berdasarkan izin ketat).
   - Unit Simpan Pinjam (USP) dan regulasi kepatuhan simpan pinjam.
   - Integrasi pembayaran otomatis (QRIS) dan portal anggota digital.
