# Serah terima Tahap 08B — 23 September 2026

## Mulai di sini

Pemilik kebutuhan: Abdul Halim. Jelaskan dalam bahasa Indonesia sederhana. Pengguna meminta dokumentasi serah terima karena limit hampir habis. **08B belum selesai; lanjutkan perbaikan frontend dan fungsi prototipe sebelum Tahap 09.** Jangan mengulang redesign dari nol atau menganggap hasil pemeriksaan 08A masih berlaku.

Baca README.md, AGENTS.md, STATUS.md, DECISIONS.md, dan DESIGN_SYSTEM.md. Folder kerja saat ini `D:\Koding\kopdes-ladang-laweh`; lokasi boleh berubah di komputer/editor lain. Tidak diperlukan model AI, plugin, atau editor tertentu. Salinan aturan lama di `.agents/rules` dan referensi Stitch bersifat historis jika bertentangan dengan keputusan pastel terbaru.

## Kondisi produk dan batas pekerjaan

- Next.js App Router, React, TypeScript strict, Tailwind v3. Pertahankan dependency terkunci; jangan mengganti stack untuk redesign.
- Organisasi masih Persiapan, target awal 2027, tanggal operasional null. Jangan memalsukan tanggal sistem, legalitas, akun, email, saldo, atau transaksi.
- Repository in-memory masih berisi contoh sesi. Perubahan dapat hilang ketika dimuat ulang. Login, Supabase, RLS, penyimpanan privat, dan pembukuan produksi belum terhubung.
- Unit usaha dinamis; Gerai Sembako rencana, USP nonaktif. Jangan mengaktifkan unit atau fitur keuangan produksi diam-diam.
- Folder sebelumnya tidak memiliki metadata Git. Pindahkan sumber lengkap, bukan hanya dokumen ini; `node_modules` dan `.next` dapat dibuat ulang.

## Perubahan 08B yang sudah ditulis, belum tervalidasi akhir

| Berkas/area | Perubahan |
|---|---|
| `src/components/ui/Card.tsx` | CardMetric mendapat footer aksi tautan/tombol, ikon pastel, hierarki teks, dan permukaan lembut; tipe ref judul diperbaiki. |
| `src/components/layout/PageHeader.tsx`, `RelatedPages.tsx` (baru) | Panel judul dan tautan pekerjaan terkait berdasarkan rute. |
| `src/components/ui/Breadcrumb.tsx` | Menghindari duplikasi Beranda dan memperbaiki penanda halaman aktif. |
| `src/components/ui/Button.tsx` | ButtonLink untuk navigasi; beberapa pola Link yang membungkus Button sudah dikonversi. Periksa kembali hasil konversi. |
| `Input.tsx`, `Select.tsx`, `DataTable.tsx`, `ErrorState.tsx` pada folder UI | ID formulir, hubungan pesan galat, penanda aksesibilitas, dan wilayah tabel gulir. |
| `src/lib/useResource.ts`, `src/components/ui/LoadingState.tsx`, `src/app/error.tsx` (baru) | Resource async dengan penolakan respons usang, indikator memuat, dan pemulihan galat halaman. Hook baru digunakan di dashboard. |
| `src/app/dashboard/page.tsx` | Dashboard ditulis ulang: ringkasan repository sesi, akses cepat, prioritas wajib, agenda mendatang, progres kategori, dan unit usaha. |
| `src/app/pemasok/page.tsx` | Form tambah/edit, konfirmasi arsip, jumlah PO dari repository, validasi kode duplikat di UI, status memuat/galat/coba lagi. |
| `src/app/anggota/page.tsx` | Ringkasan semua anggota, filter terverifikasi termasuk aktif, validasi NIK, konfirmasi batal, impor/ekspor CSV diperbaiki. Masih ada kekurangan formulir di bawah. |
| `src/lib/repository/index.ts` | getMemberSummary, filter verified, UUID anggota baru, validasi NIK impor, kolom opsional tidak lagi diisi data rekaan. |
| `src/lib/csv.ts` (baru) | Parser koma/kutip/baris baru/BOM; serializer mengutip sel dan mengurangi risiko formula spreadsheet. Belum diuji khusus. |
| `src/app/stok/page.tsx` | Filter kondisi stok, edit metadata produk, konfirmasi arsip, pemeriksaan SKU duplikat di UI, status memuat/galat. |
| Halaman aset, bantuan, keuangan, jurnal, laporan, pekerjaan, pembelian, pengaturan, penjualan, tata-kelola, unit-usaha | Aksi kartu terkait filter/tab/form/rute; penyederhanaan sejumlah kalimat dan penggantian warna Crimson literal. Audit belum menyeluruh. |
| `src/app/aset/page.tsx` | Filter needs_attention menghitung rusak dan perlu_perbaikan. |
| `src/app/pengaturan/page.tsx` | Ringkasan memakai profil repository, bukan nilai organisasi hardcoded. |

Komponen bersama menyebarkan perubahan ke banyak halaman, tetapi belum membuktikan semua halaman berfungsi baik. Sejumlah import tidak terpakai, blok try kurang rapi, dan JSX panjang masih perlu dirapikan.

## Masalah yang harus diselesaikan pertama

1. **Kompilasi gagal di pembelian:** `setSearchQuery` belum ada, dipanggil tiga aksi CardMetric (`src/app/pembelian/page.tsx`, saat tes baris 317, 328, 337). Pilihan yang dianjurkan: tambahkan state pencarian, kolom pencarian, dan filter gabungan status + nomor PO/nama pemasok. Saat ini filteredPos hanya memfilter status. Cocokkan aksi reset kartu dengan filter nyata.
2. **Form anggota:** pilihan domisili belum memiliki placeholder kosong yang sesuai state awal; validasi dan tampilan harus selaras. Reset domisili/pekerjaan setelah sukses; tampilkan status menyimpan pada tombol tambah dan cegah penutupan/batal saat proses berlangsung.
3. **Impor anggota:** dialog masih menyebut simulasi/pratinjau, padahal impor langsung mengubah repository sesi. Implementasikan pratinjau sebelum impor atau perbaiki kalimat agar jujur. Uji hasil parsial, NIK, duplikasi, format rusak, dan pencegahan klik ganda.
4. **Stok/pemasok:** periksa semua jalur Batal/tutup selama menyimpan. Uji edit produk hanya mengubah metadata, bukan jumlah stok. Periksa perilaku dialog ketika loadAllData memuat ulang. Pertimbangkan aturan arsip barang yang masih memiliki stok sesuai kontrak bisnis.
5. **Dashboard:** tautan prioritas dan agenda masih membuka halaman umum, belum memilih item/tab spesifik. Sesuaikan tujuan atau label. Periksa format tanggal Asia/Jakarta dan pemilihan agenda mendatang.
6. **Galat pemuatan:** belum seragam di semua modul; pengaturan dan beberapa handler masih berpotensi macet atau tidak menyampaikan kegagalan. Jangan mengganti kegagalan dengan data contoh.

## Urutan kerja berikutnya

1. Baca kode aktual dan perbaiki galat kompilasi terlebih dahulu. Jalankan typecheck; hasilnya mungkin memunculkan galat tambahan karena kode berubah setelah tes terakhir.
2. Tuntaskan kekurangan formulir di atas, kemudian audit tiap halaman dan kartu: tujuan aksi jelas, tombol benar-benar bekerja, hasil kosong dapat dipahami, dan perhitungan ringkasan sesuai data/filter yang dimaksud.
3. Tambahkan tes bermakna: ringkasan anggota lintas pagination, filter verified, CSV kutip/koma/multibaris/format rusak/formula, ID anggota unik, edit pemasok, edit produk tanpa mutasi stok, aksi CardMetric, dan aksesibilitas ID formulir.
4. Rapikan import dan struktur komponen tanpa perubahan perilaku yang tidak perlu. Jangan menambah dependency atau menulis tes yang hanya menyalin implementasi.
5. Periksa browser seluruh rute termasuk detail anggota/unit usaha: terang/gelap, desktop, tablet, ponsel, keyboard, dialog, filter, impor/ekspor. Gunakan ID dari repository untuk rute detail. Jangan menyatakan audit seluruh aplikasi berdasarkan dashboard saja.
6. Jalankan pemeriksaan lengkap di bawah; perbaiki kegagalan, lalu perbarui STATUS.md dengan hasil riil dan batasannya. Baru setelah 08B selesai, laporkan Tahap 09 sebagai tahap berikutnya.

Usulan untuk dinilai saat audit, **belum diimplementasikan/ditetapkan**: edit aset, tambah rencana unit usaha melalui UI, dan panduan bantuan yang lebih sesuai alur aktual. Tambahkan hanya bila alurnya jelas dan tetap dalam lingkup prototipe.

## Pemeriksaan dan cara mencoba

```sh
npm ci
npm run typecheck
npm test -- --maxWorkers=1
npm run dev
```

Pada PowerShell gunakan `npm.cmd` jika skrip npm.ps1 diblokir. Buka localhost:3000. Periksa dahulu server/port yang masih aktif; jangan menganggap server dari sesi lama masih berjalan. Setelah pemeriksaan browser, hentikan dev sebelum `npm run build` agar tidak berbagi output `.next` bersamaan.

**Bukti terakhir:** typecheck 08B gagal pada tiga nama setSearchQuery di pembelian. Ada edit setelah kegagalan itu. Tes dan build final 08B belum dijalankan. Navigasi browser dashboard 08B mengalami timeout, jadi belum ada bukti visual terbaru.

**Riwayat 08A saja:** 32/32 tes lulus, typecheck dan build lulus, dashboard diperiksa desktop terang/gelap, tablet, ponsel. Pengulangan Vitest default pernah macet; pemeriksaan dengan `--maxWorkers=1` lulus. Hasil ini tidak menjamin kode 08B lulus. Berkas tes yang sudah ada: `tests/components.test.tsx` dan `tests/navigation-dialog.test.tsx`. Skrip E2E/lint belum menjadi pemeriksaan nyata; jangan melaporkan placeholder sebagai lulus.

## Prompt untuk AI berikutnya

> Baca README.md, AGENTS.md, docs/STATUS.md, docs/HANDOFF_08B.md, docs/DECISIONS.md, dan docs/DESIGN_SYSTEM.md. Lanjutkan Tahap 08B yang belum selesai dari kode aktual, mulai dengan galat kompilasi pembelian. Pertahankan desain pastel dan dark mode lembut, rapikan formulir, kalimat, navigasi serta aksi kartu, lalu uji secara nyata. Jangan mulai Tahap 09, mengarang data produksi, atau menganggap hasil tes 08A berlaku untuk kode terbaru. Perbarui dokumentasi dan jelaskan hasil dalam bahasa Indonesia sederhana.
