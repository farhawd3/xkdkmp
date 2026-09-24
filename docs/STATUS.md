# Status Proyek — Kopdes Merah Putih Ladang Laweh

## Checkpoint 24 September 2026 — audit detail desain meja kerja

- Browser terintegrasi dipakai untuk spot-check tablet 884 px pada Meja Kerja, Pemantauan Gerai, Tugas & Agenda, Pemantauan Keuangan, Neraca & SHU, dan Pengaturan. Tidak terlihat halaman melebar atau kartu bertumpuk pada layar yang diperiksa; ini bukan klaim seluruh kondisi data dan dialog telah diuji.
- Temuan Meja Kerja: filter sumber terlalu sempit sehingga pilihan terpotong. Tata letak kini dua kolom pada tablet, dengan pencarian di baris penuh; ukuran teks pencarian 14 px dan tinggi input 48 px. Keadaan kosong tidak lagi menyimpulkan “semua aman” dari daftar tanpa item, melainkan menjelaskan batas data serta memberi pintasan memeriksa rekap gerai.
- Form pencarian Tugas & Agenda mendapat nama yang dapat dibaca pembaca layar; tombol ekspor tetap setinggi sedikitnya 44 px pada tablet. Tidak ada perubahan SQL, API, atau data Supabase. Verifikasi akhir: **208/208 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Spot-check browser Meja Kerja pada 884 px menunjukkan opsi filter terbaca penuh dan keadaan kosong jelas dalam mode terang/gelap; tema dikembalikan ke terang. Server lokal versi terbaru aktif di `http://127.0.0.1:3000`.

## Checkpoint 24 September 2026 — sapaan dashboard mengikuti WIB

- Header Dashboard Manajer kini menampilkan **Selamat pagi/siang/sore/malam!** menurut jam `Asia/Jakarta`, tanpa nama pribadi. Tampilan memakai ikon sesuai waktu, gradasi pastel lembut, dan tombol aksi yang tetap mudah disentuh pada tablet. Dashboard persiapan juga tidak lagi menyebut nama pada judulnya.
- Batas jam diuji otomatis: pagi 04.00–10.59, siang 11.00–14.59, sore 15.00–17.59, malam 18.00–03.59 WIB. Tidak ada perubahan data, API, atau Supabase. Verifikasi: **208/208 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Browser terintegrasi pada lebar tablet memperlihatkan “Selamat malam!” tanpa nama; mode terang dan gelap terbaca baik, lalu tema dikembalikan ke terang. Server lokal versi baru aktif di `http://127.0.0.1:3000`.

## Checkpoint 24 September 2026 — sembilan anotasi browser

- `/kinerja-gerai`: pemilih bulan dan tombol tindakan dipisah dari judul agar tidak berdesakan; filter pada tablet memakai dua kolom lalu pencarian selebar baris; kartu per gerai mempunyai ruang vertikal lebih lapang, panel angka, dan teks minimal 14 px. Angka tetap bersumber dari Supabase tanpa data contoh.
- `/unit-usaha`: dialog tambah/edit gerai diperlebar, identitas dikelompokkan, target dan kesiapan sejajar, status mendapat baris penuh, pilihan status disingkat dengan keterangan terpisah. `/persiapan`: dialog tambah checklist juga diperlebar, kelompok kebutuhan diperjelas, pilihan wajib/opsional tidak lagi terpotong. Form dokumen/risiko di Tata Kelola dan tambah barang Persiapan Stok ikut diberi lebar memadai; tiga pilihan risiko disusun menjadi satu baris kategori dan dua pilihan tingkat. Istilah lama “kasir” pada keterangan Kesiapan diganti menjadi layanan gerai.
- `/tata-kelola`: tab dokumen, notula, dan risiko sekarang mempunyai keadaan kosong dengan ikon, pesan jelas, serta tombol tambah, bukan tabel kosong. `/bantuan`: menambah panduan koperasi, pembukaan gerai, pengendalian kas, dan ritme pemeriksaan mingguan; kartu topik dapat dibuka lewat keyboard serta dilengkapi rujukan JDIH resmi.
- Tidak ada perubahan SQL, API, skema, atau data Supabase. Browser terintegrasi memeriksa Kinerja pada 884 px, dialog gerai/checklist, tata kelola kosong dalam mode terang/gelap, serta halaman Bantuan. Penyimpanan formulir tidak dicoba agar data koperasi tidak berubah. Verifikasi: **202/202 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Server lokal hasil build terbaru aktif di `http://127.0.0.1:3000`.

## Checkpoint 24 September 2026 — audit tampilan dan dropdown lintas menu

- Browser terintegrasi dipakai untuk menelusuri **15 menu aktif** pada lebar desktop dan tablet (884 px). Audit akhir pada 884 px tidak menemukan halaman melebar horizontal, judul utama terpotong, atau dropdown tanpa label. Formulir tugas, rekap gerai, Kesiapan, Kinerja Gerai, Anggota, dan Pengaturan diperiksa lebih rinci; filter Kinerja serta Kesiapan juga dilihat pada mode gelap. Pemeriksaan ini mencakup layar utama dan popup yang relevan, bukan klaim bahwa setiap kemungkinan isi data/semua popup sudah dicoba.
- Nama koperasi pada bagian atas sidebar kini boleh turun dua baris, sehingga **Ladang Laweh** tidak lagi terpotong. Deskripsi judul halaman memakai teks 15 px, jarak baris 24 px, dan panjang baris dibatasi agar lebih mudah dibaca.
- Dropdown filter lama di Meja Kerja, Kinerja Gerai, Stok, Anggota, dan Kesiapan memakai komponen `Select` bersama: tinggi 48 px, teks 14 px, ikon panah konsisten, fokus dan daftar opsi terang/gelap. Filter Kesiapan kini punya label serta kolom yang cukup lebar; pilihan awal disingkat menjadi **Semua sifat**. Versi Stok Persiapan juga diseragamkan.
- Pilihan gerai pada rekap harian sekarang menampilkan **nama gerai** di dalam dropdown dan **kode gerai** pada baris bantuan, sehingga nama tidak tertimpa ikon. Teks pilar Kesiapan yang menyebut POS diganti dengan istilah layanan gerai. Pencarian Anggota diberi label aksesibilitas dan teks lebih besar.
- Tidak mengubah data, API, atau skema Supabase. Verifikasi akhir: **202/202 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses; server lokal `http://127.0.0.1:3000` aktif kembali.

## Checkpoint 24 September 2026 — teks dropdown formulir

- Audit visual pada popup **Tambah Tugas Baru** menemukan nama gerai terpotong karena pilihan dipusatkan dengan ruang kiri-kanan besar, sementara ikon panah memakai ruang di kanan. `Select` bersama sekarang memakai perataan kiri, padding kiri 16 px/kanan 48 px, dan daftar opsinya juga rata kiri. Dropdown HTML biasa mengikuti perataan kiri yang konsisten. Target sentuh dan gaya terang/gelap tetap dipertahankan.
- Popup tugas baru dan tugas dari kendala diperlebar sedikit agar pilihan nama gerai serta kolom PIC lebih lega. Tidak ada perubahan isi pilihan, alur simpan, API, atau database.
- Saat spot-check, nama "Gerai Sembako Nagari" kini terlihat penuh dan opsi dropdown rata kiri. Audit juga menemukan Escape pada daftar pilihan ikut menutup modal induk; pengelolaan fokus diperbaiki untuk menangani fokus pada baris `option`. Uji browser akhir menunjukkan Escape menutup daftar pilihan, sedangkan formulir tugas tetap terbuka. Pemeriksaan menggunakan browser langsung sesuai panduan computer-use; tidak ada data yang disimpan.
- Verifikasi akhir: **202/202 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Server utama `http://127.0.0.1:3000` aktif kembali. Tidak ada SQL, migrasi, atau perubahan Supabase.

## Checkpoint 24 September 2026 — pemilih bulan dan popup panduan

- Dua pemilih bulan yang sebelumnya masih native, yaitu buku rekap pada `/laporan` dan filter `/kinerja-gerai`, diganti dengan komponen `MonthPicker` bersama. Popup menampilkan 12 bulan sebagai tombol besar, navigasi tahun, penanda bulan aktif/bulan ini, batas minimum–maksimum, dan warna terang/gelap. Nilai yang dikirim ke API tetap format `YYYY-MM`; pergantian bulan pada buku rekap tetap mengembalikan halaman ke 1.
- Popup **Panduan cepat manajer** di header kini berupa empat kartu pintasan ke Pemantauan Gerai, Tugas & Agenda, Anggota, dan Keuangan. Status organisasi dan batasan angka akuntansi tetap dijelaskan singkat, sedangkan Panduan Lengkap masih tersedia. Tidak ada data yang diubah oleh popup ini.
- Tidak ada SQL, migrasi, atau perubahan Supabase. Spot-check browser memastikan popup 12 bulan terbuka utuh pada mode terang dan gelap di `/laporan`, pilihan Agustus mengubah periode yang dimuat, serta kontrol yang sama muncul di `/kinerja-gerai`. Popup Panduan cepat diperiksa setelah dibuat lebih ringkas sehingga empat pintasan dan catatan penting terlihat dalam satu tampilan; tema pengguna dikembalikan ke terang.
- Verifikasi akhir: **200/200 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Server utama `http://127.0.0.1:3000` aktif kembali.

## Checkpoint 24 September 2026 — kalender, popup, dan briefing manajer

- Dropdown bersama kini memberi ruang kiri-kanan seimbang untuk judul pilihan; daftar opsi pada browser yang mendukung `base-select` disejajarkan tengah. Fallback browser lama tetap mengikuti kemampuan sistem operasi.
- `DateInput` tidak lagi mengandalkan popup kalender bawaan browser. Kalender baru memakai bahasa Indonesia, navigasi bulan, penanda hari ini/tanggal aktif, tombol kosongkan, batas min/maks, Escape, klik luar, serta warna terang/gelap. Dipakai pada form tugas, tugas dari kendala, persiapan/tata kelola, rekap gerai, dan tanggal jurnal simulasi. Input HTML asli tetap ada untuk form dan validasi.
- Popup `Dialog` bersama diberi garis aksen dan tombol tutup yang lebih jelas. Dashboard mendapat briefing prioritas harian dari **data nyata** (tugas terlambat → gerai belum melapor → stok rendah), lengkap dengan jalan pintas tindakan. Ini aturan sederhana, **bukan analisis AI**.
- Tidak ada SQL, migrasi, atau perubahan Supabase. Pemilih **bulan** pada Kinerja Gerai dan buku rekap masih native; popup-nya dapat berbeda menurut browser. Pengecekan seluruh halaman satu per satu belum diklaim selesai.
- Spot-check browser pada server berakses Supabase nyata: popup tugas, kalender bertingkat, dan dashboard terlihat utuh pada mode gelap; dashboard juga diperiksa pada mode terang. Pilihan tanggal terbukti kembali ke form. Server utama `http://127.0.0.1:3000` dijalankan ulang dan briefing tampil di sana. Pengujian visual tidak menyentuh data koperasi.
- Verifikasi akhir: **198/198 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Tes tambahan memeriksa pemilihan tanggal serta Escape pada kalender tidak menutup form induk.

## Checkpoint 24 September 2026 — pilihan API gerai & buku rekap

- Pengaturan: saat **API · lihat persiapan** dipilih, panel nama sistem dan API key gerai muncul. Kunci hanya sementara di memori server lokal, tidak dikirim kembali ke browser; belum ada penarikan data karena penyedia/format endpoint belum diketahui. OpenAI key tetap tersedia terpisah. **Sumber aktif tetap manual.**
- Form rekap manual sekarang ditolak server bila mencoba memakai `source_type: "api"`; tidak ada label API palsu. Form manual **belum dinonaktifkan** karena belum ada konektor valid atau data API untuk dipratinjau. Alur yang disepakati: API → antrean → pratinjau → persetujuan manajer → database, dan baru setelah konektor aktif input manual dikunci pada cakupan yang sama.
- `/laporan` menampilkan buku rekap operasional per gerai/bulan dari Supabase dengan pagination 25 baris, bukan buku besar akuntansi. Status organisasi kini mengalir dari Pengaturan ke banner/sidebar; tahun buku ke laporan; rekening bank tampil bertopeng sebagai referensi di Keuangan, bukan saldo. Bantuan header lama yang menyebut login/POS/jurnal aktif dibersihkan.
- Rancangan pembukuan lengkap, opsi tambah akun, tahapan API gerai, dan panduan SQL ada di [RENCANA_PEMBUKUAN_DAN_API_GERAI.md](RENCANA_PEMBUKUAN_DAN_API_GERAI.md). Draf SQL **6 tabel baru** ada di `supabase/drafts/20260924000010_accounting_and_unit_import.sql`. **Belum dijalankan di Supabase**, belum diuji pada salinan DB, dan belum menjadi fitur pembukuan aktif. Minta persetujuan eksplisit sebelum migrasi. Standar akuntansi spesifik dan saldo awal masih perlu keputusan pengurus/akuntan.
- Verifikasi akhir: **196/196 tes lulus**, TypeScript 0 galat, build Next.js **41 rute** sukses. Endpoint kunci gerai dan buku rekap lokal HTTP 200; September saat pemeriksaan berisi 0 rekap. Spot-check browser Pengaturan dan Neraca pada mode gelap menunjukkan panel kondisional dan keadaan kosong terbaca. Setelah restart, banner benar-benar menampilkan status tersimpan **Siap Buka Fisik** alih-alih teks lama Mode Persiapan. Server lokal aktif di `http://127.0.0.1:3000`. Halaman `/keuangan/jurnal` lama diberi penanda **Simulasi Lokal**, bukan buku besar resmi.

## Checkpoint 24 September 2026 — tombol API key dan daftar dropdown

- Tombol tampil/sembunyikan API key kini berada **di dalam kolom input**, sejajar tengah dengan target sentuh 44 px; label bantuan tetap berada di bawah kolom.
- Gaya daftar pilihan `select` diterapkan juga ke dropdown HTML biasa di berbagai halaman, bukan hanya komponen `Select`: panel rounded, warna teks/latar konsisten, opsi minimal 44 px, pilihan aktif rose, dan warna gelap yang terbaca. Pada browser yang belum mendukung `appearance: base-select`, warna opsi tetap punya fallback native; bentuk popup tetap mengikuti sistem operasi.
- Spot-check browser: input API key di Pengaturan serta dropdown Status Bisnis dan filter Meja Kerja dibuka dan diperiksa; filter juga diperiksa pada mode gelap, lalu tema dikembalikan ke terang. Tidak ada perubahan data Supabase.
- Verifikasi: **190/190 tes lulus**, TypeScript 0 galat, build Next.js **39 rute** sukses. Server produksi lokal dijalankan ulang di `http://127.0.0.1:3000`.

## Checkpoint 24 September 2026 — input API key OpenAI di Pengaturan

- `/pengaturan` kini memiliki kolom API key OpenAI bertipe sandi, tombol tampil/sembunyikan, simpan sementara, uji koneksi, dan hapus. Status hanya menyatakan terpasang/belum; nilai kunci tidak dikirim kembali ke browser.
- Kunci dari form hidup **hanya di memori proses server lokal**, hilang ketika server dimulai ulang, dan tidak masuk Supabase, Git, atau penyimpanan browser oleh aplikasi. Alternatif yang lebih menetap adalah `OPENAI_API_KEY` di environment server. Form dan uji koneksi dibatasi untuk akses loopback lokal, bukan Vercel/LAN tanpa TLS dan pengelolaan rahasia yang tepat.
- Tombol uji koneksi memeriksa penerimaan kunci melalui endpoint model OpenAI tanpa mengirim data koperasi. **Analisis AI atas tugas belum diaktifkan**; sambungan API keuangan juga belum aktif.
- Tidak ada SQL/migrasi atau perubahan data Supabase. Pengujian akhir: **189/189 tes lulus**, TypeScript 0 galat, build Next.js **39 rute** sukses. Halaman Pengaturan telah diperiksa secara visual di browser; uji koneksi dengan kunci asli belum dilakukan.

## Checkpoint 24 September 2026 — keuangan jujur & grafik operasional

- `/keuangan` diperbarui menjadi pemantauan operasional dengan grafik omset tujuh hari, angka rinci, dan pemisahan setoran dilaporkan dari saldo kas. Mode manual tetap aktif melalui `/monitoring`; kartu sumber API abu-abu/belum aktif karena penyedia belum ditentukan.
- `/laporan` kini halaman kesiapan Neraca/SHU. Angka utang nol tanpa bukti, klaim kas fisik bendahara, dan simulasi pembagian SHU tanpa keputusan RAT dihapus dari respons keuangan/UI. Neraca dan SHU resmi **belum tersedia** sampai jurnal, saldo awal, HPP, kewajiban, pajak, dan keputusan RAT tercatat.
- Pada checkpoint ini, `/pengaturan` baru menampilkan status integrasi tanpa kolom kunci; kolom OpenAI sementara ditambahkan pada checkpoint berikutnya di atas. Pilihan penyedia API keuangan tetap menunggu Bapak. Alur dan keputusan migrasi berikutnya ada di [RENCANA_INTEGRASI_DAN_AKUNTANSI.md](RENCANA_INTEGRASI_DAN_AKUNTANSI.md).
- API keuangan memakai hitungan sen integer dan menolak ringkasan bila jumlah rekap lebih besar dari baris yang diambil. **Tidak ada SQL atau perubahan Supabase** pada checkpoint ini. Tahap API persetujuan impor dan akuntansi resmi akan memerlukan migrasi baru yang harus dijelaskan dan disetujui sebelum dijalankan.
- Verifikasi akhir: **186/186 tes lulus (22 berkas)**, TypeScript 0 galat, build Next.js **37 rute** sukses setelah penyelarasan nama menu. GET `/api/finance/summary` pada Supabase nyata HTTP 200 dengan tujuh hari tren dan status laporan resmi `false` (saat cek, 0 rekap). Spot-check `/laporan` dan `/keuangan` pada browser menunjukkan teks/kartu tidak bertumpuk; `/keuangan` juga diperiksa pada mode gelap. Grafik **berisi data** belum dapat diuji karena rekap nyata saat ini kosong. Server build final kembali aktif di `http://127.0.0.1:3000` dengan izin jaringan.

## Pemeriksaan runtime 24 September 2026 — gagal memuat massal teratasi

- Saat server produksi lokal dijalankan dalam sandbox tanpa izin jaringan keluar, 10 API inti mengembalikan HTTP 500 dengan `TypeError: fetch failed`. Host Supabase dapat diakses dari luar sandbox (uji HTTPS tanpa kredensial menghasilkan HTTP 401 yang wajar), sehingga kegagalan massal bukan bukti kerusakan tabel.
- Server lokal dihentikan lalu dijalankan ulang dengan izin jaringan pada `http://127.0.0.1:3000`. Pemeriksaan ulang memberi HTTP **200 untuk 10/10 API**: dashboard eksekutif, Meja Kerja, Kinerja Gerai, anggota, stok, tugas, gerai, rekap monitoring, profil organisasi, dan ringkasan keuangan. Minta pengguna memuat ulang halaman browser jika masih menampilkan galat lama.
- Tidak ada perubahan kode, SQL, atau data Supabase dalam pemeriksaan ini. Status penerapan migrasi 00009 di ledger Cloud belum diverifikasi; catatan P0 di bawah merupakan riwayat galat sebelumnya, bukan bukti API saat ini masih 500. Server aktif pada sesi lokal saat catatan ini ditulis.

## Checkpoint 24 September 2026 — fondasi redesain dan grafik pelaporan

- Direktori terbaru dibaca sebelum perubahan. Modul **Meja Kerja** dan **Kinerja Gerai** beserta perubahan Git yang belum di-commit dipertahankan; keduanya sudah ada sebelum checkpoint ini.
- Fondasi visual lintas aplikasi diperbarui lewat `globals.css`, `AppShell`, `Card`/`CardMetric`, `PageHeader`, `RelatedPages`, `Header`, `Sidebar`, `Button`, `DataTable`, `Dialog`, dan gaya field. Permukaan lebih netral, gradasi pastel lebih tipis, kartu dan bayangan konsisten, judul lebih ringkas, navigasi terkait berbentuk chip, target sentuh tetap minimal 44 px. Ini penyegaran komponen bersama, **bukan klaim setiap halaman sudah direka ulang/diinspeksi satu per satu**.
- Fitur baru setelah fondasi visual: grafik **Keterisian Rekap 7 Hari** di dashboard dan CSV. API eksekutif menghitung jumlah gerai aktif unik yang memiliki rekap per tanggal dari query mingguan yang sudah ada; laporan ganda tidak menaikkan angka. Jika tidak ada gerai aktif, persentase `null` dan muncul pesan “belum berlaku”. Grafik menjelaskan bahwa hari tutup belum dimodelkan, sehingga ini bukan nilai kepatuhan resmi. Perhitungan murni ada di `src/lib/reporting-trend.ts`.
- Halaman Panduan diperbarui agar tidak lagi memandu kasir/PO/jurnal otomatis atau menyebut data sesi dan login yang sudah tidak sesuai produk. Isi kini berfokus pada Meja Kerja, rekap/kinerja, stok, anggota dan batas angka keuangan.
- Verifikasi kode: **184/184 tes lulus (21 berkas)**, TypeScript tanpa galat, build Next.js sukses **37 rute**. Tes baru mencakup gerai aktif unik, laporan duplikat, gerai nonaktif dan keadaan tanpa gerai aktif.
- Spot-check browser tablet mode terang dan gelap pada `/bantuan` menunjukkan header, chip, dan kartu terbaca serta tidak bertumpuk. Label status Supabase kini hanya menyatakan konfigurasi tersedia, bukan koneksi berhasil. Dashboard dan Kinerja Gerai membuka halaman, tetapi query nyata mengembalikan `TypeError: fetch failed` pada lingkungan pengujian ini; grafik berisi data **belum terverifikasi secara visual**. Uji ulang saat koneksi Supabase tersedia. Ini tidak membuktikan migrasi 00009 telah diterapkan; status cloud tetap perlu verifikasi tersendiri.
- Tidak ada SQL, migrasi, data koperasi, atau konfigurasi Supabase yang diubah. Pekerjaan lanjutan: audit visual tiap modul terang/gelap, grafik berisi data, query pagination >1.000, backup/restore atomik setelah keputusan Bapak. Server lokal dijalankan pada `http://127.0.0.1:3000` untuk spot-check sesi ini.

Terakhir diperbarui: 24 September 2026 — Fondasi visual v2.9.4 dan grafik keterisian rekap; audit semua halaman masih berlanjut.

## Tahap P2: Kinerja Gerai (`/kinerja-gerai`) — SELESAI (v2.9.3)

- **Tujuan**: Pemantauan komparatif capaian target bulanan, keterisian rekapitulasi harian terhadap hari kalender berjalan, dan selisih operasional seluruh unit usaha koperasi secara adil dan jujur tanpa tabel database baru.
- **Modul Kalkulasi Kanonikal**: [`src/lib/unit-performance.ts`](../src/lib/unit-performance.ts)
  - Aturan bisnis kejujuran data:
    1. Target 0 / belum disepakati = "Target belum ditetapkan", bukan "0%".
    2. Keterisian rekap dihitung terhadap hari kalender yang telah berjalan (`calendarDaysElapsed`), bukan total sebulan jika bulan masih aktif.
    3. Perbandingan periode adil (*fair comparison*): tidak membuat klaim sepihak jika data pembanding bulan lalu belum lengkap (<50% hari lapor).
    4. Selisih operasional = Omset - Pengeluaran (dengan catatan edukasi bahwa ini bukan laba bersih resmi / SHU).
- **Backend & Route Handler**: [`src/app/api/manager/unit-performance/route.ts`](../src/app/api/manager/unit-performance/route.ts)
  - Menerima parameter query `month` (`YYYY-MM`) dan `unitId` dengan validasi Zod.
  - Mengambil data dari 2 tabel Supabase: `business_units` dan `unit_daily_reports` (bulan berjalan + periode setara bulan lalu).
  - Dilindungi proteksi akses privat (`verifyPrivateApiAccess`).
- **Halaman Antarmuka**: [`src/app/kinerja-gerai/page.tsx`](../src/app/kinerja-gerai/page.tsx)
  - Header dengan pemilih bulan interaktif (`input[type="month"]`), tombol Perbarui, dan Unduh CSV.
  - 4 Kartu Metrik Ringkas (Total Omset Terhimpun, Capaian Target Koperasi, Rata-rata Keterisian Rekap, Selisih Operasional).
  - Bilah filter interaktif (Status Gerai, Jenis Usaha, Pencarian Teks Cepat).
  - Tampilan Desktop: Tabel performa dengan visual progress bar target, badge status, hari rekap, selisih operasional, tren vs bulan lalu, kendala terakhir, dan tombol 1-klik menuju `/monitoring?unitId=...`.
  - Tampilan Tablet & Mobile: Kartu responsif bertingkat dengan area sentuh nyaman 44–48 px.
  - Kotak edukasi transparansi metodologi di bagian bawah.
- **Integrasi Navigasi**: Menu Kinerja Gerai ditambahkan di Sidebar pada kelompok **Operasional Gerai** (ikon `BarChart3`).
- **Verifikasi Kualitas**:
  - Unit test otomatis: **182/182 lulus 100% (20 berkas uji)** termasuk 13 tes komprehensif baru di [`tests/unit-performance.test.ts`](../tests/unit-performance.test.ts).
  - TypeScript strict: 0 galat (`tsc --noEmit` bersih).
  - Next.js production build: **37 rute** sukses terkompilasi optimal (termasuk `/kinerja-gerai` dan `/api/manager/unit-performance`).
  - Evaluasi nyata peramban: Diuji langsung dengan *browser subagent* pada desktop dan tablet, dark/light mode, dan touch target 44–48 px.

---

## Tahap P1: Meja Kerja Manajer (`/meja-kerja`) — SELESAI (v2.9.2)

- **Tujuan**: Satu antrian tindak lanjut terpadu lintas gerai, tugas, kendala, dan ketersediaan stok tanpa tabel database baru.
- **Backend & Route Handler**: [`src/app/api/manager/work-desk/route.ts`](../src/app/api/manager/work-desk/route.ts)
  - Menghimpun data secara deterministik ke dalam 4 kelompok urgensi:
    1. `perlu_sekarang`: tugas lewat tenggat (*overdue*), tugas prioritas mendesak, dan stok habis (0 unit fisik).
    2. `hari_ini`: tugas jatuh tempo hari ini dan gerai aktif yang belum mengisi rekap harian hari ini.
    3. `pantau`: stok menipis ($0 < \text{stok} \le \text{min}$) dan catatan kendala lapangan 7 hari terakhir.
    4. `selesai`: gerai aktif yang sudah sukses rekap hari ini dan tugas yang telah diselesaikan hari ini.
  - Fail-fast & transparansi parsial: jika salah satu query terganggu, kesalahan dicatat dalam `partialErrors` tanpa menggagalkan seluruh halaman atau memalsukan data menjadi nol.
- **Halaman Antarmuka**: [`src/app/meja-kerja/page.tsx`](../src/app/meja-kerja/page.tsx)
  - 4 kartu metrik (Total Antrian, Perlu Sekarang, Hari Ini, Dalam Pantauan).
  - Bilah filter responsif (Urgensi, Sumber Data, Pencarian teks).
  - Kartu antrian dengan badge tingkat perhatian, nama gerai, PIC, dan tombol aksi 1-klik menuju rute terfilter (`/pekerjaan`, `/monitoring`, `/stok`).
  - Empty state cerdas dan banner peringatan parsial.
- **Integrasi Navigasi**: Menu Meja Kerja ditambahkan di Sidebar pada kelompok **Menu Utama** (ikon `Inbox`).
- **Verifikasi Kualitas**:
  - Unit test otomatis: **169/169 lulus 100% (19 berkas uji)** termasuk 4 tes komprehensif baru di [`tests/work-desk.test.ts`](../tests/work-desk.test.ts).
  - TypeScript strict: 0 galat (`tsc --noEmit` bersih).
  - Next.js production build: **35 rute** sukses terkompilasi optimal (termasuk `/meja-kerja` dan `/api/manager/work-desk`).

---

## Tahap P0: Penyelarasan Skema Anggota & Stok di Supabase Cloud (Siap Dijalankan)

- **Tujuan**: Menghilangkan galat HTTP 500 pada `/api/members` dan `/api/stock-simple` akibat perbedaan kolom di Supabase Cloud lama.
- **Berkas Migrasi Resmi**: `supabase/migrations/20260923000009_align_members_products.sql` (dan draft di `supabase/drafts/20260923000009_align_members_products.sql`).
- **Jaminan Keamanan**: Transaksional atomik (`BEGIN ... COMMIT`), tidak menghapus tabel/baris, menyelaraskan `member_number` $\leftrightarrow$ `member_no` dengan trigger otomatis, menambahkan kolom pelengkap `notes`, `is_archived`, dan `unit_id`.
- **Status Database**: Menunggu eksekusi oleh Bapak Abdul Halim di Supabase SQL Editor.

---

## Rancangan tambahan menu/fitur untuk AI berikutnya — 23 September 2026

- Prompt siap pakai dan lebih rinci dibuat di [prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md](../prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md). Usulan menu baru: **Meja Kerja** dan **Kinerja Gerai**; fitur lain diutamakan sebagai tab pada modul yang ada agar sidebar tidak penuh.
- Spesifikasi mencakup antrian prioritas, target dan perbandingan gerai, daftar kendala, ringkasan rapat, kualitas data, jejak stok/opname, rekonsiliasi setoran, buku simpanan anggota, keputusan rapat, arsip dokumen, dan preferensi manajer. Dipisahkan antara yang dapat dirancang dari tujuh tabel dan yang memerlukan keputusan bisnis/migrasi.
- Ini **hanya dokumentasi/rencana**. Tidak ada menu/API/tabel baru yang diimplementasikan dan tidak ada perubahan Supabase pada langkah ini. P0 tetap kompatibilitas anggota/stok dan keselamatan backup; butuh persetujuan sebelum SQL/cloud. Tes 165/165 dan build di bawah adalah hasil perubahan kode dashboard sebelumnya, bukan verifikasi fitur rancangan ini.

## Lanjutan perapian dashboard dan rancangan berikutnya — 23 September 2026

- Header dashboard disatukan menjadi satu baris identitas/sapaan/tanggal/pembaruan dengan aksi di sisi kanan pada desktop; baris “Lanjutkan ke” dan sapaan berulang tidak dipakai pada dashboard produksi. Isi API dan perhitungan KPI tidak diubah.
- Grafik omset 7 hari kini menampilkan pesan kosong dan tautan ke pemantauan jika seluruh nilai tercatat 0, bukan bidang grafik tinggi tanpa informasi. Rincian angka per hari tetap tersedia.
- Rancangan **fitur baru yang belum dibuat**, urutan kerja, kriteria penerimaan, serta panduan desain/QA untuk AI berikutnya ada di [ROADMAP_MANAJER_BERIKUTNYA.md](ROADMAP_MANAJER_BERIKUTNYA.md). Prioritas tetap perbaikan kompatibilitas cloud anggota/stok dengan persetujuan Bapak, lalu keselamatan backup, baru fitur manajer.
- Verifikasi setelah perubahan ini: **165/165 tes lulus (18 berkas)**, `npm.cmd run typecheck` tanpa galat, `npm.cmd run build` sukses (33 rute). Browser nyata diperiksa pada dashboard 1440×900 gelap/terang, 1024×768 gelap/terang, dan 390×844 terang: header, tombol dan KPI tidak bertumpuk. Keadaan grafik kosong terlihat di struktur aksesibilitas; varian grafik berisi belum diuji karena data nyata saat ini nol. Ponsel gelap untuk perubahan ini belum diperiksa.
- Tidak ada perubahan SQL, Supabase Cloud, atau data koperasi pada sesi ini.

## Checkpoint aktif — penyegaran manajer v2.9 (23 September 2026)

Bagian ini menggantikan klaim “seluruh sistem terverifikasi penuh” pada catatan lama. Fondasi v2.8 dipertahankan, tetapi audit lanjutan menemukan sambungan fitur yang belum teruji perilakunya.

### Selesai pada sesi ini

- Dashboard lebih ringkas dengan empat indikator, sapaan/profil dinamis, waktu pengambilan data WIB, filter tindak lanjut (tugas/gerai/stok), deduplikasi tugas, rincian angka grafik, dan unduhan ringkasan CSV aman. Daftar prioritas dijelaskan sebagai cuplikan, bukan seluruh data/backup.
- Kepatuhan menggunakan gerai aktif saja. Rekap bulan dashboard dibatasi sampai hari ini. Galat profil server dan klien tidak lagi diabaikan. Label selisih operasional tidak mengklaim laba bersih.
- Header halaman bersama lebih bersih. Dropdown bersama mendapat picker dengan sudut lembut, warna pilihan/hover, area sentuh 44px dan tema gelap melalui progressive enhancement CSS; browser lama tetap native. Hover tombol utama dark mode diperbaiki agar teks putih tidak hilang.
- Kalender memakai hari WIB, memilih awal bulan ketika navigasi bulan, susunan panel vertikal sampai desktop lebar, area aksi 44px dan penanda hari ini aksesibel.
- **Bug nyata diperbaiki:** agenda baru dari kalender tidak lagi mengirim PATCH dengan ID kosong; kendala menjadi tugas mengirim `belum_mulai` (bukan `rencana`) dan mempertahankan prioritas mendesak. PIC mengikuti profil, tanggal memakai kontrol bersama, penutupan modal saat menyimpan dibatasi.
- Daftar gerai/tugas/rekap gagal dimuat kini menampilkan galat, bukan daftar kosong seolah sukses. PATCH anggota divalidasi Zod, termasuk boolean arsip; tanggal anggota baru mengikuti WIB. Target gerai baru tidak lagi diisi nominal rekaan; wilayah/PIC dari profil.
- Batas privat diperketat: header `x-forwarded-for`/`x-real-ip` tidak membuka akses; IPv6 loopback diperbaiki; rahasia URL `kopdes_key` tidak lagi diterima; cookie rusak tidak memicu 500; mutasi lintas origin/skema ditolak. `npm.cmd run dev` dan `npm.cmd start` bind **127.0.0.1**. **LAN/tablet tidak otomatis terbuka**; perlu gateway privat yang disetujui, bukan membagikan Service Role atau kunci di URL. Jangan deploy tanpa batas jaringan tepercaya.

### Verifikasi dan batasnya

- Baseline sebelum perubahan: 153/153 tes lulus.
- Setelah perubahan: **165/165 tes lulus (18 berkas)**, `npm.cmd run typecheck` lulus tanpa galat, dan `npm.cmd run build` sukses (33 rute) pada 23 September 2026.
- Pemeriksaan browser nyata: dashboard terang/gelap desktop 1440×900, kalender dan modal agenda tablet 768×1024, modal ponsel 390×844, serta pemantauan gelap tablet 1024×768 setelah penyesuaian breakpoint. Pilihan gerai tetap satu baris dan header tidak bertumpuk pada ukuran tablet. Daftar gerai, keuangan, anggota, dan stok juga dibuka di browser; dua yang terakhir menampilkan galat karena skema cloud, bukan data kosong.
- Tata letak sidebar/header/form pemantauan memakai breakpoint desktop lebih lebar agar tablet 1024 px mendapat ruang kerja penuh. Pesan galat stok tidak lagi menyebut sesi akun pada aplikasi tanpa login.
- Tambahan tes: `manager-refresh.test.ts`, `monitoring-task-flow.test.tsx`, `executive-refresh.test.ts`. Fixture ID anggota pada `phase11-refactor-quality.test.ts` diganti UUID sah, bukan melonggarkan validasi.
- Tidak ada SQL, migrasi cloud, atau data operasional yang diubah. Belum ada uji CRUD pada database nyata; tes mutasi menggunakan mock.
- Banyak perubahan v2.3–v2.8 sudah ada di Git sebelum sesi ini. Jangan reset/revert seluruh workspace; perubahan sesi ini berada di atasnya.

### Belum selesai / serah terima lanjutan

0. **BLOKER CLOUD TERBUKTI — anggota dan stok:** smoke test HTTP nyata menemukan `/api/members` 500 (`members.member_number does not exist`) dan `/api/stock-simple` 500 (`products.notes does not exist`). Pembacaan OpenAPI Supabase (read-only, tanpa mengubah data) menunjukkan skema lama masih ada: `members.member_no` (bukan member_number), tidak ada notes, `phone` dan `domicile` NOT NULL; status enum juga mencakup terverifikasi/keluar. `products` tidak punya notes; current_stock/min_stock bertipe integer, bukan NUMERIC(12,2) seperti migrasi 00007. Penyebab konsisten dengan `CREATE TABLE IF NOT EXISTS` yang tidak memperbarui tabel yang sudah ada. **Jangan menjalankan ulang migrasi clean_simple_schema** (berisi operasi lain). Tinjau constraint/index/FK dan pemakai repository legacy; usulkan migrasi ADITIF terpisah untuk notes, penyelarasan nomor anggota tanpa kehilangan member_no, kebijakan kolom wajib lama, serta presisi stok. Minta persetujuan pengguna atas SQL konkret sebelum eksekusi. Alternatif adapter ke skema lama harus juga mencakup POST/PATCH, impor, backup dan nullability, bukan sekadar membuat GET berhasil. Draf SQL aditif disiapkan di `supabase/drafts/20260923000009_align_members_products.sql`; belum diuji PostgreSQL atau dijalankan. Penjelasan dan syarat pra-eksekusi ada pada bagian teratas HANDOFF.md. Tes 165 lulus memakai mock, bukan bukti kompatibilitas skema produksi.

1. **Backup/restore adalah prioritas keselamatan:** restore saat ini upsert per tabel, bukan transaksi atomik; validasi baris masih `record(unknown)`. UI sudah diberi peringatan penimpaan/kemungkinan hasil parsial. Jangan menguji restore dengan data produksi. Pengguna telah ditanya mengenai rancangan SQL transaksi restore. Belum ada draf restore atomik; draf 00009 hanya menyelaraskan tabel anggota/stok dan tidak memperbaiki restore. Tinjau skema aktual, whitelist kolom, UUID/relasi, batas ukuran, konflik identitas profil, lalu siapkan fungsi transaksi setelah persetujuan ruang lingkup. SQL cloud tetap butuh konfirmasi isi SQL.
2. **Batas jumlah data:** audit pagination seluruh query Supabase, terutama backup, dashboard, laporan, anggota dan stok. Query tanpa pagination bisa terpotong oleh batas server. Jangan mengklaim backup lengkap sebelum uji >1.000 baris.
3. Lengkapi audit visual semua halaman/varian ukuran dan tema yang belum dilihat; khususnya keyboard, zoom 200%, print multipage, serta halaman keuangan/laporan/pengaturan. Pemeriksaan browser di atas adalah sampel, bukan audit penuh.
4. Uji CRUD lengkap di database/fixture khusus uji yang disepakati: anggota/import, gerai, rekap konflik tanggal, stok, tugas, profil. Jangan menciptakan transaksi palsu di data operasional.
5. Periksa keuangan/jurnal dan repository persiapan tersisa; pisahkan simulasi dari laporan nyata; audit presisi uang, kelengkapan validasi tanggal/query dan batas input.
6. Fitur lanjutan yang relevan setelah keselamatan data: capaian target per gerai, periode pembanding dengan kelengkapan rekap, filter tautan langsung ke item, pengingat review manajer. Jangan tambah tabel/layanan berbayar tanpa pembahasan.

### Berkas implementasi sesi ini

`src/app/dashboard/ProductionDashboard.tsx`, `src/lib/manager-summary.ts`, `src/app/api/dashboard/executive/route.ts`, `src/lib/OrganizationContext.tsx`, `src/components/layout/PageHeader.tsx`, `src/components/ui/Select.tsx`, `src/components/ui/DateInput.tsx`, `src/app/globals.css`, `src/components/pekerjaan/TaskCalendarView.tsx`, `src/components/pekerjaan/TaskFormModal.tsx`, `src/app/pekerjaan/page.tsx`, `src/components/monitoring/MonitoringTaskModal.tsx`, `src/components/monitoring/MonitoringHistoryTable.tsx`, `src/components/monitoring/MonitoringPeriodicSummary.tsx`, `src/app/monitoring/page.tsx`, `src/app/unit-usaha/page.tsx`, `src/app/api/members/route.ts`, `src/lib/validations/simple-schemas.ts`, `src/lib/security/private-access.ts`, `src/lib/supabase/middleware.ts`, `src/app/pengaturan/page.tsx`, `package.json`, dan empat berkas tes di atas. Dokumentasi: STATUS, CHANGELOG, HANDOFF, DECISIONS, DESIGN_SYSTEM dan README.

---

## Arsip checkpoint v2.8

Terakhir diperbarui: 23 September 2026 — Seluruh 6 Tahap Eksekusi Selesai.
Checkpoint aktif: **Tahap 6 Selesai — Kerapian Kode, Efisiensi, & Verifikasi Menyeluruh (v2.8.0)**.
Dokumen acuan serah terima utama: [docs/HANDOFF.md](HANDOFF.md).
Catatan perubahan kronologis: [docs/CHANGELOG.md](CHANGELOG.md).
Aturan kerja utama: [AGENTS.md](../AGENTS.md).

## Status Eksekusi Roadmap (Seluruh Tahap 1 s.d. 6 Selesai)

Aplikasi berada dalam status produksi terverifikasi penuh (**153/153 Vitest lulus, 0 TypeScript error, Next.js build sukses**):

| Pekerjaan | Status | Penjelasan & Hasil Akhir |
|---|---|---|
| **Tahap 1: Aplikasi pribadi tanpa login/user** | **SELESAI** | Dashboard langsung terbuka tanpa login; menu akun & tombol masuk/keluar dihapus; akses privat dilindungi; anti-CSRF aktif; referensi `created_by` diset `null`. |
| **Tahap 2: Kejujuran data & audit perhitungan** | **SELESAI** | Pembersihan angka fiktif di `/api/finance/summary` (kas bank 25jt, aset 15jt, valuasi stok 20rb dihapus); kueri gagal ditangani fail-fast (status 500, tanpa masking nol); setoran kas bernilai 0 dipertahankan; kerugian/defisit negatif didukung; zona waktu bisnis WIB (`Asia/Jakarta`) aktif; evaluasi kepatuhan lapor hanya untuk gerai aktif; disclaimer simulasi SHU AD/ART ditambahkan. |
| **Tahap 3: Kustomisasi profil permanen** | **SELESAI** | Skema `organization_profile` (migrasi 00008) sukses diterapkan di Supabase; endpoint GET/PATCH `/api/organization/profile` terproteksi privat; `OrganizationContext` membagikan profil ke Header & Sidebar secara dinamis; halaman `/pengaturan` tersambung langsung ke database Supabase dengan validasi Zod. |
| **Tahap 4: Audit & perbaikan visual seluruh halaman** | **SELESAI** | Penggantian konfirmasi browser dengan `ConfirmDialog`; pemisahan `TaskCalendarView` modular; filter bersama aktif di mode daftar & kalender; panel tugas fleksibel tanpa tenggat; standardisasi target sentuh tablet (44–48 px) & kontras dark mode. |
| **Tahap 5: Fitur fokus manajer** | **SELESAI** | Panel Fokus Hari Ini di dashboard; filter periode/status/pencarian + reset filter + ekspor CSV aman di `/monitoring`, `/pekerjaan`, `/stok`; ringkasan berkala & format cetak A4 resmi; modal kendala lapangan jadi tugas; backup/restore JSON di `/pengaturan`. |
| **Tahap 6: Refaktor & uji menyeluruh** | **SELESAI** | Penyatuan model kanonikal di `src/types/models.ts`; modularisasi halaman raksasa (`/monitoring`, `/pekerjaan`, `/anggota`, `/stok`); pembersihan mock warisan pada rute detail `/unit-usaha/[id]` dan `/anggota/[id]` dialihkan ke Supabase; 153 unit test lulus 100%. |

---

## Ringkasan Checkpoint Tahap 6 (v2.8.0)

1. **Penyatuan Model Data Kanonikal (`src/types/models.ts`)**:
   - Mendefinisikan tipe TypeScript murni yang memetakan langsung ke 7 tabel PostgreSQL Supabase: `TaskItem`, `BusinessUnit`, `DailyReportRecord`, `MemberRecord`, `CatalogProduct`, dan `UnitOption`.
   - Menghapus ketergantungan tipe parsial yang berserakan antar-halaman.
   - Diekspor kembali melalui `src/types/index.ts` untuk kompatibilitas mundur.

2. **Pembersihan Pemanggilan Mock Warisan pada Subhalaman Detail**:
   - `/unit-usaha/[id]`: Dihubungkan langsung ke endpoint riil `GET /api/units?id=...`. Form edit unit menggunakan `PATCH /api/units`. Menghapus impor `preparationRepository`.
   - `/anggota/[id]`: Dihubungkan langsung ke endpoint riil `GET /api/members?id=...`. Ubah status anggota ("Aktif" / "Calon") dan pengarsipan warga terhubung ke `PATCH /api/members`. Menghapus impor `preparationRepository`.

3. **Modularisasi Halaman Raksasa Menjadi Subkomponen Ramping**:
   - `/monitoring` (turun drastis dari 1.148 baris $\to$ 157 baris koordinator):
     - `src/components/monitoring/MonitoringReportForm.tsx`: Form input rekap harian & kalkulasi laba instan.
     - `src/components/monitoring/MonitoringHistoryTable.tsx`: Tabel riwayat laporan, filter terpadu, dan ekspor CSV.
     - `src/components/monitoring/MonitoringPeriodicSummary.tsx`: Agregasi omset/laba per gerai & format cetak resmi A4.
     - `src/components/monitoring/MonitoringTaskModal.tsx`: Konversi kendala lapangan menjadi tugas tindak lanjut.
   - `/pekerjaan` (turun dari 860 baris $\to$ 348 baris koordinator):
     - `src/components/pekerjaan/TaskFormModal.tsx`: Modal tambah/edit tugas manajer.
     - `src/components/pekerjaan/TaskList.tsx`: Daftar tugas dengan filter dinamis & aksi status 1-klik.
     - `src/components/pekerjaan/TaskCalendarView.tsx`: Kalender visual agenda kerja.
   - `/anggota` (turun dari 874 baris $\to$ 332 baris koordinator):
     - `src/components/anggota/MemberAddModal.tsx`: Modal pendaftaran anggota baru ke `/api/members`.
     - `src/components/anggota/MemberImportModal.tsx`: Modal impor berkas CSV ke `/api/members`.
     - Halaman utama khusus tabel ringkas, pencarian, filter status, dan ekspor CSV terproteksi privasi warga (tanpa mengekspor NIK).
   - `/stok` (turun dari 973 baris $\to$ 10 baris koordinator):
     - Delegator ramping memisahkan antara `ProductionStockPage.tsx` (stok fisik & komoditas riil) dan `PreparationStockPage.tsx` (arsip simulasi logistik persiapan).

4. **Verifikasi Kualitas Menyeluruh**:
   - **Vitest Unit Test**: **153/153 Lulus 100%** (15 berkas uji termasuk 11 tes arsitektur baru di `tests/phase11-refactor-quality.test.ts`).
   - **TypeScript Strict**: 0 galat (`tsc --noEmit` bersih sempurna).
   - **Next.js Production Build**: 33 rute berhasil dikompilasi optimal tanpa peringatan build.

---

## Ringkasan Checkpoint Tahap 5 (v2.7.0)

1. **Panel Fokus & Tindakan Hari Ini di Dashboard**:
   - Menghimpun 3 pilar operasional mendesak:
     - Tugas terlambat / jatuh tempo hari ini (badge merah/amber) dengan tautan langsung ke `/pekerjaan`.
     - Gerai aktif yang belum menyetor rekapitulasi harian dengan tautan langsung ke `/monitoring`.
     - Komoditas stok fisik yang menipis atau kosong dengan tautan langsung ke `/stok`.
   - Menampilkan status prima hijau jika seluruh operasional hari ini terpantau aman dan terkendali.
   - Endpoint `/api/dashboard/executive` diperluas dengan kueri stok menipis dan tugas jatuh tempo hari ini berbasis WIB.

2. **Konsistensi Filter, Pencarian, & Ekspor CSV Aman**:
   - `/monitoring`: Filter periode preset ("Semua", "Hari Ini", "7 Hari Terakhir", "Bulan Ini"), filter catatan kendala ("Semua", "Hanya Ada Kendala", "Tanpa Catatan"), pencarian teks, indikator jumlah hasil, tombol Reset Filter, dan tombol Ekspor CSV terfilter.
   - `/pekerjaan`: Indikator jumlah hasil terfilter, tombol Reset Filter, dan tombol Ekspor CSV daftar tugas.
   - `/stok`: Indikator jumlah hasil terfilter, tombol Reset Filter, dan tombol Ekspor CSV katalog stok fisik.
   - `src/lib/csv.ts`: Sanitasi formula berbahaya (`=`, `+`, `-`, `@`, `\t`, `\r`) dan fungsi `downloadCsvFile` berawalan UTF-8 BOM untuk Excel Windows.

3. **Ringkasan Berkala & Format Cetak Resmi di `/monitoring`**:
   - Tab "Ringkasan Berkala & Format Cetak": agregasi data riil (omset kotor, pengeluaran kas, laba bersih, setoran kas, kepatuhan hari) per gerai.
   - Tombol Cetak / Simpan PDF (`window.print()`) dengan stylesheet print bersih (sembunyikan elemen non-cetak).
   - Memuat kop resmi koperasi dari database, tanggal cetak WIB, tanda tangan Manajer Koperasi, dan disclaimer resmi operasional internal.

4. **Alur "Jadikan Kendala sebagai Tugas" di `/monitoring`**:
   - Tombol "Jadikan Tugas" pada setiap catatan kendala laporan gerai.
   - Modal dialog dengan data terisi otomatis: judul, deskripsi konteks gerai dan tanggal, PIC default Abdul Halim, tenggat waktu besok WIB (`getTomorrowWIB()`), dan prioritas tinggi.
   - Deteksi pencegahan duplikasi cerdas jika sudah ada tugas aktif serupa.

5. **Pencadangan & Pemulihan Sistem (Backup & Restore JSON) di `/pengaturan`**:
   - `GET /api/backup`: Menghasilkan arsip `.json` lengkap dari 6 entitas (profil, gerai, tugas, produk stok, anggota, rekap harian).
   - `POST /api/backup`: Menerima berkas cadangan JSON, memvalidasi struktur dengan Zod (`BackupFileSchema`), dan memulihkan data ke Supabase dengan transaksi upsert aman.
   - Modal konfirmasi `ConfirmDialog` sebelum pemulihan data dieksekusi.
   - Panel edukasi perbedaan mendasar antara Ekspor CSV (analisis spreadsheet) vs Backup JSON (arsip keselamatan sistem).

6. **Verifikasi Kualitas**:
   - **Vitest Unit Test**: **142/142 Lulus 100%** (14 berkas uji termasuk 7 tes baru di `tests/phase11-manager-focus.test.ts`).
   - **TypeScript Strict**: 0 galat (`tsc --noEmit` sukses).
   - **Next.js Production Build**: 33 rute sukses terkompilasi optimal (termasuk rute baru `/api/backup`).


---

## Ringkasan Checkpoint Tahap 4 (v2.6.0)

1. **Penggantian Dialog Konfirmasi (`ConfirmDialog`)**:
   - Menghapus pemanggilan `confirm(...)` browser pada penghapusan tugas di `src/app/pekerjaan/page.tsx`.
   - Menggantikannya dengan `ConfirmDialog` modal interaktif yang menyebut nama tugas, menjelaskan konsekuensi permanen, dan menggunakan tombol destruktif dengan konfirmasi ganda aman.
   - Memastikan tidak ada lagi fungsi `window.confirm` tersisa di seluruh basis kode `src/`.

2. **Pemisahan Komponen Kalender Modular (`TaskCalendarView`)**:
   - Dibuatkan komponen mandiri di `src/components/pekerjaan/TaskCalendarView.tsx`.
   - Mengenkapsulasi navigasi bulan/tahun, tombol "Hari Ini", dan pemetaan agenda per tanggal.
   - Responsif berjenjang:
     - **Desktop**: Grid kalender 7 hari di kiri (2 span), panel rincian agenda di kanan (1 span).
     - **Tablet**: Grid kalender di atas, panel rincian agenda di bawah dengan target sentuh lapang.
     - **Ponsel**: Kontainer bergulir horizontal dengan indikator geser yang jelas.
   - Penandaan visual jelas: Lingkaran biru langit untuk "Hari Ini" vs lingkaran aksen rose `#A64768` ber-ring sorotan untuk "Tanggal Terpilih".

3. **Bilah Filter Bersama (Daftar & Kalender)**:
   - Bilah pencarian dan filter (Unit Usaha, Status Pekerjaan, Skala Prioritas) dipindahkan ke tingkat atas sebelum Tab Switcher.
   - Perubahan filter kini berlaku sinkron baik saat manajer melihat Daftar Tugas maupun saat beralih ke Kalender Agenda.

4. **Panel Khusus Tugas Fleksibel (Tanpa Tenggat)**:
   - Tugas tanpa tanggal tenggat (`due_date == null`) tidak lagi hilang dari kalender, melainkan dikumpulkan dalam panel khusus "Tugas Fleksibel (Tanpa Tenggat Waktu)" yang dapat disembunyikan/ditampilkan sewaktu-waktu lengkap dengan tombol pintas "Atur Tanggal".

5. **Standardisasi Touch Target Tablet & Kontras Dark Mode**:
   - Mengupgrade tombol aksi cepat di `/pekerjaan`, `/unit-usaha`, `/anggota`, dan `/anggota/[id]` ke standar minimal 44–48 px (`min-h-11`).
   - Memastikan keterbacaan teks dan kontras tajam pada tema gelap `#1D2533` dan `#252F40`.

6. **Verifikasi Kualitas**:
   - **Vitest Unit Test**: **135/135 Lulus 100%** (13 berkas uji termasuk 9 tes baru di `tests/phase11-visual-design.test.tsx`).
   - **TypeScript Strict**: 0 galat (`tsc --noEmit` sukses).
   - **Next.js Production Build**: 32 rute sukses terkompilasi optimal.

---

## Ringkasan Checkpoint Tahap 3 (v2.5.0)

1. **Skrip Migrasi Tabel Ke-7 (`organization_profile`)**:
   - Berkas `supabase/migrations/20260923000008_organization_profile.sql` mendefinisikan tabel `public.organization_profile` secara bersih:
     - Identitas: `display_name`, `legal_name`, `business_status`, `manager_name`, `manager_title`.
     - Domisili: `region`, `full_address`, `fiscal_year`, `operational_target_date`.
     - Kontak & Legal: `phone`, `email`, `legal_doc_status`, `npwp_koperasi`.
     - Finansial: `bank_name`, `bank_account_number`, `bank_account_holder`, `notes`.
   - Dilengkapi Row Level Security (RLS) terisolasi dan baris awal standar.

2. **Validasi Skema Server Zod (`OrganizationProfileUpdateSchema`)**:
   - Ditempatkan di `src/lib/validations/simple-schemas.ts`.
   - Validasi ketat nama tampilan (min 3 karakter), nama manajer (min 2 karakter), status bisnis terdaftar, format tanggal ISO, dan email opsional.

3. **Route Handler Terproteksi (`/api/organization/profile`)**:
   - `GET`: Mengambil profil organisasi. Jika tabel kosong, menyajikan profil default terpercaya tanpa eror. Mengembalikan 500 fail-fast bila koneksi database bermasalah.
   - `PATCH`: Memvalidasi payload dengan Zod, memverifikasi akses privat (menolak akses publik luar 403), lalu menjalankan upsert permanen (`insert` jika baru, `update` jika sudah ada).

4. **Konteks Global Organisasi (`OrganizationContext`)**:
   - Disediakan di `src/lib/OrganizationContext.tsx` dan dibungkuskan pada `layout.tsx`.
   - Hook `useOrganizationProfile()` mendistribusikan profil koperasi ke seluruh komponen tanpa request berulang.

5. **Integrasi Dinamis Header & Sidebar**:
   - `Sidebar.tsx` kini menampilkan nama koperasi, inisial dinamis (misal: "KP"), nama manajer, dan jabatan yang bersumber langsung dari database organisasi.

6. **Formulir Pengaturan Koperasi (`/pengaturan`)**:
   - Tersambung 100% ke `/api/organization/profile`.
   - Mendukung edit nama koperasi, domisili/nagari, manajer pengelola, nomor rekening bank, dan status operasional.
   - Dilengkapi status dirty detection (peringatan perubahan belum disimpan), tombol Batal, tombol Simpan dengan status loading, dan notifikasi sukses.
   - Preferensi tema (Terang, Gelap, Sistem) tetap tersimpan per perangkat via local preference.

7. **Verifikasi Kualitas**:
   - 126/126 unit test lulus 100% (termasuk 16 unit test baru di `tests/phase11-organization-profile.test.ts`).
   - TypeScript `tsc --noEmit` 0 galat.
   - Next.js `npm run build` sukses untuk 32 rute.

---

## Ringkasan Checkpoint Tahap 2 (v2.4.0)

1. **Pembersihan Konstanta Fiktif Finansial**:
   - Menghapus kas bank palsu Rp 25.000.000, aset tetap palsu Rp 15.000.000, dan valuasi stok rekaan Rp 20.000/unit dari `/api/finance/summary`.
   - Pos yang belum terhubung atau belum dinilai kini secara jujur menampilkan status *"Belum Terhubung"* atau *"Belum Dinilai"* dengan informasi edukatif bagi manajer.
   - Neraca tidak dimanipulasi dengan modal penyeimbang buatan; menampilkan badge transparan *"Neraca Sementara (Mode Persiapan 2027)"*.

2. **Penanganan Galat Database Tegas (Fail-Fast)**:
   - Pada `/api/finance/summary` dan `/api/dashboard/executive`, seluruh pemanggilan `Promise.all` kini memeriksa `.error`.
   - Gangguan koneksi database Supabase tidak lagi disamarkan menjadi angka Rp 0, melainkan melempar status HTTP 500 yang transparan.

3. **Integritas Angka Operasional & Toleransi Nilai**:
   - Nilai setoran kas fisik (`cash_in_hand`) bernilai Rp 0 tidak tertimpa oleh omset minus pengeluaran.
   - Selisih operasional bersih mendukung nilai negatif jika terjadi kerugian/defisit (tidak dipaksa `Math.max(0, ...)`).
   - Label diubah menjadi *"Selisih Omset & Pengeluaran Tercatat"* dengan catatan bahwa laporan laba rugi resmi membutuhkan HPP dan penyusutan aset saat gerai beroperasi penuh awal 2027.

4. **Standarisasi Zona Waktu Bisnis Asia/Jakarta (WIB)**:
   - Menambahkan utilitas `getTodayWIB()`, `getCurrentYearMonthWIB()`, dan `getDaysAgoWIB()`.
   - Seluruh filter tanggal laporan hari ini, bulan berjalan, dan grafik tren 7 hari menggunakan waktu WIB (mencegah bug pergeseran tanggal UTC saat operasional malam/dini hari).

5. **Penyelarasan Kepatuhan Pelaporan Gerai**:
   - Gerai yang dievaluasi kepatuhan lapor harian hanya gerai dengan `status === 'aktif'`. Gerai dalam status `rencana` atau `persiapan` tidak otomatis dianggap terlambat.

6. **Transparansi Simulasi SHU**:
   - Tab Alokasi SHU kini memuat banner penjelas bahwa proporsi pembagian (40/25/20/5/5/5) adalah simulasi standar koperasi, menunggu pengesahan resmi AD/ART dalam Rapat Anggota Tahunan (RAT) ([TERBUKA-08]).

---

## Modul Aktif

| Modul | Rute | Status |
|---|---|---|
| Dashboard Manajer | `/dashboard` | ✅ Aktif (WIB & Fail-Fast) |
| Tugas & Agenda | `/pekerjaan` | ✅ Aktif |
| Pemantauan Gerai | `/monitoring` | ✅ Aktif (WIB default) |
| Daftar & Edit Gerai | `/unit-usaha` | ✅ Aktif |
| Barang & Stok | `/stok` | ✅ Aktif |
| Data Anggota | `/anggota` | ✅ Aktif |
| Kas & Buku Besar | `/keuangan` | ✅ Aktif (Kejujuran Data) |
| Neraca & SHU | `/laporan` | ✅ Aktif (Kejujuran Data) |
| Kesiapan Buka | `/persiapan` | ✅ Aktif |
| Tata Kelola & RAT | `/tata-kelola` | ✅ Aktif |
| Pengaturan | `/pengaturan` | ✅ Aktif (Tersambung Supabase Permanen) |
| Panduan Sistem | `/bantuan` | ✅ Aktif |

---

## Hasil Pengujian & Kualitas Kode

- **Vitest Unit Test**: **142/142 Lulus 100%** (14 berkas uji tanpa satupun kegagalan):
  - `tests/phase11-manager-focus.test.ts` (7 tes lulus) — *Baru di Tahap 5*
  - `tests/phase11-visual-design.test.tsx` (9 tes lulus)
  - `tests/phase11-organization-profile.test.ts` (16 tes lulus)
  - `tests/phase11-finance-audit.test.ts` (10 tes lulus)
  - `tests/phase11-dashboard.test.ts` (3 tes lulus)
  - `tests/navigation-dialog.test.tsx` (6 tes lulus)
  - `tests/components.test.tsx` (27 tes lulus)
  - `tests/phase08b.test.tsx` (7 tes lulus)
  - `tests/phase10-auth.test.ts` (18 tes lulus)
  - `tests/csv.test.ts` (10 tes lulus)
  - `tests/management-simple.test.ts` (12 tes lulus)
  - `tests/phase11-operations.test.ts` (7 tes lulus)
  - `tests/phase09-database.test.ts` (8 tes lulus)
  - `tests/phase11-boundary.test.ts` (2 tes lulus)
- **TypeScript Typecheck**: **Lulus (0 galat, exit code 0)**.
- **Production Build (Next.js)**: **Lulus sukses (33 halaman static/dynamic teroptimasi termasuk `/api/backup`)**.
