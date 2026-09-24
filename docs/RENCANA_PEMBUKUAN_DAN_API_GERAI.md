# Rencana Pembukuan Lengkap dan API Gerai — untuk Abdul Halim

Tanggal: 24 September 2026. **Ini rancangan dan serah terima, bukan izin menjalankan SQL.** Website tetap sistem manajemen gerai, bukan kasir. Seluruh angka yang belum punya bukti pembukuan tidak boleh disebut Neraca atau SHU resmi.

## Yang sudah dapat dipakai sekarang

1. Pengaturan memiliki kolom kunci OpenAI dan, saat pilihan **API** ditekan, kolom nama sistem serta kunci API gerai. Kedua kunci hanya disimpan sementara di memori server lokal dan hilang saat server restart. Kolom API gerai **belum mengambil data** karena alamat, format respons, dan aturan identitas transaksi belum tersedia. Menyimpan kunci saja tidak mematikan input manual.
2. Pemantauan Gerai tetap menulis rekap manual ke Supabase. Server menolak permintaan manual yang mengaku bersumber dari API.
3. Neraca & SHU kini menampilkan **buku rekap operasional** per bulan dan gerai, 25 baris per halaman, dari tabel `unit_daily_reports`. Ini daftar sumber angka, **bukan buku besar**: tidak ada akun, debit, kredit, atau saldo awal. Halaman menjelaskan tiga langkah menuju laporan resmi.
4. Status organisasi dari Pengaturan kini dipakai di banner dan sidebar. Tahun buku dipakai di judul laporan. Rekening bank hanya referensi bertopeng empat digit di Keuangan; tidak dianggap saldo.

## Keputusan Bapak yang sudah diterima

- API yang direncanakan berasal dari **sistem gerai**, bukan API bank.
- Jika konektor gerai nantinya aktif dan data valid tersedia, formulir manual untuk cakupan gerai/periode yang sama harus nonaktif **di tampilan dan ditolak server**. Data API hanya menjadi pratinjau; manajer meninjau lalu menekan persetujuan sebelum database diperbarui.
- Jika tidak ada konektor yang aktif, input manual tetap tersedia.
- Pembukuan lengkap ingin dilakukan di website sesuai ketentuan koperasi. Bagan akun/opsi dapat ditambah, tetapi perubahan skema harus diberitahukan dan disetujui sebelum diterapkan.

## Alur API gerai yang harus dibangun setelah dokumentasi penyedia tersedia

`API gerai → validasi format & identitas → antrean impor → pratinjau per gerai/tanggal → cek duplikat/selisih → persetujuan manajer → transaksi database atomik → rekap + jejak sumber`

Aturan rinci:

1. Minta **nama penyedia, dokumentasi endpoint, contoh respons yang sudah disamarkan, cara autentikasi, dan ID unik eksternal**. Jangan minta kunci melalui chat. Alamat URL tidak boleh dieksekusi sembarangan dari server (risiko SSRF); adapter hanya boleh menuju host penyedia yang disetujui.
2. Pemetaan gerai dan tanggal WIB harus eksplisit. Bila suatu nilai tidak jelas, baris ditahan untuk diperbaiki, bukan diubah menjadi nol. Data ganda dengan ID eksternal yang sama tidak boleh masuk dua kali.
3. Simpan hasil tarik ke `unit_import_batches` dan `unit_import_rows` dengan status `pending`. Tidak menulis `unit_daily_reports` pada tahap tarik/pratinjau.
4. Manajer melihat nilai omset, pengeluaran, setoran dilaporkan, sumber, waktu tarik, dan perbedaan terhadap rekap manual. Persetujuan harus memilih baris yang masuk dan alasan bila menimpa/koreksi. Satu transaksi database harus mencatat persetujuan dan pembaruan rekap bersama-sama; kegagalan membatalkan semuanya.
5. Mode API hanya aktif jika konektor telah diuji, pemetaan lengkap, dan statusnya tersimpan **di server/database**. Saat aktif, form manual yang sama tampak abu-abu dan endpoint POST menolak. Kunci terpasang saja **tidak** cukup untuk mengaktifkan mode.
6. Jika API gagal, tampilkan waktu data terakhir dan galat jelas. Jangan otomatis kembali ke manual untuk cakupan yang sedang dikunci API tanpa keputusan manajer; hindari dua sumber saling menimpa.

## Tahapan pembukuan lengkap

1. **Kebijakan akuntansi dan saldo awal**: pengurus/akuntan menetapkan standar yang sesuai koperasi sektor riil, tahun buku, bagan akun, perlakuan simpanan anggota, HPP/persediaan, pajak, aset tetap, serta saldo awal yang dapat dibuktikan. Rekap gerai lama tidak otomatis menjadi jurnal.
2. **Bagan akun yang dapat ditambah**: kode unik, nama, kategori (aset/liabilitas/ekuitas/pendapatan/beban), sisi normal, akun induk, dan status aktif. Tambah/edit hanya untuk akun yang belum digunakan atau dengan aturan perubahan yang menjaga histori. Akun baru tidak boleh otomatis mengubah laporan lama.
3. **Jurnal umum**: entri bertanggal dengan minimal dua baris debit/kredit, referensi bukti, periode terbuka, serta validasi seimbang di server dan database. Draf bisa diedit; setelah dibukukan tidak boleh diubah/dihapus. Koreksi menggunakan jurnal pembalik.
4. **Buku besar dan neraca saldo**: tampilkan mutasi dan saldo awal/akhir per akun, filter periode, tautan ke jurnal/bukti, dan cek total debit-kredit. Periode tutup tidak boleh menerima posting baru.
5. **Laporan keuangan**: setelah seluruh jurnal dan penyesuaian lengkap, hitung posisi keuangan, hasil usaha/SHU, arus kas, perubahan ekuitas, dan catatan sesuai standar yang dipilih. Rekonsiliasi bank serta stok/HPP harus mempunyai bukti. Pembagian SHU memerlukan keputusan RAT; jangan pakai persentase contoh.
6. **Kontrol manajer**: notifikasi jurnal belum seimbang, impor menunggu persetujuan, gerai belum melapor, rekonsiliasi belum selesai, dan periode mendekati tutup. Grafik hanya memakai jurnal/rekap sesuai label sumbernya.

Rujukan resmi: [Permenkop UKM No. 2 Tahun 2024](https://peraturan.go.id/files/permenkop-kukm-no-2-tahun-2024.pdf) membedakan ketentuan koperasi simpan pinjam dan sektor riil; untuk sektor riil standar yang cocok perlu ditetapkan sesuai usaha/pembinanya. [SAK Entitas Privat](https://web.iaiglobal.or.id/SAK-EP-Efektif/SAK%20Entitas%20Privat%20Efektif%20Per%201%20Januari%202025) memuat laporan posisi keuangan, hasil usaha, arus kas, dan catatan. **Rujukan ini bukan keputusan final bahwa satu standar tertentu sudah wajib bagi Kopdes Ladang Laweh.**

## Draf database yang perlu persetujuan sebelum dijalankan

Berkas: [`supabase/drafts/20260924000010_accounting_and_unit_import.sql`](../supabase/drafts/20260924000010_accounting_and_unit_import.sql). Ini **draf**, sengaja tidak di folder `migrations` sehingga tidak ikut diterapkan otomatis.

| Tabel baru | Tujuan |
| --- | --- |
| `accounting_periods` | Tahun/periode buku dan status buka/tutup |
| `accounts` | Bagan akun yang dapat ditambah |
| `journal_entries` | Kepala jurnal, status draf/dibukukan, referensi pembalikan |
| `journal_lines` | Baris debit/kredit dengan penjagaan jurnal seimbang |
| `unit_import_batches` | Satu penarikan API dan status persetujuan |
| `unit_import_rows` | Nilai gerai dari API yang masih menunggu tinjauan |

Draf menambah **6 tabel** ke 7 tabel inti (total 13), indeks, trigger validasi posting, dan RLS default-deny. Tidak mengubah data lama atau menyimpan API key. Draf ini **belum diuji pada salinan Supabase** dan belum mencakup seluruh alur aplikasi; jangan tempel ke database produksi sekarang.

### Cara menjalankan nanti, setelah disetujui dan diuji

Pilihan paling mudah bagi Bapak: buka proyek Supabase → **SQL Editor** → **New query** → salin isi SQL final yang sudah disetujui → **Run** sekali. Sebelum itu buat cadangan, uji di proyek salinan, dan pastikan hasil verifikasi. Jangan kirim URL database, service role key, atau kata sandi ke chat.

Jika menggunakan terminal PostgreSQL sendiri, bentuk perintahnya:

```powershell
psql -v ON_ERROR_STOP=1 -f "D:\Koding\kopdes-ladang-laweh\supabase\drafts\20260924000010_accounting_and_unit_import.sql"
```

Perintah tersebut baru aman **setelah** koneksi `psql` diarahkan ke proyek uji yang benar dan Bapak menyetujui SQL final. Jangan menjalankannya sekarang; `psql` tanpa koneksi yang diperiksa bisa menuju database yang salah. Lebih aman memakai SQL Editor Supabase sesudah peninjauan bersama.

## Yang masih harus diputuskan sebelum migrasi final

1. Standar akuntansi untuk koperasi sektor riil ini dan siapa yang memeriksa saldo awal/bagan akun.
2. Apakah koperasi hanya menjual barang atau juga memiliki jasa/pinjaman; ini mengubah akun dan laporan yang diperlukan.
3. Nama aplikasi/API gerai, dokumentasi dan contoh respons tanpa data rahasia.
4. Aturan jika rekap manual pada tanggal yang sama sudah ada: tahan untuk tinjauan, koreksi dengan jejak, atau tolak impor. Rekomendasi: **tahan untuk tinjauan**, jangan menimpa otomatis.

Sampai keputusan tersebut ada, jangan menyebut pembukuan lengkap atau konektor API sudah aktif.
