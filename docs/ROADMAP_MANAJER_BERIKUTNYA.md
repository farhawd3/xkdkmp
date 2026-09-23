# Rancangan kerja berikutnya — ruang kerja manajer

**Prompt implementasi yang lebih rinci:** [prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md](../prompts/91_Pengembangan_Fitur_Manajer_Lanjutan.md). Dokumen tersebut memperinci usulan menu Meja Kerja dan Kinerja Gerai, enam kelompok fitur kompleks, kontrak data, kasus tepi, desain per perangkat, tahapan persetujuan, serta pertanyaan bisnis. Semua masih rancangan.

Dokumen ini adalah instruksi eksekusi untuk AI/pengembang berikutnya, **bukan daftar fitur yang sudah jadi**. Baca `AGENTS.md`, `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, dan `docs/DESIGN_SYSTEM.md` terlebih dahulu. Pemilik kebutuhan: Abdul Halim; aplikasi pribadi untuk mengelola Kopdes Merah Putih — Ladang Laweh. Bahasa antarmuka dan laporan kepada pemilik harus sederhana. Produk ini alat manajemen/pemantauan, bukan kasir POS.

## Keadaan nyata sebelum menambah fitur

- Dasar v2.8 dan penyegaran v2.9 sudah ada. Dashboard saat ini memakai `/api/dashboard/executive`; jangan membuat angka contoh agar layar tampak ramai.
- GET anggota dan stok masih HTTP 500 karena skema Cloud lama berbeda. Draf `supabase/drafts/20260923000009_align_members_products.sql` **belum disetujui, diuji di PostgreSQL, atau dijalankan**. Jangan pindahkan/eksekusi migrasi tanpa penjelasan SQL dan persetujuan Bapak. Bereskan ini sebelum mengklaim dashboard stok/anggota akurat.
- Backup/restore belum atomik dan belum terbukti lengkap di atas 1.000 baris. Jangan uji restore pada data koperasi nyata. Lingkungan aplikasi hanya localhost hingga batas akses privat LAN/hosting diputuskan.
- Perubahan sesi ini hanya tata letak dashboard dan dokumen; fitur di bawah masih rancangan. Nilai 0 harus dibedakan dari belum ada rekap dan galat.

## Urutan pembangunan yang disarankan

### 0. Amankan pondasi data (prioritas wajib, bukan kosmetik)

1. Inventaris skema Supabase sesungguhnya: tipe, constraint, indeks, trigger, RLS, dependensi. Tinjau draf SQL aditif anggota/stok, backup sebelum perubahan, uji pada salinan, jelaskan hasil dan minta izin eksplisit sebelum cloud diubah.
2. Uji GET/POST/PATCH anggota dan stok dengan data uji yang disepakati; verifikasi satuan stok desimal, nomor anggota lama, impor CSV dan ekspor. Jangan menambah data uji ke operasional tanpa izin.
3. Audit pagination untuk semua query dan backup; pastikan hasil >1.000 baris lengkap. Rancang restore atomik dengan validasi tiap baris/relasi, ukuran unggahan, dan rollback. SQL baru juga wajib konfirmasi.
4. Lengkapi uji keamanan lingkungan privat. Ketiadaan login berarti Vercel publik tanpa pelindung jaringan **tidak layak** untuk data anggota/keuangan.

### 1. Dashboard keputusan harian (tanpa tabel baru dahulu)

**Fitur A — Status pelaporan gerai:** daftar gerai aktif yang belum melapor hari ini, dengan nama, PIC, dan tautan ke pemantauan. Angka pembagi hanya gerai aktif. Jika gerai belum beroperasi, tampilkan “Belum ada gerai aktif”, bukan 100% patuh. Sumber `business_units` + `unit_daily_reports`; wajib cocok dengan KPI.

**Fitur B — Capaian target per gerai:** target bulanan versus akumulasi omset sampai hari ini, beserta persentase dan jumlah hari rekap. Tampilkan “Target belum ditetapkan” bila kosong/0; jangan menafsirkan rekap yang hilang sebagai omzet nol. Tampilan: tabel/kartu ringkas yang dapat dibuka ke riwayat gerai. Sumber target di `business_units` dan laporan harian; tidak perlu tabel baru jika skema memadai.

**Fitur C — Perbandingan periode yang jujur:** bulan ini versus periode setara bulan lalu (hari 1 sampai tanggal yang sama), dengan penanda kelengkapan laporan kedua periode. Hanya tampilkan perubahan persentase bila kedua periode layak dibandingkan; selain itu “Data pembanding belum cukup”. Hindari kesimpulan otomatis “naik/turun” dari periode parsial.

**Fitur D — Agenda terdekat:** maksimal lima tugas bertanggal terdekat/terlambat dari `tasks`, urut keterdesakan. Klik menuju tugas terkait. Jangan menambah kalender kedua di dashboard; cukup cuplikan yang mengarahkan ke `/pekerjaan`.

**Syarat selesai tahap 1:** perhitungan diuji dengan zona WIB, akhir bulan, gerai nonaktif, rekap kosong, target 0, dan tanggal masa depan; API menangani query gagal secara jelas; kartu tidak memotong angka Rupiah; angka dashboard cocok dengan modul sumber.

### 2. Alur tindak lanjut manajer

**Fitur E — Pintasan terfilter yang benar:** dari kartu “belum lapor”, “stok menipis”, dan “tugas terlambat” buka modul tujuan dengan filter yang sudah aktif melalui parameter URL yang tervalidasi. Jangan hanya mengarah ke halaman umum atau membuat parameter yang diabaikan. Jika item spesifik tersedia, fokuskan item tersebut dan sediakan tombol kembali.

**Fitur F — Catatan review harian:** rancangkan ringkasan “sudah saya tinjau hari ini” untuk manajer, tetapi tentukan dulu apakah hanya preferensi lokal atau bukti audit permanen. Jika harus permanen, perlu model data dan persetujuan migrasi; jangan menyamarkan localStorage sebagai catatan resmi. Awali dengan spesifikasi keputusan bisnis dan prototipe non-persisten.

**Syarat selesai tahap 2:** filter bertahan saat refresh/back; URL salah tidak merusak halaman; keadaan kosong/galat tetap berbeda; status tinjauan tidak pernah disajikan sebagai verifikasi resmi jika belum tercatat di server.

### 3. Pelaporan dan keluaran kerja

**Fitur G — Ringkasan rapat manajer:** cetak A4/CSV berisi periode, sumber data, jumlah gerai yang melapor, total omset/pengeluaran, kendala penting, dan tugas terbuka. Bukan laporan keuangan resmi atau SHU. Tanggal WIB, identitas koperasi dari profil, catatan data yang belum lengkap, serta halaman cetak lebih dari satu harus jelas.

**Fitur H — Kualitas data:** panel kecil yang menandai profil kosong, gerai tanpa target/PIC, rekap tertunda, serta stok tanpa batas minimum. Ini daftar pekerjaan, bukan skor kesiapan fiktif. Setiap masalah punya tautan perbaikan.

**Syarat selesai tahap 3:** ekspor CSV tahan formula injection, unduhan memuat hanya kolom yang dibutuhkan, cetak A4 tidak memotong tabel, dan tidak ada klaim “terverifikasi” hanya karena query berhasil.

## Panduan desain khusus dashboard dan fitur baru

1. **Hierarki:** baris atas cukup satu header berisi sapaan, tanggal WIB, nama koperasi, waktu pembaruan dan dua aksi (Perbarui, Unduh CSV). Jangan ulang sapaan/tanggal dalam baris lain. Di bawahnya 4 KPI utama, lalu area fokus harian, angka pendukung, dan tren. Tautan lintas modul cukup pada kartu/aksi kontekstual; jangan tambah baris navigasi generik pada dashboard.
2. **Kepadatan:** pada desktop 1440 px, 4 KPI satu baris; tablet 768–1024 px dua kolom; ponsel satu kolom. Ruang antar kartu 12–16 px, antar seksi 20–24 px. Kartu dengan informasi pendek tidak boleh menjadi tinggi hanya untuk mengisi ruang kosong. Grafik tanpa data menjadi *empty state* singkat, bukan kanvas kosong tinggi.
3. **Tipografi:** angka KPI paling jelas (24–28 px, tabular numerals), label 14 px, penjelasan 13–14 px. Hindari seluruh kalimat dalam huruf kapital; tautan menjelaskan tujuan. Angka Rupiah panjang boleh membungkus dengan sengaja, tidak bertabrakan dengan ikon.
4. **Warna:** mayoritas permukaan netral (`#F7F8FC`/putih dan `#1D2533`/`#252F40`); rose `#A64768` untuk aksi utama/penekanan. Amber hanya untuk “perlu perhatian”, merah untuk galat/kritis, hijau untuk keberhasilan yang terbukti. Jangan jadikan warna satu-satunya penjelas status. Jangan mengubah token global hanya untuk satu halaman.
5. **Kondisi data:** empat keadaan berbeda: memuat, gagal, kosong, dan ada data. “0” yang dihitung dari laporan lengkap berbeda dari “belum melapor”. Tuliskan periode, basis perhitungan, dan batas data dekat angka. Tidak perlu grafik jika tujuh hari sama-sama belum punya omset tercatat.
6. **Interaksi:** area sentuh minimal 44 px; dropdown punya label, fokus jelas, opsi/hover terbaca terang-gelap, fallback native tetap berfungsi. Modal menjaga judul dan tombol simpan terlihat saat isi panjang. Tombol ekspor tidak boleh terlihat seperti aksi utama yang lebih penting dari tindak lanjut kerja.
7. **Aksesibilitas:** urutan Tab logis, fokus terlihat, heading berjenjang, filter berlabel, chart punya rincian tekstual, `aria-live` secukupnya untuk hasil refresh, kontras diuji. Hormati `prefers-reduced-motion`; jangan memakai animasi dekoratif berlebihan.
8. **Matriks pemeriksaan visual:** desktop 1440×900, tablet 1024×768 dan 768×1024, ponsel 390×844; setiap ukuran terang/gelap. Periksa header, KPI, dropdown terbuka, rincian chart, keadaan kosong dan terisi, zoom 200%, keyboard, dan cetak. Screenshot/hasil dicatat di STATUS, jangan mengklaim seluruh ukuran sudah diuji bila belum.

## Cara kerja AI berikutnya

- Kerjakan satu tahap kecil sampai benar-benar selesai, jangan membangun semua fitur sekaligus. Dahulukan integritas data dibanding kosmetik.
- Sebelum kode: baca implementasi/API/model saat ini dan perubahan Git yang belum di-commit. Jangan reset pekerjaan yang ada. Jelaskan asumsi bisnis yang belum jelas kepada Bapak.
- Pecah komponen jika mengurangi kerumitan nyata; hindari abstraksi yang hanya memindahkan baris kode. Satu perhitungan dipakai UI, CSV dan tes. Gunakan TypeScript strict dan validasi Zod pada API.
- Setelah setiap perubahan: `npm.cmd test -- --run`, `npm.cmd run typecheck`, `npm.cmd run build`; periksa browser nyata, lalu perbarui `docs/STATUS.md`, `docs/CHANGELOG.md`, dan dokumen ini sesuai hasil. Catat apa yang belum diuji.
- Jika perlu SQL/Supabase, siapkan draf di `supabase/drafts/`, jelaskan efek/risiko/rollback dalam bahasa biasa, **minta persetujuan dahulu**. Jangan memakai data pribadi koperasi sebagai fixture tes.
