# BUSINESS RULES — KOPDES MERAH PUTIH LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Aturan Bisnis Mengikat  

Dokumen ini mendefinisikan aturan bisnis, batasan integritas data, dan prinsip akuntansi yang wajib ditegakkan di seluruh lapisan sistem (Frontend, Server Actions, dan Database).

---

## 1. Aturan Organisasi & Status Operasional

1. **Status Bisnis Persiapan**:
   - Organisasi berstatus awal **Persiapan**.
   - Mode Persiapan adalah status proses bisnis nyata, bukan penanda data tiruan (*demo dummy*).
   - Pengeluaran nyata pada masa persiapan (seperti pengurusan legalitas, renovasi tempat, atau pengadaan perlengkapan kantor) dicatat sebagai beban persiapan atau aset setelah modul keuangan siap.
2. **Siklus Hidup Unit Usaha**:
   - Status unit usaha: `Rencana` → `Persiapan` → `Siap Buka` → `Aktif` → `Ditutup Sementara`.
   - Usulan unit usaha pertama adalah **Gerai Sembako** dengan status `Rencana`.
   - Penjualan barang dagangan di kasir hanya diizinkan untuk unit usaha yang telah berstatus `Aktif`.
   - Jumlah unit usaha bersifat dinamis; sistem dilarang mengunci 7 unit usaha secara permanen.
   - Unit Simpan Pinjam (USP) dan unit layanan khusus lainnya berstatus nonaktif bawaan (*disabled by default*).

---

## 2. Aturan Keanggotaan & Simpanan

1. **Siklus Hidup Anggota**:
   - Status anggota: `Calon Anggota` → `Terverifikasi` → `Aktif` → `Nonaktif` / `Keluar`.
   - Pendaftaran anggota tidak otomatis menciptakan transaksi uang atau saldo simpanan.
2. **Pemisahan Kategori Simpanan**:
   - **Simpanan Pokok**: Disetorkan satu kali saat mendaftar menjadi anggota. Tidak dapat ditarik selama menjadi anggota. Dicatat sebagai modal/ekuitas anggota.
   - **Simpanan Wajib**: Disetorkan secara rutin dalam periode tertentu. Tidak dapat ditarik selama menjadi anggota.
   - **Simpanan Sukarela**: Disetorkan sewaktu-waktu dan dapat ditarik kembali sesuai kesepakatan. Dicatat sebagai kewajiban koperasi kepada anggota.
   - Setiap setoran simpanan wajib memiliki nomor bukti transaksi kas/bank yang sah.
3. **Privasi & Perlindungan Data Anggota**:
   - Nomor Induk Kependudukan (NIK) dan data sensitif anggota wajib disamarkan (*masked*) pada tampilan umum dan hanya dapat diakses utuh oleh petugas berwenang dengan hak akses tervalidasi di server.

---

## 3. Aturan Pengadaan & Persediaan (Stok Barang)

1. **Alur Pengadaan Terstruktur**:
   - `Permintaan Pembelian` → `Pesanan Pembelian (PO)` → `Penerimaan Barang` → `Faktur Tagihan Pemasok` → `Pembayaran Tagihan`.
   - **Aturan Stok**: Penerbitan PO tidak menambah stok fisik barang. Stok fisik hanya bertambah saat dokumen Penerimaan Barang (*Goods Receipt*) diverifikasi.
   - **Aturan Utang**: Penerimaan tagihan faktur pemasok mencatat kewajiban Utang Dagang tanpa menambah stok barang kembali (mencegah pencatatan ganda).
2. **Pemisahan Barang Dagangan vs Aset Tetap**:
   - **Barang Dagangan (Inventory)**: Barang yang dibeli untuk dijual kembali (misal beras, gula, minyak goreng). Mempengaruhi kartu stok dan Harga Pokok Penjualan (HPP).
   - **Aset Tetap (Fixed Assets)**: Perlengkapan penunjang usaha (misal rak display, timbangan digital, meja kasir, komputer kasir). Dicatat pada modul Aset Tetap, mengalami penyusutan, dan dilarang dimasukkan ke kartu stok barang dagangan.
3. **Integritas Master Barang**:
   - Setiap barang wajib memiliki kode SKU yang unik dan satuan standar yang baku (zak, kg, pcs, karton).
   - Status stok (Stok Habis, Menipis, Tersedia) ditentukan secara otomatis oleh sistem berdasarkan kuantitas fisik riil pada kartu stok, bukan status teks statis.

---

## 4. Aturan Penjualan & Kasir (Point of Sale)

1. **Transaksi Kasir Atomik**:
   - Setiap transaksi penjualan di kasir mencakup 3 hal yang terjadi sekaligus:
     1. Pengurangan stok barang di gudang/toko.
     2. Penerimaan kas atau konfirmasi pembayaran non-tunai manual.
     3. Penerbitan jurnal pendapatan dan HPP di buku besar.
   - Transaksi ini wajib dieksekusi secara atomik (*atomic transaction*). Jika salah satu bagian gagal, seluruh transaksi otomatis dibatalkan (*rollback*).
2. **Manajemen Shift Kasir**:
   - Kasir wajib membuka shift dengan mencatat modal kas awal (*cash float*).
   - Penutupan shift mewajibkan penghitungan kas fisik (*cash count*) dan rekonsiliasi terhadap total transaksi sistem.
   - Pemindahan uang tunai dari kasir ke brankas/rekening bank adalah transfer internal kas, **bukan** transaksi penjualan baru (tidak mencatat omzet ganda).
3. **Retur Penjualan**:
   - Retur barang oleh pelanggan wajib mengacu pada nomor struk/transaksi penjualan asli.
   - Pengembalian dana mengikuti metode pembayaran asal.
   - Barang retur yang rusak atau kedaluwarsa dicatat sebagai barang rusak/rugi dan dilarang dikembalikan ke stok aktif yang siap jual.

---

## 5. Aturan Akuntansi & Keuangan

1. **Ketelitian Angka Moneter**:
   - Seluruh nilai nominal uang dihitung menggunakan tipe data `NUMERIC` di PostgreSQL dengan penanganan desimal presisi di server.
   - Dilarang keras menggunakan floating point JavaScript untuk kalkulasi pembukuan keuangan guna menghindari kesalahan pembulatan sen.
   - Format tampilan: Bahasa Indonesia (`id-ID`), Rupiah (IDR). Waktu pembukuan: `Asia/Jakarta`.
2. **Jurnal Berpasangan Seimbang**:
   - Setiap jurnal pembukuan wajib memiliki total Debet yang sama dengan total Kredit. Jurnal yang tidak seimbang dilarang disimpan oleh database (*constraint check*).
3. **Imutabilitas Data Pembukuan**:
   - Transaksi atau jurnal yang sudah dibukukan (*status: posted*) dilarang dihapus atau diedit langsung.
   - Koreksi transaksi salah wajib dilakukan dengan membuat transaksi pembalikan (*reversal / contra entry*) disertai nomor referensi dan alasan audit.
4. **Pemisahan Konsep Keuangan**:
   - Simpanan anggota ≠ Omzet penjualan.
   - Penerimaan kas ≠ Keuntungan bersih.
   - Sisa Hasil Usaha (SHU) ≠ Saldo kas akhir.
   - Alokasi SHU pra-RAT berstatus **Simulasi**, bukan kewajiban bayar. SHU hanya dapat dicairkan setelah disahkan dalam Rapat Anggota Tahunan (RAT) resmi.

---

## 6. Aturan Keamanan & Batas Hak Akses (RBAC & RLS)

1. **Prinsip Validasi Server (Server-Side Authority)**:
   - Antarmuka pengguna (UI) hanya berfungsi untuk kenyamanan pengguna (UX).
   - Hak akses, validasi harga, stok, ketersediaan saldo, dan persetujuan mutasi wajib divalidasi ulang di sisi server (Server Actions dan PostgreSQL Row Level Security).
2. **Prinsip Default Deny**:
   - Seluruh tabel database tertutup secara bawaan (*default deny*). Akses baca/tulis hanya terbuka berdasarkan peran yang telah didefinisikan.
   - Peran pengguna (*role*) disimpan di tabel otorisasi database, **bukan** di `user_metadata` Supabase Auth yang dapat dimodifikasi oleh pengguna di browser.
3. **Pemisahan Kewenangan (Segregation of Duties)**:
   - Pembuat pengajuan (misal pengajuan pembelian atau pencairan beban) dilarang menyetujui pengajuannya sendiri jika transaksi tersebut berada di atas batas wewenang yang mewajibkan persetujuan ganda (*two-person rule*).
4. **Kerahasiaan Kunci Akses**:
   - Kunci Service Role, secret key, atau token akses database dilarang keras dimasukkan ke kode sisi browser, variabel lingkungan publik `NEXT_PUBLIC`, repository Git, percakapan obrolan, atau file log.
