# CHANGELOG — Kopdes Merah Putih Ladang Laweh

Catatan perubahan kronologis proyek untuk pelacakan lintas agen AI dan pengembang.

## [v2.9.15 — audit detail Meja Kerja] — 24 September 2026

- Memeriksa enam halaman utama di browser tablet. Merapikan filter Meja Kerja yang sempit, memperjelas keadaan kosong tanpa klaim kondisi lapangan aman, dan menambah pintasan ke rekap gerai.
- Memperbaiki label aksesibilitas pencarian tugas serta tinggi sentuh tombol ekspor. Tanpa perubahan data atau Supabase.
- Verifikasi akhir: 208 tes lulus, typecheck bersih, build 41 rute, dan browser tablet terang/gelap memperlihatkan filter serta keadaan kosong dengan baik. Server lokal aktif kembali.

## [v2.9.14 — sapaan dashboard sesuai waktu] — 24 September 2026

- Mengganti “Selamat bekerja, Abdul Halim” dengan sapaan pagi/siang/sore/malam berdasarkan WIB, tanpa nama; dashboard persiapan mengikuti aturan yang sama.
- Menyegarkan header dengan ikon waktu, gradasi pastel, serta susunan tombol yang responsif. Menambah enam tes batas waktu. Tanpa perubahan Supabase.
- Verifikasi: 208 tes lulus, typecheck bersih, build 41 rute, dan spot-check browser tablet pada mode terang/gelap. Server lokal aktif kembali.

## [v2.9.13 — perapian anotasi tablet dan panduan koperasi] — 24 September 2026

- Menuntaskan sembilan anotasi browser: toolbar, filter, dan kartu Kinerja Gerai; dialog tambah/edit gerai; dialog checklist persiapan; keadaan kosong Tata Kelola; serta panduan koperasi yang lebih rinci. Form dokumen/risiko dan tambah barang persiapan ikut dilapangkan.
- Panduan menaut ke JDIH resmi dan membedakan keputusan organisasi, kegiatan manajer, rekap kas, serta laporan akuntansi. Judul panduan sekarang tombol yang dapat digunakan dengan keyboard.
- Pemeriksaan browser pada tablet 884 px dan mode terang/gelap; tidak mengirim formulir atau mengubah data. Tanpa migrasi Supabase. Verifikasi: 202 tes lulus, typecheck bersih, build 41 rute.

## [v2.9.12 — audit lintas menu dan perapian dropdown] — 24 September 2026

- Memeriksa 15 menu aktif melalui browser terintegrasi pada desktop/tablet, serta filter dan popup relevan pada mode terang/gelap. Tidak ditemukan overflow horizontal pada audit akhir 884 px.
- Menyeragamkan dropdown filter Meja Kerja, Kinerja Gerai, Stok, Anggota, dan Kesiapan; memperjelas label, ukuran teks, tinggi sentuh, dan ruang ikon. Pilihan gerai rekap menampilkan nama tanpa kode panjang di kolom, sementara kodenya ditampilkan terpisah.
- Memperbaiki nama koperasi yang terpotong pada sidebar, keterbacaan deskripsi halaman, pencarian anggota, dan istilah SOP layanan gerai. Tanpa migrasi Supabase.
- Verifikasi: 202 tes lulus, TypeScript bersih, build 41 rute. Server lokal aktif kembali.

## [v2.9.11 — perataan dropdown formulir] — 24 September 2026

- Merapikan pilihan gerai, prioritas, dan status di popup tugas: teks rata kiri dengan ruang yang cukup untuk ikon panah; daftar opsi mengikuti perataan yang sama.
- Melebarkan popup Tambah Tugas dan Buat Tugas dari Kendala agar nama gerai tidak cepat terpotong. Dropdown HTML lain ikut konsisten. Tanpa perubahan Supabase.
- Memperbaiki Escape pada dropdown native di dalam modal agar tidak ikut menutup seluruh formulir tugas, termasuk ketika fokus berpindah ke baris pilihan. Browser memverifikasi perilaku ini dan teks gerai penuh; 202 tes lulus, typecheck bersih, build 41 rute. Server lokal aktif kembali.

## [v2.9.10 — pemilih bulan konsisten dan panduan cepat] — 24 September 2026

- Mengganti input bulan bawaan browser di laporan serta Kinerja Gerai dengan pemilih 12 bulan bertema terang/gelap, termasuk navigasi tahun dan batas pilihan.
- Merancang ulang popup Panduan Operasional menjadi panduan cepat berisi pintasan kerja yang dapat langsung dibuka.
- Tidak ada perubahan Supabase atau SQL. Tes baru mencakup pilihan bulan dan batas min/maks.
- Verifikasi final: 200 tes lulus, typecheck bersih, build 41 rute. Tampilan pemilih bulan dicek terang/gelap dan periode laporan berubah sesuai pilihan; popup Panduan diringkas sampai keempat pintasan terbaca. Server utama port 3000 aktif kembali.

## [v2.9.9 — kalender bergaya dan briefing dashboard] — 24 September 2026

- Merapikan perataan judul dropdown bersama serta opsi pada popup pilihan yang mendukung tema; mengubah kalender tanggal formulir menjadi popup khusus dengan navigasi bulan, pilihan hari, keadaan kosong, dan mode gelap.
- Memakai kalender baru pada laporan gerai dan tanggal jurnal simulasi; merapikan garis aksen dan tombol tutup modal bersama.
- Menambah briefing prioritas di dashboard dari tugas terlambat, rekap gerai, serta stok nyata, tanpa angka contoh atau klaim AI.
- Tidak mengubah Supabase. Popup pemilih bulan native dan audit visual menyeluruh masih menjadi pekerjaan lanjutan.
- Kalender final memakai dialog bertingkat agar tidak terpotong di dalam popup tugas dan Escape hanya menutup kalender. Verifikasi akhir: 198 tes, typecheck, build 41 rute; spot-check tugas/kalender dan dashboard terang-gelap selesai. Server utama port 3000 dijalankan ulang.

## [v2.9.8 — persiapan API gerai dan rekap keuangan] — 24 September 2026

- Menambah pilihan tampilan Manual/API di Pengaturan; panel kunci API gerai baru muncul saat API dipilih. Kunci hanya sementara dan tidak mengaktifkan sambungan tanpa dokumentasi penyedia. API key OpenAI tetap terpisah.
- Menambah buku rekap operasional riil per gerai/bulan dengan pagination pada Neraca & SHU, sekaligus penjelasan mengapa ini belum buku besar atau laporan resmi. Form manual dilarang mengaku sebagai sumber API.
- Menyambungkan status organisasi ke banner/sidebar, tahun buku ke laporan, dan rekening bank bertopeng ke Keuangan sebagai referensi. Panduan cepat lama tentang login/POS dibersihkan.
- Menulis rencana pembukuan lengkap dan draf SQL enam tabel baru untuk persetujuan nanti. Tidak ada SQL atau perubahan cloud yang dijalankan.
- Jurnal lama diberi label Simulasi Lokal supaya tidak disalahartikan sebagai pembukuan Supabase. Verifikasi akhir: 196 tes, typecheck, dan build 41 rute lulus; server lokal dijalankan ulang.

## [v2.9.7 — perapian input dan dropdown] — 24 September 2026

- Memindahkan tombol tampil/sembunyikan API key ke ujung dalam input melalui slot aksi komponen `Input`, sehingga tetap sejajar dan mudah disentuh.
- Menyatukan gaya popup dan opsi untuk seluruh `select` native, termasuk dropdown mentah di halaman lain, dengan fallback warna pada browser lama serta tema terang/gelap.
- Pengujian 190/190 lulus, typecheck bersih, build 39 rute sukses. Tampilan Pengaturan dan filter Meja Kerja diperiksa langsung pada browser; mode gelap diuji lalu dikembalikan ke terang. Tidak ada migrasi Supabase.

## [v2.9.6 — input API key OpenAI lokal] — 24 September 2026

- Menambah kolom API key di Pengaturan dengan tampilan sandi, simpan sementara di memori server lokal, uji koneksi ke OpenAI, dan hapus kunci. Kunci tidak dikembalikan oleh API atau disimpan di Supabase/browser oleh aplikasi.
- Form dibatasi untuk komputer server sendiri. Jika `OPENAI_API_KEY` sudah ada di environment server, Pengaturan hanya menampilkan status dan tombol uji; penggantian dilakukan di environment.
- Analisis AI tugas dan API keuangan belum aktif. Tidak ada migrasi SQL atau perubahan Supabase. Verifikasi: 189 tes lulus, typecheck bersih, build 39 rute sukses; tampilan Pengaturan diperiksa di browser.

## [v2.9.5 — grafik dan batas laporan keuangan] — 24 September 2026

- Menambah grafik omset tujuh hari dan rincian angka pada Pemantauan Keuangan; memisahkan setoran yang dilaporkan dari saldo kas terverifikasi.
- Mengubah Neraca & SHU menjadi halaman kesiapan data. Simulasi persentase SHU yang belum disahkan dan utang Rp0 tanpa data dihapus agar tidak terlihat sebagai laporan resmi.
- Menambah status integrasi di Pengaturan; AI dan API keuangan belum aktif sambil menunggu pilihan penyedia/format. Tidak ada kunci rahasia di browser, SQL, atau perubahan cloud.
- Rencana integrasi dan akuntansi terdokumentasi di `docs/RENCANA_INTEGRASI_DAN_AKUNTANSI.md`. Tes 186/186 lulus, typecheck dan build 37 rute sukses; API keuangan HTTP 200 dan tampilan keuangan/laporan diperiksa pada browser (keuangan terang/gelap). Grafik berisi data belum dapat diuji karena belum ada rekap nyata.

## [Pemeriksaan runtime — koneksi lokal] — 24 September 2026

- Menelusuri kegagalan memuat massal: server lokal sebelumnya tidak mendapat izin jaringan ke Supabase. Setelah server dijalankan ulang dengan izin yang sesuai, 10 API inti kembali HTTP 200. Tidak ada perubahan kode atau database; status migrasi 00009 Cloud masih perlu verifikasi terpisah.

## [v2.9.4 — fondasi tampilan dan tren pelaporan] — 24 September 2026

- Menyegarkan permukaan dan komponen bersama (shell, kartu metrik, header halaman, sidebar/topbar, chip navigasi, tombol, tabel, dialog, dan field) agar aplikasi lebih bersih dan konsisten di dua tema; perubahan menurun ke seluruh modul yang memakai komponen tersebut.
- Menambah grafik keterisian rekap 7 hari di dashboard/CSV dari gerai aktif unik, tanpa tabel baru; kondisi tanpa gerai aktif dan laporan ganda ditangani serta diuji.
- Memperbaiki Panduan yang sebelumnya masih mengklaim fitur POS, PO, jurnal otomatis, data contoh dan login lama; label status Supabase kini tidak menyamakan konfigurasi dengan koneksi berhasil.
- 184 tes lulus, typecheck bersih, build 37 rute. Spot-check visual tablet dilakukan pada Panduan; grafik dashboard belum dapat dilihat berisi data karena `fetch failed` saat mengambil data Supabase di lingkungan pengujian. Tidak ada perubahan cloud.

## [v2.9.3 — Tahap P2: Kinerja Gerai (/kinerja-gerai)] — 24 September 2026

- **Fitur Baru — Kinerja & Capaian Gerai (`/kinerja-gerai`)**:
  - Halaman analitik komparatif performa unit usaha bagi Bapak Abdul Halim untuk memantau capaian target bulanan, kedisiplinan rekapitulasi harian, dan selisih operasional seluruh gerai secara adil dan jujur.
  - Aturan bisnis kejujuran data:
    - Target 0 / belum disepakati = "Target belum ditetapkan", bukan "0%".
    - Keterisian laporan dihitung terhadap total hari kalender yang telah berjalan (`calendarDaysElapsed`), bukan sebulan penuh jika bulan masih aktif berjalan.
    - Perbandingan periode adil (*fair comparison*): membandingkan hari ke-1 s.d. hari ke-N bulan ini dengan hari ke-1 s.d. hari ke-N bulan lalu, dan hanya menampilkan persentase kenaikan/penurunan jika data bulan lalu memadai (minimal 50% hari lapor).
    - Selisih operasional = Omset - Pengeluaran (dengan catatan edukasi bahwa ini bukan laba bersih resmi / SHU).
- **Backend Route Handler Baru (`GET /api/manager/unit-performance`)**:
  - Mengambil data dari 2 tabel Supabase yang sudah ada (`business_units` dan `unit_daily_reports`) tanpa tabel baru.
  - Menerima parameter `month` (`YYYY-MM`) dan `unitId` dengan validasi Zod.
  - Dilindungi verifikasi akses privat (`verifyPrivateApiAccess`).
- **Modul Perhitungan Kanonikal (`src/lib/unit-performance.ts`)**:
  - Fungsi murni perhitungan target, hari kalender berjalan, evaluasi perbandingan adil, dan agregasi ringkasan koperasi.
- **Antarmuka Pengguna & Navigasi**:
  - Header dengan pemilih bulan interaktif (`input[type="month"]`), tombol Perbarui, dan tombol Unduh CSV.
  - 4 kartu metrik KPI (Total Omset Terhimpun, Capaian Target Koperasi, Rata-rata Keterisian Rekap, Selisih Operasional).
  - Bilah filter interaktif (Status Gerai, Jenis Usaha, Pencarian Teks Cepat).
  - Tampilan Desktop: Tabel performa dengan visual progress bar target, badge status, hari rekap, selisih operasional, tren vs bulan lalu, kendala terakhir, dan tombol 1-klik menuju `/monitoring?unitId=...`.
  - Tampilan Tablet & Mobile: Kartu responsif bertingkat dengan area sentuh lega 44–48 px.
  - Menu baru ditambahkan di Sidebar pada kelompok **Operasional Gerai** dengan ikon `BarChart3`.
- **Pengujian & Verifikasi**:
  - 182/182 unit test Vitest lulus (20 berkas), termasuk 13 tes baru di `tests/unit-performance.test.ts`.
  - 0 galat TypeScript (`tsc --noEmit`).
  - Next.js production build sukses mengompilasi 37 rute.
  - Evaluasi visual mandiri tuntas menggunakan *browser subagent*.

---

## [v2.9.2 — Tahap P1: Meja Kerja Manajer (/meja-kerja)] — 23 September 2026

- **Fitur Baru — Meja Kerja Manajer (`/meja-kerja`)**:
  - Halaman antrian terpadu bagi Bapak Abdul Halim untuk memantau seluruh kebutuhan tindak lanjut harian dalam satu layar.
  - Membagi pekerjaan ke dalam 4 kelompok urgensi yang jelas dan deterministik:
    1. **Perlu Sekarang**: Tugas lewat jatuh tempo (*overdue*), tugas prioritas mendesak, dan stok fisik habis (0 unit).
    2. **Hari Ini**: Tugas jatuh tempo hari ini dan gerai aktif yang belum mengisi rekap harian hari ini.
    3. **Pantau**: Stok fisik menipis ($0 < \text{stok} \le \text{stok minimum}$) dan kendala lapangan yang dilaporkan dalam 7 hari terakhir.
    4. **Selesai**: Gerai aktif yang sudah sukses menyetorkan rekap hari ini dan tugas yang telah diselesaikan hari ini.
- **Backend Route Handler Baru (`GET /api/manager/work-desk`)**:
  - Menghimpun data dari 4 tabel yang sudah ada (`business_units`, `unit_daily_reports`, `tasks`, `products`) tanpa memerlukan tabel database baru.
  - Tahan terhadap kegagalan parsial (*fail-fast & transparent*): jika salah satu query terganggu, galat dicatat dalam `partialErrors` dan data yang berhasil tetap disajikan secara jujur tanpa rekayasa angka nol.
- **Antarmuka Pengguna & Navigasi**:
  - 4 kartu metrik ringkasan (Total Antrian, Perlu Sekarang, Hari Ini, Dalam Pantauan).
  - Filter interaktif berdasarkan tingkat urgensi, sumber data, dan pencarian teks cepat.
  - Tombol aksi 1-klik langsung menuju modul terkait (`/pekerjaan`, `/monitoring`, `/stok`) dengan parameter terarah.
  - Menu baru ditambahkan di Sidebar pada kelompok **Menu Utama** dengan ikon `Inbox`.
- **Pengujian & Verifikasi**:
  - 169/169 unit test Vitest lulus (19 berkas), termasuk berkas uji baru `tests/work-desk.test.ts`.
  - 0 galat TypeScript (`tsc --noEmit`).
  - Next.js production build sukses mengompilasi 35 rute.

---

## [Tahap P0 — Penyelarasan Skema Anggota & Stok di Supabase Cloud] — 23 September 2026

- **Migrasi Penyelarasan Disiapkan**: Membuat berkas resmi `supabase/migrations/20260923000009_align_members_products.sql` dan memperbarui draf di `supabase/drafts/`.
- **Penyelarasan Kolom & Relasi**:
  - `products`: Menambahkan kolom `notes`, `is_archived`, dan relasi `unit_id` ke `business_units`, serta memastikan tipe data `current_stock` dan `min_stock` adalah `NUMERIC(12,2)`.
  - `members`: Menambahkan kolom `notes`, `is_archived`, `member_number`, dan mempertahankan `member_no` serta `domicile`.
  - Sinkronisasi dua arah: Trigger otomatis `sync_member_number_v29` memastikan `member_number` dan `member_no` selalu sinkron tanpa risiko kehilangan data nomor anggota lama.
  - Melepas kewajiban NOT NULL pada `phone` dan `domicile` agar pendaftaran warga lebih fleksibel.
- **Keamanan Data**: Menggunakan transaksi atomik (`BEGIN ... COMMIT`) dan `LOCK TABLE ACCESS EXCLUSIVE` dengan batas waktu aman (`timeout 5s/30s`). Tidak ada data atau tabel yang dihapus.
- **Verifikasi Kode**: 165/165 unit test Vitest lulus (18 berkas), 0 galat TypeScript (`tsc --noEmit`), build Next.js 33 rute sukses.

---

## [Rancangan lanjutan — prompt fitur manajer] — 23 September 2026

- Menulis prompt implementasi rinci `prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md`: usulan dua menu, alur harian/bulanan, fitur berbasis data saat ini dan fitur yang memerlukan database, aturan hitung, UX, uji, keamanan, prioritas dan pertanyaan bisnis.
- Menautkan prompt dari roadmap, handoff, design system dan status. Tidak ada fitur atau perubahan Supabase yang dijalankan dalam langkah dokumentasi ini.

## [v2.9.1 — perapian dashboard dan peta fitur] — 23 September 2026

- Dashboard produksi: header lebih padat dan tidak berulang; grafik tujuh hari punya pesan kosong jujur saat tidak ada omset tercatat.
- Menambah `docs/ROADMAP_MANAJER_BERIKUTNYA.md`: prioritas keamanan data, delapan rancangan fitur manajer, sumber data, syarat selesai, panduan visual terang/gelap, dan instruksi migrasi AI. Tidak ada fitur rancangan yang diklaim sudah dibangun.
- Supabase dan data nyata tidak diubah. Setelah perubahan: 165 tes lulus, typecheck bersih, build 33 rute; tampilan dashboard desktop/tablet terang-gelap diperiksa. Batas visual lain dicatat pada STATUS.md.

## [v2.9 — penyegaran manajer, audit bertahap] — 23 September 2026

- Verifikasi akhir 165/165 tes, typecheck bersih, build 33 rute. Pemeriksaan browser tablet 1024 px memastikan header/form pemantauan dan pilihan gerai tidak bertumpuk setelah breakpoint diperbaiki; halaman gerai/keuangan dapat dibuka, anggota/stok menunjukkan galat cloud yang sudah diidentifikasi.
- Pesan galat stok disesuaikan untuk aplikasi pribadi tanpa login. Sidebar, header dan form pemantauan memberi ruang penuh pada tablet; nilai pilihan dropdown panjang tidak membungkus baris.
- Audit HTTP nyata menemukan anggota/stok 500 akibat skema cloud lama; OpenAPI read-only mengonfirmasi perbedaan kolom. Perbaikan Supabase belum dijalankan, menunggu konfirmasi; rincian migrasi yang perlu ditinjau ada di STATUS.md.
- Draf SQL penyelarasan tersedia di `supabase/drafts/20260923000009_align_members_products.sql`, di luar migrasi aktif. Belum dieksekusi/diuji PostgreSQL; syarat persetujuan dan backup tertulis di HANDOFF.md.
- Footer tetap terlihat pada modal tugas dan konversi kendala; tombol submit tetap terhubung ke formulir melalui atribut `form`, dilindungi status menyimpan.
- Pemeriksaan browser menemukan ikon tanggal ganda dan lebar isian kurang; `DateInput` kini memakai satu picker native, dan tanggal modal tugas mendapat baris penuh.

- Dashboard ringkas: indikator manajer, filter tindak lanjut terdeduplikasi, rincian omset harian, CSV ringkasan, identitas kustom, waktu pembacaan WIB.
- Header halaman, picker dropdown progressive enhancement, kontras hover dark mode dan kalender tablet diperbarui.
- Memperbaiki dua alur rusak: pembuatan agenda kalender mengirim ID kosong/PATCH; konversi kendala mengirim status tidak sah dan menurunkan prioritas mendesak.
- Kepatuhan gerai aktif dan batas tanggal bulan dashboard diperbaiki; galat profil/rekap/tugas tidak disamarkan. Validasi perubahan anggota serta tanggal WIB diperkuat. Target gerai baru tidak diisi uang rekaan.
- Akses lokal bind 127.0.0.1; tidak mempercayai header IP klien; tidak menerima kunci lewat URL. LAN memerlukan pengaturan privat tersendiri.
- Baseline 153 tes; checkpoint baru 165 tes lulus dan typecheck lulus. Hasil build/visual final serta keterbatasan dicatat di STATUS.md.
- Tidak ada migrasi atau penulisan data Supabase. Restore non-atomik dan pagination menjadi pekerjaan keselamatan berikutnya, bukan diklaim selesai.

## [v2.8.0] — 23 September 2026 (Tahap 6 — Penyatuan Model Data Kanonikal, Modularisasi Komponen Ramping & Pembersihan Akses Cloud)

### ✅ Ditambahkan & Ditingkatkan
- **Penyatuan Model Data Kanonikal (`src/types/models.ts`)**:
  - Menyediakan kontrak tipe data terpusat dan bersih yang memetakan langsung ke 7 tabel PostgreSQL Supabase: `TaskItem`, `BusinessUnit`, `DailyReportRecord`, `MemberRecord`, `CatalogProduct`, dan `UnitOption`.
  - Mengeliminasi duplikasi interface lokal di berbagai halaman dan menyelaraskannya dengan skema validasi Zod (`src/lib/validations/simple-schemas.ts`).
  - Mengekspor ulang model di `src/types/index.ts` untuk kompatibilitas penuh kode eksisting.
- **Pembersihan Mock Warisan & Integrasi Cloud Riil**:
  - `/unit-usaha/[id]`: Menghapus pemanggilan mock `preparationRepository`, membaca langsung data gerai via `GET /api/units?id=...`, dan memperbarui nama/target/status melalui `PATCH /api/units`.
  - `/anggota/[id]`: Menghapus pemanggilan mock `preparationRepository`, membaca langsung data warga via `GET /api/members?id=...`, mendukung pengubahan status "Aktif" / "Calon" dan aksi pengarsipan data melalui `PATCH /api/members`.
  - `GET /api/units` dan `GET /api/members`: Mendukung parameter kueri `?id=...` untuk pembacaan tunggal yang efisien.
- **Modularisasi Arsitektur Halaman Monolitik (>500-1100 baris)**:
  - `/monitoring` (1.148 baris $\to$ 157 baris koordinator):
    - `src/components/monitoring/MonitoringReportForm.tsx`: Form input rekap harian gerai dengan kalkulasi otomatis.
    - `src/components/monitoring/MonitoringHistoryTable.tsx`: Tabel riwayat laporan, filter, dan ekspor CSV.
    - `src/components/monitoring/MonitoringPeriodicSummary.tsx`: Agregasi periodik & tata letak cetak resmi A4.
    - `src/components/monitoring/MonitoringTaskModal.tsx`: Modal interaktif konversi kendala lapangan menjadi tugas.
  - `/pekerjaan` (860 baris $\to$ 348 baris koordinator):
    - `src/components/pekerjaan/TaskFormModal.tsx`: Form dialog pembuatan & penyuntingan tugas.
    - `src/components/pekerjaan/TaskList.tsx`: Komponen daftar tugas terfilter dengan aksi status cepat 1-klik.
    - `src/components/pekerjaan/TaskCalendarView.tsx`: Tampilan kalender visual agenda kerja.
  - `/anggota` (874 baris $\to$ 332 baris koordinator):
    - `src/components/anggota/MemberAddModal.tsx`: Form pendaftaran warga baru langsung ke Supabase.
    - `src/components/anggota/MemberImportModal.tsx`: Modal impor data massal CSV langsung ke Supabase.
  - `/stok` (973 baris $\to$ 10 baris koordinator):
    - `src/app/stok/PreparationStockPage.tsx`: Ekstraksi tampilan arsip fase persiapan.
    - Halaman utama `/stok` bertindak sebagai pemilih cerdas ke `ProductionStockPage` (mode produksi aktif).
- **Banner Edukasi Simulasi Jurnal Keuangan (`/keuangan/jurnal`)**:
  - Menambahkan banner informatif amber yang memperjelas bahwa halaman jurnal keuangan saat ini merupakan media simulasi pembukuan double-entry edukatif mandiri, tanpa memanipulasi data riil operasional gerai.

### 🔍 Diverifikasi
- **Vitest Unit Test**: **153/153 Lulus 100%** (15 berkas uji termasuk 11 tes baru di `tests/phase11-refactor-quality.test.ts`).
- **TypeScript Typecheck**: 0 galat (`tsc --noEmit` bersih).
- **Next.js Production Build**: 33 rute berhasil dikompilasi optimal tanpa komplain.

---

## [v2.7.0] — 23 September 2026 (Tahap 5 — Fitur Fokus Manajer, Filter Terpadu, Cetak Laporan & Backup/Restore Sistem)

### ✅ Ditambahkan & Ditingkatkan
- **Panel "Fokus & Tindakan Hari Ini" di Dashboard Eksekutif (`/dashboard`)**:
  - Menyaring dan merangkum isu operasional mendesak hari ini ke dalam 3 pilar prioritas:
    1. *Tugas Jatuh Tempo / Lewat*: Tugas berstatus belum selesai dengan tenggat hari ini atau telah terlewat (WIB) berbadge merah, dengan tautan langsung ke `/pekerjaan`.
    2. *Gerai Belum Rekap*: Gerai berstatus aktif yang belum memasukkan laporan harian per tanggal hari ini, dengan tautan langsung ke form input `/monitoring`.
    3. *Stok Menipis / Kritis*: Komoditas barang dengan jumlah stok $\le$ batas minimum atau habis (0 unit), dengan tautan langsung ke `/stok`.
  - Jika seluruh indikator aman, panel menampilkan status hijau tenang (*"Seluruh Operasional Terkendali"*).
- **Standarisasi Filter, Pencarian, & Ekspor CSV Aman**:
  - Filter seragam (Periode/Bulan, Status, Unit Usaha, Pencarian Teks) di `/monitoring`, `/pekerjaan`, dan `/stok`.
  - Penghitung hasil aktif (misal: *"Menampilkan 12 dari 18 laporan"*).
  - Tombol *"Reset Filter"* satu klik saat filter aktif mempersempit data.
  - Utilitas `downloadCsvFile()` di `src/lib/csv.ts` dengan penambahan UTF-8 BOM untuk pembacaan akurat di Microsoft Excel dan netralisasi otomatis injeksi formula spreadsheet (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Tab Ringkasan Berkala & Format Cetak Resmi di `/monitoring`**:
  - Tab 3 *"Ringkasan & Cetak"* yang mengagregasikan total omset, kas keluar, estimasi laba kotor, dan setoran kas berdasarkan filter rentang tanggal.
  - Pemecahan agregat performa per gerai usaha (omset, biaya, estimasi laba, jumlah hari beroperasi).
  - Tampilan cetak resmi (`window.print()`) dengan kop surat koperasi otomatis dari profil organisasi, tabel ringkas monokrom kontras tinggi, kolom tanda tangan manajer, dan disclaimer operasional resmi.
- **Konversi Kendala Lapangan Menjadi Tugas Operasional ("Jadikan Kendala sebagai Tugas")**:
  - Tombol aksi cepat *"Jadikan Tugas"* pada setiap baris laporan harian yang memiliki catatan kendala di `/monitoring`.
  - Modal interaktif terisi otomatis dengan konteks: judul tugas deskriptif, unit usaha terkait, PIC default unit, prioritas "Tinggi", tenggat otomatis besok hari (WIB), dan detail kendala.
  - Deteksi dan peringatan cerdas jika tugas serupa untuk kendala gerai tersebut sudah pernah dibuat sebelumnya.
- **Pencadangan & Pemulihan Sistem Lengkap (JSON Backup/Restore) di `/pengaturan`**:
  - Endpoint terproteksi `/api/backup`:
    - `GET`: Mengunduh arsip komprehensif 6 entitas data (`organization_profile`, `business_units`, `tasks`, `products`, `members`, `unit_daily_reports`) dalam format JSON terstruktur lengkap dengan metadata versi dan stempel waktu ISO.
    - `POST`: Memvalidasi integritas file cadangan via Zod (`BackupPayloadSchema`) dan melakukan pemulihan/upsert aman ke Supabase.
  - Antarmuka pencadangan di `/pengaturan` dengan panduan edukatif perbedaan CSV vs JSON Backup, inspeksi ringkasan berkas sebelum dipulihkan, dan pelindung modal konfirmasi ganda `ConfirmDialog`.

### 🔍 Diverifikasi
- **Vitest Unit Test**: 142/142 lulus 100% (14 berkas uji termasuk 7 tes komprehensif baru di `tests/phase11-manager-focus.test.ts`).
- **TypeScript Typecheck**: 0 galat (`tsc --noEmit` sukses).
- **Next.js Production Build**: 33 rute sukses terkompilasi optimal (termasuk rute baru `/api/backup`).

---

## [v2.6.0] — 23 September 2026 (Tahap 4 — Penyempurnaan Desain Seluruh Halaman, Kalender Modular & ConfirmDialog)

### ✅ Ditambahkan & Disempurnakan
- **Dialog Konfirmasi Modal Terstandar (`ConfirmDialog`)**:
  - Menghapus pemanggilan `confirm(...)` browser pada penghapusan tugas di `/pekerjaan`.
  - Mengintegrasikan `ConfirmDialog` modal interaktif dengan penjelasan risiko, nama tugas yang akan dihapus, tombol batal, dan tombol destruktif konfirmasi ganda.
  - Seluruh basis kode kini bersih dari `window.confirm()`.
- **Komponen Kalender Modular (`TaskCalendarView`)**:
  - Memisahkan kalender tugas ke komponen tersendiri `src/components/pekerjaan/TaskCalendarView.tsx`.
  - Mengenkapsulasi kontrol bulan/tahun, tombol "Hari Ini", navigasi panah kiri/kanan, dan pemetaan agenda per tanggal.
  - Perbedaan visual kontras antara "Hari Ini" (lingkaran biru langit) dan "Tanggal Terpilih" (lingkaran aksen rose `#A64768` ber-ring sorotan).
- **Bilah Pencarian & Filter Terpadu**:
  - Menempatkan kartu filter (Unit Usaha, Status, Prioritas, Pencarian) di atas tab switcher sehingga berlaku serentak pada tampilan Daftar Tugas maupun Kalender Agenda.
- **Panel Khusus Tugas Fleksibel (Tanpa Tenggat)**:
  - Tugas yang belum memiliki tanggal tenggat ditampilkan dalam panel tersendiri di bawah kalender ("Tugas Fleksibel"), lengkap dengan tombol cepat "Atur Tanggal".
- **Standardisasi Target Sentuh Tablet & Dark Mode**:
  - Menyesuaikan ukuran tombol aksi di `/pekerjaan`, `/unit-usaha`, `/anggota`, dan `/anggota/[id]` ke standar minimal 44–48 px (`min-h-11`).
  - Menyelaraskan kontras teks dan kartu pada tema gelap `#1D2533` dan `#252F40`.

### 🔍 Diverifikasi
- **Vitest Unit Test**: 135/135 lulus 100% (13 berkas uji termasuk 9 tes baru di `tests/phase11-visual-design.test.tsx`).
- **TypeScript Typecheck**: 0 galat (`tsc --noEmit` sukses).
- **Next.js Production Build**: 32 rute sukses terkompilasi optimal.

---

## [v2.5.0] — 23 September 2026 (Tahap 3 — Kustomisasi Profil Koperasi Permanen di Database Supabase)

### ✅ Ditambahkan & Dihubungkan
- **Skema & Migrasi SQL `organization_profile`**: Berkas migrasi `supabase/migrations/20260923000008_organization_profile.sql` meresmikan tabel ke-7 dengan RLS dan nilai awal terpercaya untuk identitas koperasi, domisili/nagari, manajer, tahun buku, dan rekening bank.
- **Validasi Zod Server (`OrganizationProfileUpdateSchema`)**: Menambahkan skema validasi masukan profil di `src/lib/validations/simple-schemas.ts` yang memvalidasi nama tampilan, nama manajer, status bisnis, format tanggal ISO, serta email opsional.
- **API Endpoint Terproteksi `/api/organization/profile`**:
  - `GET`: Mengambil data profil organisasi secara cepat dan aman dari Supabase, atau fallback nilai aman jika tabel masih kosong.
  - `PATCH`: Memvalidasi payload via Zod, memblokir akses publik tanpa token privat (status 403), dan melakukan upsert (`insert`/`update`) data permanen ke PostgreSQL Supabase.
- **Penyedia Konteks Organisasi Global (`OrganizationContext`)**: Membungkus antarmuka aplikasi dengan `OrganizationProvider` di `src/app/layout.tsx`, menyediakan akses instan data profil ke seluruh halaman melalui hook `useOrganizationProfile()`.
- **Integrasi Komponen Header & Sidebar**:
  - `Sidebar.tsx`: Menampilkan nama koperasi dinamis, inisial adaptif (misal: "KP" / "KL"), nama manajer, dan jabatan yang bersumber langsung dari database, menggantikan teks hardcoded.
- **Antarmuka Pengaturan Terintegrasi (`/pengaturan`)**:
  - Form terhubung langsung ke API `/api/organization/profile`.
  - Dilengkapi dirty-state detection (penanda belum disimpan), tombol Batal untuk mereset perubahan, tombol Simpan dengan indikator loading, dan notifikasi konfirmasi.
  - Preferensi tema (Terang / Gelap / Ikuti perangkat) tetap tersimpan di penyimpanan lokal per perangkat.

### 🔍 Diverifikasi
- **Vitest Unit Test**: 126/126 lulus 100% (12 berkas uji termasuk 16 tes baru di `tests/phase11-organization-profile.test.ts`).
- **TypeScript Typecheck**: 0 galat (`tsc --noEmit` sukses).
- **Next.js Production Build**: 32 rute sukses terkompilasi optimal (termasuk rute baru `/api/organization/profile`).

---

## [v2.4.0] — 23 September 2026 (Tahap 2 — Kejujuran Data & Audit Perhitungan Finansial/Operasional)

### ✅ Diperbaiki & Diaudit
- **Pembersihan Konstanta Fiktif**: Menghapus angka rekaan (kas bank Rp25jt, aset tetap Rp15jt, valuasi persediaan Rp20rb/unit) di `/api/finance/summary`. Pos yang belum dibukukan kini berstatus jujur *"Belum Terhubung"* atau *"Belum Dinilai"*.
- **Penanganan Galat Fail-Fast**: Endpoint `/api/finance/summary` dan `/api/dashboard/executive` memvalidasi hasil kueri database Supabase dan mengembalikan HTTP 500 jika terjadi galat, tanpa menyamarkannya menjadi angka Rp 0.
- **Integritas Nilai Nol & Laba Negatif**: Nilai setoran kas (`cash_in_hand`) bernilai Rp 0 dipertahankan (menghilangkan bug operator `||`), dan kalkulasi laba/selisih operasional mendukung nilai negatif jika terjadi kerugian/defisit.
- **Zona Waktu Bisnis Asia/Jakarta (WIB)**: Menambahkan modul utilitas `getTodayWIB()`, `getCurrentYearMonthWIB()`, dan `getDaysAgoWIB()`. Filter tanggal dan grafik 7 hari sinkron dengan waktu operasional WIB.
- **Evaluasi Kepatuhan Lapor Gerai**: Kepatuhan pelaporan harian hanya mewajibkan gerai dengan status `aktif`. Gerai dalam tahap `rencana` atau `persiapan` tidak dianggap terlambat.
- **Pembersihan Kueri Warisan**: Memperbarui `/api/dashboard/summary` agar tidak merujuk tabel `purchase_orders` yang sudah dihapus, melainkan tabel `tasks` pada 7 tabel inti.
- **Transparansi Visual Halaman Keuangan & Laporan**: Memperbarui antarmuka `/keuangan` dan `/laporan` dengan badge neraca sementara (Mode Persiapan 2027), label *"Selisih Omset & Pengeluaran Tercatat"*, serta banner edukatif simulasi SHU yang belum disahkan AD/ART.

### 🔍 Diverifikasi
- **Vitest Unit Test**: 110/110 lulus 100% (11 berkas uji termasuk `tests/phase11-finance-audit.test.ts`).
- **TypeScript Typecheck**: 0 galat (exit code 0).
- **Next.js Production Build**: 31 rute sukses terkompilasi optimal.

---

## [v2.3.0] — 23 September 2026 (Tahap 1 — Aplikasi Pribadi Manajer Tanpa Login dengan Batas Akses Aman)

### ✅ Ditransformasikan
- **Aplikasi Pribadi Manajer**: Mengubah aplikasi menjadi aplikasi pribadi untuk Abdul Halim tanpa fitur login dan tanpa akun pengguna.
- **Rute Langsung**: Halaman root (`/`) dan seluruh tautan autentikasi lama (`/login`, `/lupa-password`, `/reset-password`, `/forbidden`, `/auth/*`) langsung mengarah ke `/dashboard`.
- **Pembersihan Antarmuka**: Tombol Masuk/Keluar dihapus dari Header dan Sidebar. Sidebar menampilkan profil tetap: **Abdul Halim** (*Manajer Koperasi*, inisial AH) dengan lencana "Pribadi". Header menampilkan status "Aplikasi Pribadi".
- **Batas Akses Privat & Anti-CSRF**: Menambahkan modul `src/lib/security/private-access.ts` yang mengizinkan akses lokal (loopback komputer pribadi dan jaringan LAN privat Wi-Fi nagari), menolak mutasi lintas-domain (CSRF), serta menolak akses publik jika kunci privat `KOPDES_PRIVATE_ACCESS_KEY` belum dikonfigurasi.
- **Perbaikan Database `created_by`**: Nilai `created_by` pada pencatatan rekapitulasi harian gerai kini diset `null` sesuai skema PostgreSQL nullable, menghilangkan potensi galat sintaks UUID.
- **Keutuhan Data Anggota**: Seluruh data anggota koperasi (`members`) dan gerai (`business_units`) tetap utuh 100%.

### 🔍 Diverifikasi
- **Vitest Unit Test**: 100/100 lulus 100% (10 berkas uji).
- **TypeScript Typecheck**: 0 galat (exit code 0).
- **Next.js Production Build**: 31 rute sukses terkompilasi optimal.

---

## [v2.2.1] — 23 September 2026 (Akses Lokal Tanpa Login)

### ✅ Ditambahkan
- Sakelar `NEXT_PUBLIC_KOPDES_LOCAL_AUTH_BYPASS` khusus mode development.
- Identitas lokal Abdul Halim dengan peran Manajer/Admin untuk pemeriksaan halaman internal.
- Banner yang menjelaskan bahwa login sedang dinonaktifkan pada pengembangan lokal.

### 🔐 Pengaman
- Sakelar selalu tidak aktif bila `NODE_ENV` bukan `development`; build dan deployment produksi tetap mewajibkan Supabase Auth.
- Service Role tetap server-only dan hanya dipakai pada mode lokal bila sudah tersedia.
- Ditambahkan tes yang memastikan mode bypass tidak aktif di lingkungan test/production.

### 🔍 Diverifikasi
- `/dashboard` dan `/api/dashboard/executive` merespons 200 tanpa sesi login pada mode development.
- 96/96 unit test lulus, TypeScript tanpa galat, dan build produksi berhasil.

## [v2.2.0] — 23 September 2026 (Penyempurnaan Pengalaman Manajer)

### ✅ Ditambahkan
- Komponen `Textarea` bersama dan fondasi kelas formulir terpusat.
- Pilihan tema **Terang**, **Gelap**, dan **Ikuti perangkat** pada halaman Pengaturan; preferensi tersimpan per perangkat.
- Label tanggal agenda berbahasa Indonesia pada panel kalender.
- Rencana pembangunan terperinci, alur kerja manajer, batas implementasi, dan prioritas lanjutan di `docs/HANDOFF.md`.

### 🛠️ Diperbaiki
- Input, dropdown, dan input tanggal dibuat konsisten, lebih lembut, memiliki tinggi 48 px, serta pesan bantuan/galat yang lebih aksesibel.
- Dialog lebih nyaman: panel bawah pada ponsel, panel tengah pada tablet/desktop, header/footer stabil, dan area isi dapat digulir.
- Kalender lebih aman untuk tablet dan ponsel: tombol navigasi 44 px, tab dapat digeser, tujuh kolom tidak dipadatkan berlebihan.
- Form tugas/agenda memakai komponen UI bersama agar lebih rapi dan mudah dirawat.
- Label saldo rekening yang belum diverifikasi tidak lagi menyatakan “Rp 0” sebagai saldo riil.
- Warna tema browser diselaraskan dengan latar terang dan gelap aplikasi.

### 🔍 Diverifikasi
- Audit visual langsung layar login pada desktop dan tablet 768×1024 dalam dark mode.
- `npm.cmd test -- --maxWorkers=1`: 95/95 tes lulus.
- `npm.cmd run typecheck`: lulus tanpa galat.
- Build produksi dicatat setelah verifikasi akhir pada `docs/STATUS.md`.

## [v2.1.0] — 23 September 2026 (Perbaikan & Penguatan Sistem)

### ✅ Ditambahkan
- **Dashboard**: Mini chart tren omset 7 hari terakhir (CSS murni, tanpa library grafik tambahan).
- **Dashboard**: Daftar 5 tugas mendesak/tinggi terbaru langsung di dashboard (bukan hanya angka).
- **Dashboard**: Progress bar kepatuhan pelaporan gerai harian dan daftar nama gerai yang belum lapor hari ini.
- **API Dashboard** (`/api/dashboard/executive`): Endpoint diperkaya — data tren 7 hari (`dailyTrend`), daftar tugas mendesak (`urgentTaskList`), dan gerai belum lapor (`unreportedUnits`).
- **docs/CHANGELOG.md**: File log perubahan baru untuk serah terima antar agen AI.

### 🛠️ Diperbaiki
- Label "Pusat Komando" di `ProductionDashboard.tsx` diganti → "Menu Utama" / "Dashboard Pemantauan Manajer".
- Link mati `/keuangan/jurnal` di halaman bantuan diarahkan ke `/keuangan`.
- Referensi halaman `/pemasok` dan `/aset` di `RelatedPages.tsx` dibersihkan.

### 🧹 Dihapus
- **Halaman**: `/aset` (aset koperasi — prematur), `/pemasok` (mitra pemasok — belum relevan).
- **API**: `/api/catalog` (duplikasi dengan `/api/stock-simple`).
- **Test**: `tests/phase11-catalog.test.ts` (test API catalog yang dihapus).
- **Navigasi**: Grup "Arsip & Referensi" (berisi Mitra Pemasok dan Buku Jurnal) dari sidebar.
- **Dokumen Usang** (10 file): `ACCEPTANCE.md`, `ACCESS_MATRIX.md`, `BUSINESS_RULES.md`, `DESIGN_EXTENSIONS.md`, `INTERACTION_MAP.md`, `PROJECT_BRIEF.md`, `SCOPE.md`, `SECURITY_CHECKS.md`, `THREAT_MODEL.md`, `USER_FLOWS.md`.
- **Folder Referensi Lama**: `references/stitch/`.

### 📝 Diperbarui
- `docs/HANDOFF.md`: Sinkronisasi daftar modul aktual, tabel API endpoint, dan identitas visual.
- `docs/STATUS.md`: Checkpoint terbaru pasca-pembersihan.
- Prompt files: Diperbarui agar lebih profesional dan detail.

---

## [v2.0.0] — 23 September 2026 (Transformasi Sistem)

### ✅ Ditambahkan
- **Kalender Agenda & Event** pada `/pekerjaan` (grid bulanan, navigasi, indikator tugas per tanggal).
- **Modul Keuangan**: Neraca (`/laporan`), Buku Besar (`/keuangan`), Simulasi SHU.
- **Pemantauan Gerai** (`/monitoring`): Form input rekap harian manual.
- **Database**: Migrasi bersih 7 tabel inti (`20260923000007_clean_simple_schema.sql`).

### 🧹 Dihapus
- Seluruh modul kasir POS lama (`/penjualan`, `/pembelian`, `/api/operations`).
- Migrasi database lama (`20260922000000` s.d. `20260923000006`).
- Dokumentasi historis usang dari `docs/`.

### 📝 Diperbarui
- Seluruh navigasi sidebar dibuka penuh (tidak ada lagi dialog "fitur ditunda").
- Penamaan dari "Pusat Komando" → "Menu Utama".
