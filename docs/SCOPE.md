# SCOPE & BATASAN SISTEM — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Batasan Ruang Lingkup MVP & Roadmap  

Dokumen ini menetapkan ruang lingkup produk layak minimum (*Minimum Viable Product* / MVP), batasan fungsional per rilis, dan daftar fitur yang ditunda ke dalam antrean (*backlog*).

---

## 1. Ruang Lingkup MVP (Minimum Viable Product)

MVP dirancang khusus untuk mendampingi Bapak Abdul Halim dalam mengelola fase persiapan dan pengoperasian gerai fisik pertama di Ladang Laweh:

1. **Satu Organisasi Koperasi Tunggal**: Sistem diperuntukkan secara khusus bagi *Kopdes Merah Putih — Ladang Laweh* (bukan platform multi-koperasi komersial).
2. **Unit Usaha Dinamis**:
   - Sistem dimulai dengan usulan unit pertama: **Gerai Sembako** berstatus `Rencana`.
   - Jumlah unit usaha dapat ditambah/diubah sesuai kebutuhan riil, tanpa mengunci 7 unit otomatis aktif.
3. **Metode Transaksi Penjualan Terkendali**:
   - Hanya melayani **Penjualan Tunai** dan **Pembayaran Non-Tunai Konfirmasi Manual** (Transfer bank atau QRIS statis yang dicocokkan langsung oleh kasir).
   - **Nir-Piutang Penjualan**: Tidak melayani penjualan kredit/bon/piutang pelanggan di kasir pada tahap awal. Semua transaksi wajib diselesaikan lunas di tempat.
4. **Kelembagaan Anggota Terpadu**:
   - Pencatatan calon anggota, verifikasi berkas, dan buku simpanan pokok/wajib.
   - Pendaftaran anggota terpisah dari transaksi penyetoran uang.
5. **Manajemen Persiapan & Tata Kelola**:
   - Papan checklist kesiapan menuju target Awal 2027 dengan lampiran bukti.
   - Manajemen tugas manajerial, agenda kalender operasional, dan arsip dokumen AD/ART.
6. **Akuntansi & Keuangan Terpercaya**:
   - Pembukuan berpasangan seimbang (Debit = Kredit) menggunakan tipe data desimal presisi `NUMERIC`.
   - Imutabilitas transaksi: data yang sudah dibukukan tidak bisa diedit atau dihapus sembarangan.

---

## 2. Batasan Rilis Bertahap

### A. Rilis 1: Manajemen Persiapan (Preparation Release)
- **Target Pengguna**: Abdul Halim (Manajer), Pengurus, Pengawas, dan Admin.
- **Fokus Utama**:
  - Dashboard kesiapan operasional yang jujur (kondisi kosong tanpa manipulasi angka).
  - Pendaftaran dan verifikasi keanggotaan awal.
  - Perencanaan unit usaha dan penyusunan checklist pembukaan fisik gerai sembako.
  - Pengelolaan tugas harian, jadwal kalender agenda, dan pengarsipan notulen/AD-ART.
  - Pengaturan hak akses peran (*Role-Based Access Control*).

### B. Rilis 2: Operasional Gerai Sembako & Keuangan (Store Operations Release)
- **Target Pengguna**: Tambahan Kasir dan Petugas Gudang Unit Sembako.
- **Fokus Utama**:
  - Master data komoditas sembako, SKU unik, dan kartu mutasi stok gudang.
  - Alur pengadaan lengkap: Pesanan Pembelian (PO), Penerimaan Barang, Tagihan, dan Pembayaran Pemasok.
  - Aplikasi kasir POS: buka/tutup shift kasir, transaksi atomik, cetak struk, dan penanganan retur penjualan.
  - Pengelolaan kas fisik, setoran simpanan anggota, pencatatan beban operasional, dan rekonsiliasi bank.
  - Pelaporan keuangan: Laporan Penjualan, Laba Rugi Gerai, Neraca Saldo, dan Laporan Arus Kas.

---

## 3. Fitur Ditunda ke Backlog / Dihapus dari MVP

Untuk menjaga fokus dan keandalan sistem pemula, fitur-fitur berikut **sengaja tidak dimasukkan ke dalam MVP** dan tombolnya dilarang ditampilkan seolah-olah sudah berfungsi:

| Fitur / Modul | Alasan Penundaan & Status Kebijakan | Rencana Penanganan |
|---|---|---|
| **Unit Simpan Pinjam (USP)** | Memerlukan regulasi kepatuhan ketat, perizinan OJK/Kemenkop, dan manajemen risiko kredit yang matang. Default **Nonaktif**. | Ditunda ke Tahap 22 (Opsional). |
| **Payment Gateway Otomatis** | Menghindari biaya integrasi pihak ketiga (Midtrans/Xendit) dan izin akun korporasi yang belum selesai. | Gunakan konfirmasi transfer/QRIS manual di kasir. |
| **Integrasi API Perbankan** | Rekening bank koperasi belum definitif dan paket Vercel Hobby tidak cocok untuk webhook finansial berbayar. | Catat mutasi bank via rekonsiliasi manual di Tahap 15. |
| **WhatsApp Gateway Otomatis** | Memerlukan biaya langganan API berbayar (*monthly fee*) yang melanggar prinsip hemat biaya awal. | Gunakan tautan pesan manual (*wa.me*) jika mendesak. |
| **Modul Khusus Farmasi/Klinik** | Gerai obat dan resep medis bukan unit prioritas desa Ladang Laweh saat ini. | Dihapus dari MVP; fokus penuh pada Gerai Sembako. |
| **Asisten AI Terintegrasi** | Menghindari ketergantungan biaya API token AI di awal pembangunan. | Ditunda ke Tahap 21 (Opsional). |
