# USER FLOWS & STATE MACHINES — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Spesifikasi Alur Interaksi & Siklus Hidup Entitas  

Dokumen ini mendefinisikan 8 alur interaksi terhubung dan 12 mesin status (*state machines*) entitas bisnis yang saling terikat secara konsisten.

---

## 1. Delapan Alur Bisnis yang Saling Terhubung

### Alur 1: Onboarding Persiapan Organisasi Menuju 2027
1. Sistem aktif dalam mode **Persiapan** (Target awal 2027, tanggal operasional bernilai `null`).
2. Manajer (Bpk. Abdul Halim) dan Pengurus menetapkan checklist persiapan: Akta Pendirian, Nomor Legalitas, Pembukaan Rekening Bank, Lokasi Gerai Sembako di Ladang Laweh, dan Modal Awal.
3. Setiap butir checklist memiliki PIC, tanggal target, dan lampiran bukti fisik (PDF/foto di Storage privat).
4. Verifikasi bertahap menaikkan indikator persentase kesiapan persiapan pada Dashboard.

### Alur 2: Pendaftaran Anggota & Penyetoran Simpanan (Terpisah)
1. Petugas mendaftarkan calon anggota melalui formulir pendaftaran (Nama, NIK, No. HP, Domisili).
2. Data tersimpan dengan status `Calon Anggota`; NIK disensor di server (`3372********0001`).
3. Pengurus/Manajer memverifikasi berkas identitas fisik calon anggota -> status berubah menjadi `Aktif`.
4. **Pemisahan Setoran Uang**: Status anggota aktif tidak otomatis menciptakan saldo kas.
5. Setoran Simpanan Pokok atau Simpanan Wajib disetorkan secara terpisah kepada Bendahara.
6. Bendahara mencatat bukti penerimaan kas/bank -> sistem menerbitkan nomor bukti setoran -> saldo buku simpanan anggota bertambah -> jurnal kas/simpanan terbit di buku besar.

### Alur 3: Siklus Pengadaan (Pemasok → PO → Penerimaan → Tagihan → Bayar)
1. Petugas membuat Pesanan Pembelian (*Purchase Order* / PO) untuk komoditas gerai sembako.
2. Manajer/Pengurus menyetujui dokumen PO. **PO yang disetujui belum menambah stok barang fisik**.
3. Pemasok mengirim barang. Petugas gudang memeriksa kuantitas dan kualitas fisik -> mencatat dokumen **Penerimaan Barang (*Goods Receipt*)**.
4. Verifikasi Penerimaan Barang otomatis menambah saldo fisik pada Kartu Stok barang dagangan.
5. Pemasok menerbitkan faktur tagihan (*Invoice*). Bagian keuangan mencatat Tagihan Pemasok -> utang dagang tercatat di sistem **tanpa menduplikasi stok**.
6. Bendahara membayar tagihan via transfer bank/kas -> utang dagang berkurang, saldo kas/bank berkurang, jurnal pelunasan dibukukan.

### Alur 4: Siklus Penjualan Kasir POS Atomik
1. Kasir membuka shift kerja pada gerai berstatus `Aktif`.
2. Kasir memilih barang sembako, sistem memeriksa ketersediaan stok fisik riil di database.
3. Pelanggan membayar via Tunai atau Non-Tunai manual (Transfer/QRIS statis yang diverifikasi kasir).
4. Tombol **Selesaikan Transaksi** mengeksekusi 3 tindakan sekaligus dalam satu transaksi database atomik:
   - Mengurangi kuantitas fisik barang pada kartu stok.
   - Mencatat penerimaan kas kasir.
   - Menerbitkan jurnal pendapatan penjualan dan Harga Pokok Penjualan (HPP).
5. Jika salah satu proses gagal (misal stok tiba-tiba habis), seluruh transaksi otomatis dibatalkan (*all-or-nothing rollback*). Sistem mencetak struk belanja.

### Alur 5: Retur Penjualan
1. Pelanggan membawa struk belanja dan barang yang hendak dikembalikan.
2. Kasir memasukkan nomor struk asli; sistem menampilkan rincian barang, harga jual, dan HPP awal.
3. Kasir memilih barang yang diretur dan alasan (rusak, salah beli, kedaluwarsa).
4. Manajer memberikan otorisasi retur penjualan.
5. Dana dikembalikan kepada pelanggan sesuai metode bayar awal.
6. **Perlakuan Barang**: Barang cacat/rusak dialihkan ke gudang karantina (tidak boleh masuk stok siap jual). Jurnal pembalikan pendapatan dan penyesuaian kerugian barang dicatat.

### Alur 6: Tutup Shift Kasir & Setoran Kas
1. Kasir mengakhiri jam kerja dan memicu proses **Tutup Shift**.
2. Kasir melakukan penghitungan fisik uang tunai register (*cash count*) tanpa melihat saldo akhir sistem terlebih dahulu (*blind count*).
3. Kasir memasukkan angka riil fisik; sistem membandingkan dengan total transaksi shift.
4. Jika terdapat selisih, kasir wajib mengisi berita acara alasan selisih.
5. Kasir menyerahkan uang kas fisik kepada Bendahara untuk disetor ke brankas/bank.
6. Penyerahan kas register ke bank dicatat sebagai mutasi internal kas, **bukan omzet penjualan baru** (mencegah pencatatan pendapatan ganda).

### Alur 7: Tugas, Agenda Kalender & Pembuktian
1. Manajer membuat tugas operasional persiapan/gerai (misal: "Pengadaan rak display sembako").
2. Tugas memuat deskripsi, tingkat prioritas, PIC pelaksana, dan batas waktu pengerjaan.
3. Agenda yang memiliki jadwal pertemuan atau inspeksi otomatis muncul pada Kalender Jadwal Operasional.
4. PIC melaksanakan tugas dan mengunggah dokumen/foto bukti penyelesaian ke sistem.
5. Manajer meninjau bukti dan mengubah status menjadi `Selesai`. Kemajuan tampil di Dashboard.

### Alur 8: Siklus RAT & Distribusi SHU
1. Pada akhir tahun buku, sistem mengonsolidasi seluruh laporan laba rugi dan pembukuan tahun berjalan.
2. Manajer menggunakan kalkulator untuk melakukan **Simulasi Pra-RAT** (perkiraan hak jasa modal dan jasa transaksi anggota). Hasil berlabel *Simulasi*, **bukan hak cair**.
3. Sidang Rapat Anggota Tahunan (RAT) diselenggarakan; pengurus dan anggota menyepakati persentase alokasi SHU definitif.
4. Pengurus menginput persentase ketetapan RAT ke sistem dan mengubah status menjadi `Disahkan RAT`.
5. Sistem mengunci angka pembagian SHU dan mencatat kewajiban utang SHU kepada anggota.
6. Anggota mencairkan hak SHU melalui kasir/bank dengan bukti tanda terima resmi.

---

## 2. Mesin Status (12 State Machines)

| No | Entitas Bisnis | Alur Siklus Status | Aktor Berwenang | Prasyarat & Alasan Pembatalan |
|---|---|---|---|---|
| **1** | **Organisasi** | `Persiapan` → `Siap Buka` → `Aktif` → `Ditutup Sementara` | Pengurus / RAT | Prasyarat: Dokumen legalitas dan modal awal siap. Pembatalan/penutupan: Keputusan resmi pleno pengurus. |
| **2** | **Unit Usaha** | `Rencana` → `Persiapan` → `Siap Buka` → `Aktif` → `Nonaktif` | Pengurus & Manajer | Dari `Rencana` ke `Persiapan` butuh persetujuan pengurus. Menuju `Aktif` wajib lulus 100% checklist kesiapan gerai. |
| **3** | **Anggota** | `Calon` → `Terverifikasi` → `Aktif` → `Nonaktif` / `Keluar` | Manajer & Pengurus | Prasyarat verifikasi: KTP dan NIK valid. Status `Keluar`: Mengajukan surat undur diri, seluruh kewajiban utang/simpanan tuntas. |
| **4** | **Dokumen Legalitas** | `Draf` → `Ditinjau` → `Disahkan` → `Diarsipkan` | Sekretaris & Pengurus | Prasyarat: Berkas fisik PDF telah diunggah ke private Storage dan nomor surat tercatat resmi. |
| **5** | **Pesanan Pembelian (PO)** | `Draf` → `Diajukan` → `Disetujui` → `Diterima Sebagian` → `Selesai` / `Dibatalkan` | Pembuat: Operator/Staf; Penyetuju: Manajer | Dibatalkan jika pemasok tidak sanggup memasok atau harga tidak sesuai kesepakatan awal. |
| **6** | **Penerimaan Barang** | `Draf` → `Diverifikasi Fisik` → `Diposting` / `Ditolak` | Petugas Gudang / PIC | Verifikasi fisik memeriksa kesesuaian kuantitas terhadap PO. Diposting otomatis memutasi kartu stok. |
| **7** | **Faktur Tagihan (Invoice)** | `Draf Tagihan` → `Terverifikasi` → `Lunas` / `Batal` | Bendahara / Keuangan | Tagihan hanya bisa diterbitkan setelah nomor Penerimaan Barang sah diverifikasi. |
| **8** | **Pembayaran Kas/Bank** | `Diajukan` → `Disetujui` → `Dibayar` / `Ditolak` | Pembuat: Staf; Setuju: Manajer/Bendahara | Mengharuskan 2 orang berbeda (*segregation of duties*) untuk nominal di atas batas wewenang operasional. |
| **9** | **Transaksi Kasir** | `Draf Keranjang` → `Menunggu Bayar` → `Lunas Selesai` / `Batal` | Kasir Unit | Dibatalkan jika uang pembayaran tunai kurang atau pelanggan membatalkan belanja sebelum pembayaran tuntas. |
| **10** | **Shift Kasir** | `Dibuka` → `Aktif` → `Dihitung Fisik` → `Direkonsiliasi Ditutup` | Kasir & Bendahara | Kasir wajib memasukkan modal awal saat buka, dan menghitung uang fisik tanpa melihat angka sistem saat tutup. |
| **11** | **Jurnal Pembukuan** | `Draf` → `Posted (Terkunci)` → `Dibalikkan (Reversed)` | Bendahara | Rekord `Posted` tidak bisa diedit/dihapus in-place. Koreksi wajib membuat jurnal pembalikan berpasangan baru. |
| **12** | **Alokasi SHU** | `Simulasi` → `Disahkan RAT` → `Dialokasikan` → `Dicairkan` | Pengurus & Bendahara | Pencairan simpanan SHU ditolak jika status masih berada pada tahap `Simulasi`. |
