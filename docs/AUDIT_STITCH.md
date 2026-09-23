# AUDIT REFERENSI STITCH — KOPDES LADANG LAWEH

**Tanggal Audit**: 22 September 2026  
**Objek Audit**: 9 berkas `code.html`, 2 berkas spesifikasi desain (`design.md` & `DESIGN.md`), dan aset visual pada `references/stitch/stitch_koperasi_merah_putih_dashboard/`  
**Auditor**: Technical Lead & Product Designer Kopdes Ladang Laweh  

---

## 1. Ringkasan Eksekutif Hasil Audit

Audit mendalam dilakukan terhadap kode referensi Stitch untuk mengidentifikasi kesiapan teknis, konsistensi data finansial, keamanan, dan kelayakan penggunaan pada target perangkat tablet/komputer.

**Status Berkas Sumber**:
- **HTML (9 Berkas)**: Seluruh 9 berkas HTML terbaca lengkap dan dijadikan sumber struktur layout.
- **Gambar Tangkapan Layar (PNG)**: 5 gambar valid (Dashboard, Gerai, Inventaris, Pengaturan, Portal Masuk). 4 gambar lainnya (*Anggota, Simpan Pinjam, Kalender, Laporan/SHU*) berstatus **rusak/gagal tangkap** (memiliki hash SHA-256 identik `6c9a02e2...` yang berisi visual eror pengambilan gambar). Struktur halaman tersebut dianalisis langsung dari berkas `code.html`.
- **Desain Spesifikasi (2 Berkas)**: Terdapat `design.md` (token Material-3 dasar) dan `DESIGN.md` (token dengan penambahan aksen crimson). Keduanya disatukan dalam `docs/DESIGN_SYSTEM.md`.

---

## 2. Temuan Audit Berdasarkan Prioritas

### Kategori P0: Kritis (Keamanan, Otorisasi & Integritas Finansial)

| ID | Lokasi Sumber | Deskripsi Masalah | Dampak | Solusi & Tahap Implementasi |
|---|---|---|---|---|
| **P0-01** | `portal_masuk_eksekutif_.../code.html` (L:230–276) | Form login menyediakan pemilih peran (*role selector*) bebas (Manajer, Pengurus, Supervisor) dan tombol login hanya memicu jeda `setTimeout` + `alert()` palsu. Passkey juga hanya `alert()`. | Pengguna bisa memilih peran sendiri di browser; tidak ada autentikasi nyata. | Peran disimpan di database. Login menggunakan Supabase Auth dengan Server Action. Fitur passkey disembunyikan sampai siap. *(Tahap 10)* |
| **P0-02** | `laporan_keuangan_.../code.html` (L:337–341) | Form entri jurnal penyesuaian hanya mengeksekusi `alert('Jurnal berhasil dibukukan')` dan menutup modal tanpa memvalidasi keseimbangan Debit/Kredit atau menyimpan data. | Pembukuan palsu tanpa kebenaran saldo akuntansi. | Implementasi mesin jurnal seimbang atomik di PostgreSQL dengan constraint Debit = Kredit. *(Tahap 12)* |
| **P0-03** | `laporan_keuangan_.../code.html` (Tabel Unit vs Header) | - Total omzet baris unit: Rp1.445.500.000, tetapi ringkasan header tertulis Rp1.482.500.000 (**Selisih Rp37.000.000**).<br>- Total beban baris unit: Rp1.332.650.000 vs header Rp1.333.650.000 (**Selisih Rp1.000.000**).<br>- Simulasi pra-RAT per anggota diberi badge **"Siap Dicairkan"**. | Data laporan keuangan manipulatif; simulasi SHU rancu dengan pencairan kas nyata. | Angka laporan dihitung dinamis dari satu sumber transaksi (Single Source of Truth). Simulasi pra-RAT dipisahkan tegas dari pengesahan dan pencairan kas. *(Tahap 07, 16, 17)* |
| **P0-04** | `manajemen_data_anggota_.../code.html` (L:241) | Nomor Induk Kependudukan (NIK 16 digit) seluruh anggota terpampang utuh tanpa penyensoran pada tabel umum. Form pendaftaran langsung mengunci simpanan pokok Rp150.000 seolah otomatis terbayar. | Pelanggaran privasi data pribadi (UU PDP); pendaftaran anggota mencatat saldo tanpa uang riil. | Sensor NIK di server (`3372********0001`). Pendaftaran anggota tidak otomatis membuat mutasi kas; simpanan butuh transaksi terpisah. *(Tahap 04, 11, 12)* |

---

### Kategori P1: Utama (Fungsi Hilang, Alur Buntu & Integritas Stok)

| ID | Lokasi Sumber | Deskripsi Masalah | Dampak | Solusi & Tahap Implementasi |
|---|---|---|---|---|
| **P1-01** | Seluruh Sidebar Navigasi | Menu "Tugas" (`data-path="tugas"`) ada di seluruh sidebar tetapi **tidak ada halaman HTML pendukungnya** dalam paket ZIP. | Tombol navigasi menu utama buntu. | Membangun modul Tugas terpadu di dalam kelompok Manajemen Pekerjaan & Tata Kelola. *(Tahap 05, 11)* |
| **P1-02** | `modul_simpan_pinjam_.../code.html` (L:648–665) | Kode JavaScript kalkulator pinjaman USP terpotong di tengah jalan (`let monthlyMargin = amount * marginRate;</div>...`) dan bercampur tag penutup HTML. Menggunakan istilah bunga flat 0,8% dan anuitas campur aduk. | Script error saat dieksekusi browser; logika kredit tidak konsisten. | Modul USP default nonaktif di MVP. Kalkulator pinjaman dinonaktifkan sampai izin regulasi resmi dipenuhi. *(Tahap 01B, 22)* |
| **P1-03** | `inventaris_manajemen_.../code.html` (L:307, 429, 442) | - Kode SKU `SKU-APT-0288` dipakai untuk dua produk berbeda (*Paracetamol 500mg* dan *Amoxicillin 500mg*).<br>- Beras Ramos 5kg tersisa **4 Zak**, tetapi statusnya bertuliskan **"Stok Habis"**. | Kerancuan pelacakan stok; status persediaan tidak akurat. | Basis data menerapkan *unique constraint* pada SKU. Status stok (Tersedia, Menipis, Habis) dihitung otomatis dari kartu stok. *(Tahap 06, 13)* |
| **P1-04** | `dashboard_...` vs `pengaturan_.../code.html` | - Dashboard mencatat SHU anggota 40%; Pengaturan mencatat 70% Jasa Anggota & 30% Cadangan.<br>- Seluruh layar mengunci (*hardcode*) 7 unit usaha otomatis aktif. | Inkonsistensi aturan AD/ART; tidak sesuai kondisi desa Ladang Laweh. | Menjadikan persentase SHU sebagai parameter kebijakan tersimpan di database. Unit usaha bersifat dinamis; gerai sembako usulan awal berstatus Rencana. *(Tahap 03, 04, 17)* |

---

### Kategori P2: Tampilan & Kerapian (UI/UX, Kontras & Placeholder)

| ID | Lokasi Sumber | Deskripsi Masalah | Dampak | Solusi & Tahap Implementasi |
|---|---|---|---|---|
| **P2-01** | Seluruh Berkas Mockup | Nama manajer tertulis "Ibu Siti Rahmawati", lokasi Solo/Palur (`SOL`), rekening contoh BCA/BRI, dan tanggal statis tahun 2025. | Identitas fiktif tidak relevan dengan pemilik kebutuhan. | Ganti profil manajer dengan Abdul Halim, lokasi Ladang Laweh, mode Persiapan menuju target Awal 2027 (tanggal riil `Asia/Jakarta`). *(Tahap 02, 03)* |
| **P2-02** | Seluruh Berkas Mockup | Banyak teks navigasi dan label berukuran 10–11 px (`text-[10px]`); target sentuh tombol kecil di bawah 36 px. | Sulit dibaca dan rentan salah sentuh pada layar tablet. | Mengadopsi standar tablet: teks utama 14–16 px, target sentuh minimum 44–48 px. *(Tahap 01A, 02)* |
| **P2-03** | Seluruh Berkas Mockup | Tombol aksi penting (PO, Otorisasi Kasir, Ekspor XLSX, Detail Vendor, Pengaturan) memakai tautan kosong `href="#"` tanpa alur tuntas. | Pengguna pemula kebingungan karena antarmuka tidak merespons klik. | Melengkapi seluruh alur interaksi (form modal, konfirmasi, pesan sukses/gagal) di `docs/INTERACTION_MAP.md`. *(Tahap 01A)* |
| **P2-04** | Seluruh Berkas Mockup | Klaim teks tetap: “Real-Time”, “2FA Aktif Penuh”, “Terverifikasi Kemenkop”, “Enkripsi lokal aktif”. | Memberikan rasa aman semu kepada pengguna tanpa implementasi nyata. | Menghapus lencana palsu; hanya menampilkan status yang terbukti diverifikasi oleh sistem. *(Tahap 02, 08)* |

---

## 3. Kesimpulan Audit untuk Tahap Implementasi

1. **Desain Visual Dipertahankan**: Struktur sidebar, kartu putih, bayangan lembut, font Plus Jakarta Sans, dan palet warna Crimson tetap menjadi fondasi antarmuka.
2. **Logika Kode Dibangun Ulang**: Tidak ada script JavaScript dari mockup yang disalin mentah. Seluruh logika kalkulasi, otentikasi, validasi form, dan transaksi uang dibangun dari awal dengan TypeScript dan PostgreSQL yang aman.
3. **Data Contoh Dieliminasi**: Seluruh angka miliaran rupiah, ribuan anggota fiktif, dan 7 unit usaha otomatis dihapus. Sistem dimulai dari mode Persiapan dengan data kosong yang jujur.
