# Rencana Integrasi AI, Sumber Keuangan, dan Akuntansi

> Pembaruan keputusan 24 September 2026: API yang dimaksud adalah **API sistem gerai**, bukan bank, dan pembukuan lengkap direncanakan di website. Lihat [RENCANA_PEMBUKUAN_DAN_API_GERAI.md](RENCANA_PEMBUKUAN_DAN_API_GERAI.md) untuk status terbaru, draf SQL, dan urutan persetujuan. Bagian lama di bawah adalah riwayat rancangan.

Checkpoint 24 September 2026. Dokumen ini membedakan yang **sudah dibuat** dari yang **masih memerlukan keputusan Bapak Abdul Halim**. Jangan mengaktifkan API luar atau menjalankan SQL hanya karena rancangan ini ada.

## Sudah dibuat tanpa migrasi database

- `/keuangan` menampilkan omset, pengeluaran, selisih operasional, setoran yang *dilaporkan*, serta grafik tujuh hari berikut rincian angka. Input tetap melalui `/monitoring` dan tersimpan manual di Supabase. Sumber API tampak abu-abu dan belum dapat dipilih.
- `/laporan` menampilkan kesiapan data Neraca/SHU dan secara jelas menolak menyebut selisih operasional sebagai SHU. Utang tidak lagi diisi nol tanpa bukti, dan simulasi pembagian persentase tanpa keputusan RAT dihapus.
- `/pengaturan` kini menyediakan input kunci OpenAI yang dikirim ke server lokal dan disimpan sementara di memori proses, beserta uji koneksi. Analisis AI dan API keuangan belum aktif; kunci tidak disimpan permanen.
- API `/api/finance/summary` hanya menghasilkan ringkasan operasional dan status kesiapan akuntansi. Jika jumlah rekap database melebihi baris yang berhasil diambil, API gagal jelas agar total tidak dipotong diam-diam. Perhitungan rupiah memakai satuan sen (integer) sebelum ditampilkan.

## Tahap AI tugas hari ini — menunggu pilihan penyedia

1. Tentukan penyedia, model, biaya pemakaian, dan kebijakan data. Kunci API disimpan hanya sebagai rahasia server (environment/secret manager), tidak di `NEXT_PUBLIC`, browser, profil organisasi, atau database tanpa desain enkripsi yang disetujui.
2. Tombol “Analisis tugas hari ini” mengambil tugas jatuh tempo, terlambat, dan prioritas tinggi dari server. Kirim hanya judul, status, prioritas, tenggat, dan nama gerai bila perlu; jangan kirim data anggota, kontak, nomor rekening, atau rahasia.
3. Server memvalidasi respons, membatasi panjang/biaya/waktu, dan menampilkan sumber tugas yang dirujuk. Analisis AI adalah saran; tidak boleh mengubah status tugas atau menulis database otomatis.
4. Pengaturan sudah menampilkan status dan tombol uji koneksi tanpa menampilkan kembali kunci; uji ini hanya memanggil daftar model dan tidak mengirim data koperasi. Saat analisis dibuat, tambahkan pengujian gagal koneksi, respons tak valid, biaya/timeout, dan prompt injection dari isi tugas.

## Tahap pilihan sumber keuangan manual/API — belum aktif

1. Minta nama penyedia API, dokumentasi autentikasi dan contoh respons, frekuensi pembaruan, identitas transaksi unik, serta pemetaan gerai/tanggal/akun. Jangan menganggap API bank sama dengan API rekap gerai.
2. Mode bawaan **Manual**: formulir rekap bekerja seperti sekarang. Mode **API** baru boleh aktif setelah adapter dan validasi benar-benar siap. Saat aktif, formulir input manual terlihat abu-abu/nonaktif **dan endpoint POST/PATCH menolak penulisan manual**. Mematikan tombol saja tidak cukup.
3. Data API masuk ke *staging* terlebih dahulu, dengan sumber, waktu, ID eksternal, dan status pemeriksaan. Manajer meninjau selisih/duplikat lalu menekan “Setujui pembaruan”; **penulisan ke database tetap tindakan manual**, tidak sinkron otomatis tanpa persetujuan.
4. Koreksi setelah disetujui perlu jejak alasan dan pembalikan, bukan menimpa diam-diam. Kegagalan API mempertahankan data terakhir dengan label waktu/sumber, bukan mengganti nilai menjadi nol. Jangan mengaktifkan kedua sumber untuk satu periode/gerai tanpa aturan konflik.

Rancangan ini **memerlukan migrasi Supabase baru** bila hendak disimpan permanen, setidaknya pengaturan sumber, antrian impor, ID eksternal unik, dan jejak persetujuan. Belum ada SQL untuk tahap ini karena format API/keputusan bisnis belum diketahui. Jelaskan SQL konkret dan minta konfirmasi Bapak sebelum eksekusi.

## Tahap akuntansi Neraca & SHU — belum dapat dianggap selesai

Rekap harian saat ini tidak memiliki jurnal berpasangan, saldo awal, penilaian persediaan/HPP, piutang/utang, penyusutan, pajak, simpanan anggota terinci, maupun bukti rekonsiliasi bank. Karena itu tidak mungkin menyusun Neraca seimbang atau SHU resmi hanya dari tujuh tabel saat ini. Jangan menciptakan “modal penyeimbang”, menyebut utang Rp0 tanpa buku utang, atau membagi SHU berdasarkan persentase contoh.

Tahap berikut perlu keputusan akuntan/pengurus tentang standar pelaporan yang cocok bagi koperasi sektor riil (misalnya SAK Entitas Privat atau SAK EMKM sesuai kelayakan), bagan akun, saldo awal yang dapat dibuktikan, tahun buku, perlakuan HPP dan simpanan, serta keputusan RAT tentang cadangan dan pembagian SHU. Setelah itu baru rancang migrasi untuk akun, jurnal dan baris debit/kredit, saldo awal, rekonsiliasi, dan keputusan RAT dengan transaksi atomik dan jejak audit. Laporan resmi harus dapat ditelusuri ke jurnal, periode, dan dokumen sumber; sumber API bukan pengganti pembukuan.

Dasar rujukan: [Permenkop UKM No. 2 Tahun 2024](https://www.peraturan.go.id/files/permenkop-kukm-no-2-tahun-2024.pdf) mengatur kebijakan akuntansi koperasi, termasuk sektor riil dan pengesahan laporan tahunan di RAT; [SAK Entitas Privat efektif 2025](https://web.iaiglobal.or.id/SAK-EP-Efektif/SAK%20Entitas%20Privat%20Efektif%20Per%201%20Januari%202025) mencakup posisi keuangan, kinerja, arus kas, dan catatan; [UU No. 25 Tahun 1992 Pasal 45](https://peraturan.bpk.go.id/Home/Download/35388/UU%20Nomor%2025%20Tahun%201992.pdf) mendefinisikan SHU dan kewenangan Rapat Anggota. Rujukan ini bukan penetapan standar spesifik koperasi; perlu konfirmasi akuntan/pengurus.

## Keputusan yang diperlukan dari Bapak

1. Penyedia AI dan apakah pemakaian API berbayar disetujui.
2. API keuangan yang dimaksud (bank, aplikasi akuntansi, atau sistem gerai), beserta dokumentasi/contoh respons tanpa kunci rahasia.
3. Apakah Bapak ingin sistem pembukuan lengkap dibuat di website ini, atau website hanya memantau hasil dari aplikasi akuntansi yang sudah dipakai. Ini menentukan besar migrasi database.

Kolom kunci OpenAI sementara adalah pengecualian yang sudah diminta Bapak dan dibatasi untuk server lokal. Jangan membuat kolom kunci penyedia keuangan, mengaktifkan mode API semu, atau menyatakan Neraca/SHU resmi tersedia sebelum keputusan berikutnya.
