# INTERACTION MAP — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Lengkap — 58 Aksi Terpetakan (Style Stitch Asli)  

Dokumen ini memetakan seluruh aksi antarmuka, tombol, formulir, modal, validasi, dan hak akses perannya.

---

## 1. Statistik Inventaris Aksi

- **Total Aksi Diinventarisasi**: 58 Aksi
- **Rancangan Asal Stitch (*Designed*)**: 22 Aksi
- **Rancangan Tambahan Dituntaskan (*Designed Extension*)**: 30 Aksi
- **Ditunda Resmi (*Deferred-with-Reason*)**: 6 Aksi (USP & API Berbayar)
- **Sisa Belum Dirancang (*Missing-Design*)**: **0 Aksi (Tuntas)**

---

## 2. Inventaris Aksi per Modul

### A. Autentikasi & Akun
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-AUTH-01` | `/login` / Tombol Masuk | Sesi divalidasi, masuk `/dashboard` | Email & sandi min 8 char | Tamu | Designed (01A) |
| `ACT-AUTH-02` | `/login` / Lupa Password | Buka layar `/lupa-password` | Format email terdaftar | Tamu | Designed (01A) |
| `ACT-AUTH-03` | `/lupa-password` / Kirim | Kirim email pemulihan via Supabase | Format email valid | Tamu | Designed (01A) |
| `ACT-AUTH-04` | `/reset-password` / Simpan | Sandi baru tersimpan, ke `/login` | Sandi min 8 char, konfirmasi cocok | Token Sah | Designed (01A) |
| `ACT-AUTH-05` | Topbar / Menu Profil | Buka dropdown / layar `/profil` | Tanpa form | Semua User | Designed (01A) |
| `ACT-AUTH-06` | Topbar / Tombol Logout | Hapus token sesi, alihkan ke `/login` | Dialog konfirmasi keluar | Semua User | Designed (01A) |

### B. Dashboard & Persiapan
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-DASH-01` | `/dashboard` / Filter Rentang | Perbarui metrik kalender riil | Rentang tanggal valid | Semua User | Designed |
| `ACT-DASH-02` | `/dashboard` / Unduh Rekap | Unduh rekap status persiapan (PDF) | Data terverifikasi | Manajer, Pengurus | Designed (01A) |
| `ACT-DASH-03` | `/dashboard` / Kartu Cepat | Alihkan ke rute `/persiapan` | Tanpa form | Manajer, Pengurus | Designed (01A) |
| `ACT-DASH-04` | `/persiapan` / Centang Butir | Modal verifikasi & upload bukti | Form catatan & file bukti | Manajer, Pengurus | Designed (01A) |
| `ACT-DASH-05` | `/persiapan` / Simpan Verifikasi | Status butir selesai, kesiapan naik | File PDF/JPG maks 5MB | Manajer, Pengurus | Designed (01A) |
| `ACT-DASH-06` | `/persiapan` / Buka Gerai | Ubah status gerai ke Siap Buka | Syarat 100% terpenuhi | Pengurus (Pleno) | Designed (01A) |

### C. Kelembagaan & Anggota
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-MBR-01` | `/anggota` / Tab Status | Filter daftar: Semua/Baru/Aktif | Status valid | Semua Berizin | Designed |
| `ACT-MBR-02` | `/anggota` / Search Input | Cari nama/NIK tersensor (debounce) | Teks alfanumerik | Semua Berizin | Designed |
| `ACT-MBR-03` | `/anggota` / Tambah Anggota | Buka form `/anggota/tambah` | Form calon anggota | Admin, Manajer | Designed (01A) |
| `ACT-MBR-04` | `/anggota/tambah` / Simpan | Simpan data status Calon Anggota | Nama, NIK 16 digit, No HP | Admin, Manajer | Designed (01A) |
| `ACT-MBR-05` | `/anggota/[id]` / Tab Simpanan | Tampilkan mutasi buku simpanan | ID anggota valid | Manajer, Bendahara | Designed (01A) |
| `ACT-MBR-06` | `/anggota/[id]` / Setor Simpanan | Modal penyetoran kas/bank simpanan | Jenis, nominal, bukti kas | Bendahara | Designed (01A) |
| `ACT-MBR-07` | `/anggota` / Ekspor XLSX | Unduh rekap anggota (NIK tersensor) | Data terverifikasi | Manajer, Pengurus | Designed (01A) |
| `ACT-MBR-08` | `/anggota/[id]` / Status Keluar | Dialog verifikasi pengunduran diri | Alasan, penyelesaian saldo | Pengurus, Manajer | Designed (01A) |

### D. Unit Usaha & Master Barang
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-UNT-01` | `/unit-usaha` / Tambah Unit | Modal usulan unit baru (Rencana) | Nama unit, PIC, studi ringkas | Admin, Pengurus | Designed (01A) |
| `ACT-UNT-02` | `/unit-usaha/[id]` / Kesiapan | Tampilkan checklist kesiapan unit | ID unit valid | Semua Berizin | Designed (01A) |
| `ACT-STK-01` | `/stok` / Tambah Barang | Modal tambah komoditas sembako | SKU unik, nama, satuan, harga | Admin, Manajer | Designed (01A) |
| `ACT-STK-02` | `/stok` / Filter Kategori | Filter tabel stok barang dagangan | Kategori / status stok | Semua Berizin | Designed |
| `ACT-STK-03` | `/stok` / Kartu Stok | Riwayat kronologis mutasi masuk/keluar | ID barang valid | Manajer, Gudang | Designed (01A) |
| `ACT-STK-04` | `/stok` / Stok Opname | Form rekonsiliasi fisik vs sistem | Kuantitas riil fisik, alasan | Manajer, Gudang | Designed (01A) |
| `ACT-STK-05` | `/aset` / Tambah Aset | Form inventaris aset tetap (rak, PC) | Kode aset, nama, perolehan | Admin, Manajer | Designed (01A) |

### E. Pengadaan & Pembelian
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-PUR-01` | `/pembelian` / Buat PO | Form pembuatan PO ke pemasok | Pemasok, daftar item, harga | Manajer, Gudang | Designed (01A) |
| `ACT-PUR-02` | `/pembelian/[id]` / Setujui PO | Status PO menjadi Disetujui | ID PO valid, wewenang cukup | Manajer, Pengurus | Designed (01A) |
| `ACT-PUR-03` | `/pembelian/[id]` / Tolak PO | Modal penolakan dengan alasan | Alasan penolakan wajib | Manajer, Pengurus | Designed (01A) |
| `ACT-PUR-04` | `/pembelian/[id]` / Terima Barang | Form cek fisik, mutasi kartu stok | Qty riil diterima, kondisi | Petugas Gudang | Designed (01A) |
| `ACT-PUR-05` | `/pembelian/[id]` / Catat Tagihan | Catat utang dagang tanpa dobel stok | No faktur, jatuh tempo | Bendahara | Designed (01A) |
| `ACT-PUR-06` | `/pembelian/[id]` / Bayar Tagihan | Modal pelunasan utang pemasok | Akun kas/bank, bukti bayar | Bendahara | Designed (01A) |
| `ACT-PUR-07` | `/pembelian/[id]` / Retur Pemasok | Form retur barang cacat ke pemasok | Item rusak, nomor surat jalan | Manajer, Gudang | Designed (01A) |

### F. Penjualan Kasir (POS)
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-POS-01` | `/penjualan` / Buka Shift | Dialog input modal awal kasir | Modal awal kas > Rp0 | Kasir Unit | Designed (01A) |
| `ACT-POS-02` | `/penjualan/kasir` / Cari Barang | Tambah produk sembako ke keranjang | Stok fisik tersedia > 0 | Kasir Unit | Designed (01A) |
| `ACT-POS-03` | `/penjualan/kasir` / Bayar Tunai | Modal hitung uang & kembalian | Uang diterima >= total | Kasir Unit | Designed (01A) |
| `ACT-POS-04` | `/penjualan/kasir` / Non-Tunai | Verifikasi transfer / QRIS statis | Nomor referensi pembayaran | Kasir Unit | Designed (01A) |
| `ACT-POS-05` | `/penjualan/kasir` / Selesai | Transaksi atomik: stok + kas + jurnal | Data transaksi valid | Kasir Unit | Designed (01A) |
| `ACT-POS-06` | `/penjualan/kasir` / Cetak Struk | Cetak struk belanja 58/80mm / PDF | ID transaksi valid | Kasir Unit | Designed (01A) |
| `ACT-POS-07` | `/penjualan` / Otorisasi Retur | Modal verifikasi struk asli & retur | No struk sah, alasan retur | Kasir & Manajer | Designed (01A) |
| `ACT-POS-08` | `/penjualan` / Tutup Shift | Hitung fisik (*blind count*), berita acara | Kas fisik riil register | Kasir & Bendahara | Designed (01A) |

### G. Pekerjaan & Agenda (Tugas & Kalender)
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-TSK-01` | `/pekerjaan` / Tambah Tugas | Modal pembuatan tugas persiapan | Judul, PIC, batas waktu | Manajer, Pengurus | Designed (01A) |
| `ACT-TSK-02` | `/pekerjaan/[id]` / Bukti Tugas | Unggah berkas bukti kerja | File PDF/JPG maks 5MB | PIC Tugas | Designed (01A) |
| **`ACT-TSK-03`** | **`/pekerjaan` / Buat Agenda** | **Modal agenda lengkap (Contoh Wajib)** | **Judul, tgl/jam WIB, PIC, lokasi/URL** | **Manajer, Pengurus** | **Designed (01A)** |
| `ACT-TSK-04` | `/pekerjaan` / Edit Agenda | Modal revisi detail agenda | Form isian agenda | Pembuat, Manajer | Designed (01A) |
| `ACT-TSK-05` | `/pekerjaan` / Jadwal Ulang | Pemilih tanggal/jam baru di kalender | Tanggal masa depan valid | Pembuat, Manajer | Designed (01A) |
| `ACT-TSK-06` | `/pekerjaan` / Batal Agenda | Dialog pembatalan agenda | Alasan pembatalan wajib | Pembuat, Manajer | Designed (01A) |

### H. Keuangan, Jurnal & Laporan
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-FIN-01` | `/keuangan` / Catat Beban | Form biaya persiapan / toko | Kategori beban, bukti kas | Bendahara | Designed (01A) |
| `ACT-FIN-02` | `/keuangan` / Mutasi Internal | Transfer kas register ke brankas/bank | Akun asal/tujuan, nominal | Bendahara | Designed (01A) |
| `ACT-FIN-03` | `/keuangan/jurnal` / Buat Jurnal | Modal jurnal penyesuaian seimbang | Multi-akun, Debit = Kredit | Bendahara | Designed (01A) |
| `ACT-FIN-04` | `/keuangan/jurnal` / Pembalikan | Jurnal pembalikan transaksi posted | ID jurnal asal, alasan audit | Bendahara | Designed (01A) |
| `ACT-FIN-05` | `/laporan` / Filter Periode | Perbarui laporan periode riil | Periode pembukuan sah | Semua Berizin | Designed |
| `ACT-FIN-06` | `/laporan` / Ekspor Laporan | Unduh laporan resmi (PDF/XLSX) | Data terhitung sinkron | Manajer, Pengurus | Designed (01A) |
| `ACT-FIN-07` | `/tata-kelola` / Simulasi SHU | Hitung estimasi pra-RAT (Simulasi) | Parameter draf AD/ART | Manajer, Pengurus | Designed (01A) |
| `ACT-FIN-08` | `/tata-kelola` / Pengesahan SHU | Kunci alokasi resmi jadi utang SHU | Berita Acara RAT sah | Pengurus (Pleno) | Designed (01A) |

### I. Tata Kelola & Pengaturan Sistem
| ID Aksi | Layar / Elemen | Pemicu & Hasil | Validasi / Form | Izin Peran | Status |
|---|---|---|---|---|---|
| `ACT-SET-01` | `/pengaturan` / Profil Institusi | Perbarui legalitas & domisili | Form profil institusi | Admin, Manajer | Designed (01A) |
| `ACT-SET-02` | `/pengaturan` / Tambah Pengguna | Modal buat akun staf & penetapan role | Email, nama, peran resmi | Admin | Designed (01A) |
| `ACT-SET-03` | `/pengaturan` / Reset Sandi | Kirim email pemulihan sandi staf | ID pengguna valid | Admin | Designed (01A) |
| `ACT-SET-04` | `/pengaturan` / Kebijakan Simpanan | Perbarui master simpanan AD/ART | Nominal NUMERIC sah | Pengurus, Manajer | Designed (01A) |
| `ACT-SET-05` | `/pengaturan` / Unduh Audit Log | Unduh riwayat jejak audit (CSV) | Rentang tanggal log | Admin, Pengawas | Designed (01A) |
| `ACT-SET-06` | `/tata-kelola` / Notulen Rapat | Arsipkan dokumen notulen ke Storage | File PDF, judul, tanggal | Sekretaris, Pengurus | Designed (01A) |

### J. Fitur Ditunda Resmi (*Deferred with Reason*)
| ID Aksi | Fitur / Tombol | Alasan Penundaan Resmi | Penanganan di Antarmuka | Status |
|---|---|---|---|---|
| `ACT-USP-01` | Pengajuan Pinjaman | Belum ada izin simpan pinjam OJK/Kemenkop | Tombol dinonaktifkan/disembunyikan | Deferred (Tahap 22) |
| `ACT-USP-02` | Otorisasi Kredit | Menghindari risiko kredit macet di awal | Menu disembunyikan bawaan | Deferred (Tahap 22) |
| `ACT-USP-03` | Kalkulator Bunga | Rumus bunga/margin belum berizin legal | Dihapus dari antarmuka MVP | Deferred (Tahap 22) |
| `ACT-INT-01` | QRIS Otomatis | Menghindari biaya gateway pihak ketiga | Konfirmasi manual di kasir | Deferred |
| `ACT-INT-02` | API Perbankan | Rekening korporasi bank belum definitif | Rekonsiliasi manual di Tahap 15 | Deferred |
| `ACT-INT-03` | WhatsApp Gateway | Biaya langganan API berbayar per pesan | Komunikasi operasional manual | Deferred |
