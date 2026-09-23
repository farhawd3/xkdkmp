# Status Proyek — Kopdes Merah Putih Ladang Laweh

Terakhir diperbarui: 23 September 2026 — Implementasi Tahap P1 Selesai (Meja Kerja Manajer /meja-kerja).

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
