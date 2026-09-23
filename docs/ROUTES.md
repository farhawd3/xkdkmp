# ROUTES & PERMISSION MATRIX — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 23 September 2026
**Status**: Berlaku — Spesifikasi Navigasi dan Batas Akses Sistem Manajemen & Pemantauan

Dokumen ini memetakan arsitektur rute, subhalaman, kebutuhan status bisnis organisasi/unit, tujuan setiap tombol aksi penting, serta matriks perizinan peran (*Role-Based Access Control*).

---

## 1. Peta Rute Navigasi Aktif

### A. Pusat Komando
| Rute | Nama Layar | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|
| `/dashboard` | Dashboard Manajer Eksekutif | Semua Pengguna Login | Ringkasan KPI koperasi, kinerja pemantauan gerai harian, fokus tugas mendesak hari ini, dan aksi cepat manajer. |
| `/pekerjaan` | Manajemen Tugas Operasional | Semua Pengguna Login | Task & action hub manajer: daftar tugas kartu pastel, indikator prioritas (Mendesak, Tinggi, Sedang, Rendah), PIC, tenggat waktu, dan tombol aksi status 1-klik (*Mulai Kerjakan*, *Tandai Selesai*). |

---

### B. Operasional Gerai
| Rute | Nama Layar | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|
| `/monitoring` | Pemantauan Gerai | Admin, Manajer, Operator | Form input rekapitulasi harian manual (omset penjualan kotor, pengeluaran kas operasional, kalkulasi otomatis laba kotor, kas setoran fisik, dan kendala lapangan) serta tab riwayat rekap harian seluruh gerai. |
| `/unit-usaha` | Daftar & Edit Gerai | Admin, Manajer, Pengurus | Menampilkan kartu gerai dengan detail PIC, nomor WA, target omset bulanan, lokasi, dan status kesiapan. Tombol: *Edit & Sesuaikan Gerai* dan *Tambah Gerai Baru*. |
| `/stok` | Barang & Stok (Angka) | Admin, Manajer, Operator | Khusus memantau nama komoditas sembako, satuan, angka ketersediaan stok fisik, dan batas minimum stok. Tombol: *Sesuaikan Angka Stok*. |

---

### C. Kelembagaan & Kesiapan
| Rute | Nama Layar | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|
| `/anggota` | Data Anggota | Admin, Manajer, Pengurus, Pengawas | Khusus memantau jumlah total anggota, anggota aktif, calon anggota, dan daftar nama/kontak anggota. Tombol: *Tambah Anggota*. |
| `/persiapan` | Kesiapan Operasional | Admin, Manajer, Pengurus | Checklist evaluasi prasyarat persiapan pembukaan fisik gerai menuju awal 2027. |

---

### D. Sistem & Bantuan
| Rute | Nama Layar | Peran Berizin | Keterangan & Komponen Aksi |
|---|---|---|---|
| `/pengaturan` | Pengaturan Sistem | Manajer | Pengaturan profil lembaga koperasi permanen (Supabase), cadangan & pemulihan sistem (Backup/Restore JSON). |
| `/bantuan` | Panduan Sistem | Manajer | Petunjuk pengoperasian dan SOP tata kelola manajer dalam bahasa Indonesia sederhana. |
| `/login` | Portal Masuk (Dialihkan) | - | Otomatis dialihkan ke `/dashboard` (aplikasi pribadi tanpa login). |

---

### E. Rute Dialihkan (Redirects)
| Rute Asal | Rute Tujuan | Rationale |
|---|---|---|
| `/penjualan` | `/monitoring` | Sistem kasir eceran toko tidak digunakan; dialihkan ke modul pemantauan operasional gerai. |
| `/pembelian` | `/monitoring` | Sistem pengadaan fisik toko dialihkan ke modul pemantauan operasional gerai. |
