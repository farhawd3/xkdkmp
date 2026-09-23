# PROMPT SIAP PAKAI — Pengembangan lanjutan Kopdes Merah Putih — Ladang Laweh

Salin isi dokumen ini ke AI berikutnya bersama akses workspace. Ini adalah **spesifikasi dan instruksi kerja**, bukan klaim fitur di bawah sudah tersedia. Pemilik kebutuhan: Bapak Abdul Halim, manajer koperasi dan pemula IT. Jawab dengan bahasa Indonesia yang alami, singkat untuk status harian, tetapi rinci saat menjelaskan pilihan bisnis atau risiko data.

## A. Konteks wajib sebelum bertindak

1. Baca seluruh `AGENTS.md`, bagian **teratas** `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, dan `docs/ROADMAP_MANAJER_BERIKUTNYA.md`. Periksa `git status` sebelum mengubah berkas; banyak perubahan lama belum di-commit, jangan reset.
2. Produk adalah **sistem informasi manajemen dan pemantauan gerai**, bukan aplikasi kasir/POS. Dipakai pribadi oleh Bapak Abdul Halim tanpa layar login. Identitas sementara Kopdes Merah Putih — Ladang Laweh, Nagari Ladang Laweh, Kecamatan Banuhampu, Kabupaten Agam; nama/lokasi harus bisa disesuaikan melalui profil, jangan ditanam permanen di tiap layar.
3. Teknologi: Next.js App Router, TypeScript strict, Tailwind, komponen UI bersama, Zod, Supabase. Seluruh nilai uang Rupiah dan tanggal bisnis WIB. Jangan menampilkan data contoh sebagai data koperasi.
4. Kondisi penting saat prompt ini dibuat: `GET /api/members` dan `/api/stock-simple` masih 500 karena tabel cloud lama tidak cocok dengan kode. Draf SQL penyelarasan di `supabase/drafts/20260923000009_align_members_products.sql` belum disetujui/dijalankan. Backup/restore belum atomik dan belum terbukti lengkap >1.000 baris. Jangan menyebut semua fitur siap produksi.
5. **Jangan mengubah Supabase, menjalankan SQL, membuat bucket Storage, atau mengisi data produksi tanpa persetujuan eksplisit Bapak atas perubahan yang dijelaskan.** Draf SQL saja boleh disiapkan di `supabase/drafts/`. Jangan mengekspos service key, data pribadi anggota, atau membuka aplikasi tanpa pelindung jaringan.

## B. Tujuan manajer yang harus dijawab layar

Pada pagi hari: “Gerai mana belum siap/melapor, tugas mana mendesak, barang mana perlu diperiksa?” Pada sore hari: “Rekap mana sudah masuk, kendala apa, setoran apa yang perlu ditelusuri?” Pada akhir pekan/bulan: “Bagaimana capaian tiap gerai terhadap target, apakah data cukup untuk disimpulkan, keputusan apa yang perlu dibawa ke pengurus?” Aplikasi harus mengubah data menjadi **tindakan yang jelas** dan selalu menunjukkan sumber serta keterbatasan angka.

## C. Arsitektur menu yang disarankan

Jangan langsung menambah banyak menu sidebar. Gunakan susunan berikut setelah prototipe dan uji kegunaan:

| Posisi | Menu/layar | Keputusan navigasi |
|---|---|---|
| Menu utama | Dashboard Manajer `/dashboard` | Tetap; pintu masuk dan ringkasan. Jangan jadi halaman sangat panjang. |
| Menu utama | **Meja Kerja** `/meja-kerja` | **Menu baru prioritas 1**; satu antrian tindak lanjut lintas gerai/tugas/kendala/stok. Tambah hanya bila lebih berguna daripada panel dashboard. |
| Menu utama | Tugas & Agenda `/pekerjaan` | Tetap; rincian tugas dan kalender. Jangan buat kalender baru. |
| Operasional gerai | Pemantauan `/monitoring` | Tetap; input dan riwayat rekap. Tambah tab “Kendala” bila datanya memadai. |
| Operasional gerai | **Kinerja Gerai** `/kinerja-gerai` | **Menu baru prioritas 2**; banding target, kelengkapan rekap, dan tren antar-gerai. |
| Operasional gerai | Daftar & Edit Gerai `/unit-usaha` | Tetap; profil dan target tiap gerai. |
| Operasional gerai | Barang & Stok `/stok` | Tetap; tambah subview “Perlu diperiksa”, bukan menu terpisah. |
| Keuangan | Kas & Buku Besar `/keuangan` | Tetap; jangan menamai selisih rekap sebagai saldo atau laba bersih. |
| Keuangan | Neraca & SHU `/laporan` | Tetap dengan penjelasan batas data/ketetapan AD/ART. |
| Kelembagaan | Data Anggota `/anggota` | Tetap; jangan menambah buku simpanan palsu dari daftar anggota. |
| Kelembagaan | Kesiapan Buka `/persiapan` | Tetap selama fase pra-operasional. |
| Kelembagaan | Tata Kelola & RAT `/tata-kelola` | Tetap; kelak tab keputusan rapat/arsip dokumen setelah kebutuhan dan penyimpanan aman disepakati. |
| Sistem | Pengaturan `/pengaturan` | Tetap; profil, preferensi ambang, backup setelah aman. |

Jika layar baru belum berguna tanpa data atau menambah beban navigasi, jadikan tab di modul lama dahulu. Ukur apakah Bapak dapat menemukan “yang harus dikerjakan hari ini” maksimal dua klik dari dashboard.

## D. Fitur yang dapat dirancang dengan 7 tabel saat ini

### D1. Meja Kerja harian — antrian prioritas lintas modul

- Kumpulkan: tugas lewat tenggat/hari ini, gerai aktif belum rekap hari ini, kendala rekap yang belum menjadi tugas, stok nol/di bawah minimum. Tampilkan asal data, tanggal, tingkat perhatian, PIC jika ada, dan satu aksi utama (“Buka tugas”, “Isi rekap”, “Buat tugas”, “Periksa stok”).
- Kelompok: `Perlu sekarang`, `Hari ini`, `Pantau`, dan `Selesai` hanya bila ada bukti status asli dari sumber. Jangan menciptakan status selesai lokal yang seolah permanen. Urutan deterministik: lewat tenggat dahulu, lalu kendala kritis, belum lapor, stok; tanggal lebih tua lebih atas. Semua grup bisa difilter asal/gerai/tanggal.
- Klik kartu menuju item sumber dengan URL terfilter yang benar-benar dibaca halaman tujuan. Jangan kirim `id` ke URL jika halaman tujuan tidak mampu memfokuskan item. Deduplicasi tugas yang sekaligus mendesak dan lewat tenggat.
- Di layar kosong: “Belum ada tindak lanjut dari data yang tercatat”; beri catatan bahwa gerai tanpa rekap belum berarti operasional lancar. Saat salah satu query gagal, tampilkan “Sebagian data belum tersedia” dan daftar sumber yang gagal; jangan gabungkan kegagalan dengan nol.
- Tahap awal cukup agregasi baca dari tabel yang ada. Jika Bapak ingin tombol “Tandai sudah ditinjau” yang bertahan antarperangkat, rancang tabel audit kecil dan minta persetujuan SQL; jangan memakai localStorage sebagai bukti resmi.
- Uji: tengah malam WIB, gerai nonaktif, tugas tanpa tenggat, duplikasi kendala→tugas, stok minimum 0, kegagalan satu sumber, daftar >1.000 baris.

### D2. Kinerja Gerai — target, rekap, dan perbandingan adil

- Filter periode bulan/tahun, status gerai, jenis usaha dan gerai; default bulan berjalan WIB. Tampilkan setiap gerai: target bulanan (jika ada), omset tercatat, persen target, jumlah hari yang direkap, jumlah hari yang seharusnya direkap menurut tanggal mulai/status gerai, pengeluaran tercatat, serta kendala terakhir.
- Jangan mengasumsikan semua hari kalender wajib melapor tanpa jadwal operasi. Bila hari operasional belum didefinisikan, pakai label **“hari kalender dalam periode”**, bukan “kepatuhan”. Usulkan pengaturan hari operasional per gerai hanya setelah Bapak menetapkan kebijakan dan skema.
- Banding bulan berjalan dengan rentang tanggal yang setara pada bulan lalu; tampilkan persentase perubahan hanya bila kedua periode punya kelengkapan memadai. Jika tidak, “Perbandingan belum layak — rekap belum lengkap”. Target nol/kosong berarti “Target belum ditetapkan”, bukan 0% kinerja.
- Tabel desktop, kartu ringkas tablet/ponsel, pengurutan capaian/rekap, drill-down ke rekap gerai. Grafik maksimum satu per layar; sertakan angka tekstual dan keterangan definisi.
- Kontrak API yang diusulkan: `GET /api/manager/unit-performance?month=YYYY-MM&unitId=...`, validasi Zod dan pembatasan rentang; implementasi boleh memperluas endpoint existing jika lebih sederhana. Query paginated/aggregated di server, tidak mengambil seluruh riwayat ke browser.
- Uji: bulan Februari, pergantian tahun, target kosong, laporan duplikat ditolak, gerai baru/tutup di tengah bulan, nilai negatif/0 yang sah, SQL query gagal.

### D3. Kendala Lapangan sebagai daftar keputusan

- Dari `unit_daily_reports.issues_note` (cek nama kolom aktual), tampilkan kendala terbaru dengan gerai, tanggal, cuplikan, dan tautan laporan. Sediakan “Jadikan tugas” memakai alur yang sudah ada, mempertahankan prioritas, menghindari tugas ganda, serta menautkan asal laporan **hanya jika relasi tersimpan benar**.
- Pencarian teks dan filter gerai/periode. Jangan otomatis mengkategorikan kendala medis/hukum/keuangan sebagai fakta tanpa masukan manusia. Bila belum ada status resolusi tersendiri, label “Catatan rekap”, bukan “Belum diselesaikan”.
- Bisa menjadi tab di `/monitoring`, bukan sidebar baru. Untuk status kendala dan jejak keputusan permanen, ajukan model data baru dulu.

### D4. Ringkasan rapat mingguan manajer

- Buat tampilan baca/cetak A4 untuk periode yang dipilih: nama koperasi dari profil, rentang WIB, daftar gerai aktif & rekap masuk, omset/pengeluaran yang tercatat, selisih operasional **bukan laba bersih**, tugas terbuka, kendala terbaru, stok perlu perhatian, dan bagian “Hal yang perlu keputusan pengurus”.
- Bagian terakhir hanya daftar bahan diskusi dari data; jangan menciptakan keputusan/pengesahan otomatis. Cetak/CSV perlu tanggal pengambilan, metodologi singkat dan peringatan saat data anggota/stok tidak tersedia. PDF baru jika mekanisme cetak A4 stabil.
- Jangan masukkan NIK, kontak anggota, atau data pribadi lain ke unduhan default. CSV sanitasi formula injection. Uji A4 2+ halaman, dark mode tetap cetak terang, Rupiah dan label panjang.

### D5. Pusat Kualitas Data

- Periksa hal yang menghambat keputusan: profil lembaga kosong, gerai aktif tanpa PIC/target, rekap tanggal hilang, produk tanpa ambang minimum, anggota dengan nomor tidak konsisten **setelah** skema cloud cocok. Sajikan daftar temuan dan tautan perbaikan, bukan satu “skor sehat” buatan.
- Temuan harus punya aturan eksplisit, contoh dan alasan. Pisahkan `peringatan`, `data belum tersedia karena galat`, dan `belum berlaku`. Simpan aturan dalam fungsi yang bisa diuji, bukan tersebar di JSX.
- Awali sebagai panel dashboard/pengaturan; menu baru hanya jika jumlah temuan besar.

## E. Fitur lebih kompleks yang memerlukan keputusan bisnis dan kemungkinan tabel baru

**Jangan implementasikan bagian ini pada data cloud tanpa keputusan Bapak, rancangan model, contoh layar, dan persetujuan SQL.** Urutan berikut adalah kandidat, bukan kewajiban otomatis.

### E1. Jejak stok fisik dan opname

Saat ini stok hanya angka terakhir. Agar manajer tahu *mengapa* berubah, rancang `stock_counts`/`stock_adjustments`: waktu WIB, produk, gerai/lokasi, stok sistem sebelumnya, hasil hitung fisik, selisih, alasan, pemeriksa, dan referensi dokumen. Penyesuaian harus atomik dengan angka produk dan tidak boleh menghapus jejak lama. Jangan menganggap selisih otomatis kehilangan/penyalahgunaan. Putuskan dulu apakah stok per gerai atau global; jika per gerai, model lama `products.current_stock` perlu desain ulang yang hati-hati. Jangan buat penerimaan barang atau pembelian/POS penuh tanpa permintaan.

### E2. Rekonsiliasi setoran kas gerai

Rancang pemeriksaan “laporan setoran gerai” versus “kas benar-benar diterima bendahara” dengan tanggal, nominal, penerima, bukti dan status. **Jangan menyamakan omset minus pengeluaran dengan uang tunai yang wajib disetor**: penjualan nontunai, kredit, saldo awal, dan transaksi lain mungkin belum tercatat. Sebelum menghitung selisih, sepakati definisi kas dan alur bukti dengan Bapak; kemudian usulkan tabel setoran/penerimaan terpisah dan aturan koreksi tanpa menimpa sejarah.

### E3. Buku simpanan anggota

Tabel `members` saat ini bukan buku transaksi simpanan. Simpanan pokok/wajib/sukarela membutuhkan jenis, tanggal, nominal, bukti, pembatalan/koreksi dan saldo yang diturunkan dari transaksi, bukan field total yang bebas diedit. Penetapan besaran/kewajiban mengikuti keputusan koperasi, bukan default aplikasi. Fitur ini menyangkut uang dan data pribadi: minta keputusan bisnis serta tinjauan akuntansi/aturan sebelum implementasi; jangan menampilkan angka sementara sebagai pembukuan resmi.

### E4. Keputusan rapat dan tindak lanjut RAT

Di `/tata-kelola`, konsepkan agenda rapat, notulen, daftar keputusan, penanggung jawab, tanggal tindak lanjut dan status. Pisahkan `draf manajer` dari `keputusan disahkan`; bukti pengesahan tidak boleh disimpulkan dari klik tombol. Lampiran dokumen/identitas anggota membawa risiko privasi dan memerlukan kebijakan penyimpanan, akses dan backup. Tugas yang lahir dari keputusan bisa terhubung ke `tasks` dengan referensi yang nyata.

### E5. Arsip dokumen & tenggat perizinan

Calon tab di `/tata-kelola`/`/persiapan`: jenis dokumen, nomor (bila aman), tanggal berlaku/berakhir, penanggung jawab, status verifikasi manual dan pengingat lokal di dashboard. Jangan menaruh scan KTP/akta di folder publik atau Storage tanpa pembatasan akses. Penyimpanan berkas adalah keputusan keamanan tersendiri; versi pertama bisa hanya metadata dokumen tanpa unggahan.

### E6. Preferensi manajer yang benar-benar kustom

Profil organisasi sudah ada. Pertimbangkan pengaturan: nama tampilan, alamat wilayah, target per gerai, jam penutupan rekap, ambang stok per produk, hari operasional gerai, dan format cetak. Pisahkan **preferensi perangkat** (tema, kepadatan tampilan) dari **kebijakan usaha** yang harus tersimpan permanen dan dapat diaudit. Jangan paksa semua pengaturan menjadi tabel baru; evaluasi skema profil/gerai yang sudah ada dahulu.

## F. Prioritas, ukuran pekerjaan, dan aturan keputusan

| Tahap | Hasil nyata untuk Bapak | Syarat sebelum mulai | Data/SQL |
|---|---|---|---|
| P0 | Anggota/stok kembali bekerja; backup dapat dipercaya | Audit cloud, backup uji, izin SQL | Kemungkinan migrasi; wajib persetujuan |
| P1 | Meja Kerja harian + tautan terfilter | P0 untuk stok/anggota, API valid | Usahakan tanpa tabel baru |
| P2 | Kinerja Gerai + kualitas data | Definisi hari operasi/kelengkapan disepakati | Agregasi tabel lama; opsi pengaturan perlu izin |
| P3 | Kendala + ringkasan rapat | Alur tugas sumber jelas, cetak diuji | Awal tanpa tabel baru |
| P4 | Opname, setoran, simpanan, keputusan rapat, arsip | Contoh bisnis dan persetujuan model | Tabel/Storage baru; izin terpisah |

Pada akhir setiap tahap, Bapak harus bisa menjawab dengan satu kalimat: “Apa keputusan manajer yang sekarang lebih mudah?” Jika fitur hanya menambah kotak/menu tanpa keputusan baru, jangan dibangun.

## G. Desain antarmuka yang harus diturunkan ke setiap fitur

- Rasa visual: modern, bersih, pastel lembut; latar terang `#F7F8FC`, gelap `#1D2533`, kartu gelap `#252F40`, aksen rose `#A64768`, Plus Jakarta Sans. Status kritis ditunjukkan dengan ikon + teks + warna, bukan warna saja. Satu layar punya satu aksi utama yang paling relevan.
- Hirarki: judul dan satu kalimat manfaat; filter kontekstual; ringkasan; daftar keputusan; rincian bertahap. Jangan menumpuk lima panel penjelasan sebelum data utama. Jangan mengulang kartu KPI yang sama di setiap halaman.
- Desktop 1440×900: konten utama terbaca tanpa harus menggulir beberapa layar untuk menemukan tindakan pertama. Tablet 1024×768 dan 768×1024: 2 kolom bila muat, tombol 44–48 px, sidebar menjadi drawer bila konten sempit. Ponsel 390×844: satu kolom, filter dapat dibuka/tutup, tidak ada tabel terpotong tanpa petunjuk scroll.
- Dropdown dan dialog: label di atas, pilihan aktif/hover jelas di dua tema, fokus keyboard terlihat, teks panjang tidak terpotong tanpa cara membaca lengkap. Native select tetap fallback. Modal panjang punya header dan aksi simpan yang terlihat, pesan galat dekat field, `Escape` tidak menutup saat sedang menyimpan.
- Angka: pemisah ribuan `id-ID`, Rupiah, tanggal WIB, angka negatif jelas; satuan stok eksplisit. Beri label “tercatat”, “perkiraan”, “belum ada data”, “gagal memuat” sesuai makna. Grafik nol tidak menyisakan ruang kosong besar.
- Semua status harus diuji: memuat, data tersedia, data kosong, hasil filter kosong, sebagian sumber gagal, seluruh sumber gagal, menyimpan, berhasil, dan validasi gagal. Aksesibilitas: heading berurutan, aria label/fokus, rincian angka grafik, kontras, zoom 200%, keyboard, reduced motion.

## H. Bentuk implementasi dan kualitas kode

1. Untuk tiap fitur, mulai dengan daftar data yang tersedia, data yang belum ada, definisi hitung, contoh input-output, keputusan bisnis yang perlu Bapak jawab, lalu pilih API/model paling kecil. Jangan langsung membuat UI penuh.
2. Satu fungsi perhitungan kanonikal di `src/lib/` dipakai oleh API/tampilan/ekspor dan diuji pada nol, negatif, null, duplikat, zona WIB dan periode parsial. API mengembalikan metadata periode, waktu pembuatan, status kelengkapan, serta alasan bila perbandingan tidak layak.
3. Validasi parameter query/body dengan Zod. Batasi periode/jumlah baris, paginasi di server, jangan fetch seluruh database ke browser. Supabase error gagal jelas; jangan fallback ke array kosong atau angka nol. Jangan percaya input browser untuk otorisasi/keputusan penting.
4. Pisahkan komponen berdasarkan tanggung jawab: halaman koordinator, filter, kartu/ringkasan, daftar, keadaan kosong/galat. Pakai komponen bersama; jangan membuat versi dropdown/modal baru tanpa alasan. Jangan refaktor modul lain yang stabil tanpa manfaat terukur.
5. Verifikasi `npm.cmd test -- --run`, `npm.cmd run typecheck`, `npm.cmd run build`; tes integrasi API dan UI dengan fixture aman; pemeriksaan browser terang/gelap pada desktop/tablet/ponsel; uji keyboard, zoom dan cetak bila relevan. Catat hasil **yang benar-benar dijalankan** di `docs/STATUS.md` dan `docs/CHANGELOG.md`.
6. Jika pekerjaan mendekati batas konteks/token, tulis checkpoint pada STATUS dan HANDOFF: berkas berubah, perubahan yang sudah diuji, yang belum, error terbuka, keputusan menunggu Bapak, server/port, dan langkah aman berikutnya. Jangan menyatakan selesai hanya karena build sukses.

## I. Pertanyaan bisnis untuk Bapak (tanyakan hanya ketika tahapnya tiba)

1. Apakah semua gerai wajib mengisi rekap setiap hari kalender, atau ada hari tutup yang berbeda per gerai?
2. Apakah target omset bulanan per gerai sudah disepakati resmi? Bila belum, boleh kosong.
3. Siapa penerima setoran kas fisik dan bukti apa yang dianggap sah? Apakah ada penjualan nontunai/kredit?
4. Apakah stok dicatat per gerai, gudang pusat, atau satu angka seluruh koperasi?
5. Apakah catatan “sudah ditinjau” hanya pengingat pribadi, atau bukti audit yang harus permanen?
6. Dokumen apa yang boleh disimpan digital, siapa boleh mengakses, dan bagaimana cadangannya?
7. Apakah nominal simpanan pokok/wajib sudah ditetapkan dalam AD/ART/keputusan rapat? Jangan membuat default.

## J. Batasan eksternal

Petunjuk resmi Kementerian Koperasi membahas manajemen/organisasi, bidang usaha, dan dokumen rapat pendirian. Gunakan sebagai **konteks yang diverifikasi ulang**, bukan alasan menampilkan status “patuh hukum” otomatis. Situs referensi: [JDIH Kementerian Koperasi — petunjuk pelaksanaan Kopdes Merah Putih](https://jdih.kop.go.id/doc/download/file/1745222907_JUKLAK%20NOMOR%201%20KOPDES%20MERAH%20PUTIH%20SALNAN.pdf/t/peraturan) dan [JDIH Kementerian Koperasi — peraturan/pedoman KDKMP](https://jdih.kop.go.id/doc/peraturan_kdmp). Regulasi dapat berubah; sebelum menerapkan aturan hukum/akuntansi tertentu, periksa sumber resmi terkini dan minta peninjauan pihak yang berwenang.

**Mulai tindakan AI berikutnya:** baca checkpoint; laporkan satu paragraf keadaan nyata; usulkan tahap paling aman yang bisa dikerjakan sekarang; implementasikan hanya tahap itu; uji dan dokumentasikan. Jangan menunggu semua jawaban bisnis untuk pekerjaan baca-saja yang aman, tetapi jangan menebak kebijakan koperasi atau menjalankan SQL tanpa izin.
