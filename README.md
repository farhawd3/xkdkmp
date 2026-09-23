# Kopdes Merah Putih — Ladang Laweh

Prototipe aplikasi manajemen koperasi berbahasa Indonesia, untuk tablet dan komputer. Status organisasi **Persiapan**, target awal 2027; tanggal pembukaan belum ditetapkan.

**Serah terima terkini:** Kode autentikasi Tahap 10 tersedia, `.env.local` sudah ada pada komputer ini, dan pengguna melaporkan bootstrap admin SQL Editor berhasil. Login dashboard masih perlu diverifikasi; modul Supabase belum terhubung. Jalur masuk tamu sementara sudah dihapus. Untuk pindah ke Gemini baca [serah terima terbaru](docs/HANDOFF_GEMINI.md), [status](docs/STATUS.md), dan [panduan Supabase](docs/SUPABASE_SETUP.md). Jangan bagikan nilai `.env.local`.

## Mulai menjalankan

Prasyarat: Node.js dan npm yang kompatibel dengan versi terkunci di package-lock.json (disarankan Node 22 LTS). Dari folder proyek:

```sh
npm ci
npm run dev
```

Buka http://localhost:3000. Pada Windows PowerShell, gunakan npm.cmd bila npm.ps1 diblokir. Untuk meninjau kompilasi produksi: npm run build lalu npm start. Jangan menjalankan build dan dev bersamaan pada folder .next yang sama.

## Kondisi nyata

- Next.js App Router, React, TypeScript strict, Tailwind CSS v3.
- Repository berada di src/lib/repository/index.ts dan menyimpan data di memori sesi. Ada data contoh persiapan, master, dan dokumen untuk latihan; bukan data resmi. Muat ulang dapat menghilangkan perubahan.
- Database, login nyata, otorisasi server/RLS, storage privat, backup, dan pembukuan produksi belum selesai. Nama pemilik kebutuhan bukan sesi login terautentikasi.
- Jangan masukkan data identitas atau transaksi nyata ke prototipe. Jangan memindahkan seed contoh ke produksi.
- Folder yang diaudit belum memiliki metadata Git. Keberadaan .gitignore tidak berarti riwayat kode sudah dicadangkan.

## Pemeriksaan

```sh
npm test
npm run typecheck
npm run build
```

Vitest mencakup komponen dan perilaku prototipe. Playwright E2E belum dikonfigurasi; skrip test:e2e sengaja gagal dengan penjelasan agar tidak memberikan hasil sukses palsu. Lint juga belum dikonfigurasi sebagai quality gate; gunakan pemeriksaan tipe dan build sambil menyiapkan konfigurasi ESLint pada pekerjaan berikutnya.

## Peta folder

- src/app: halaman dan rute aplikasi.
- src/components/layout: shell, sidebar, header, dan status prototipe.
- src/components/ui: tombol, kartu, tabel, formulir, dialog.
- src/lib: sumber navigasi, tema, label checklist, dan repository prototipe.
- src/types: kontrak tipe data.
- tests: pengujian Vitest.
- docs: status, keputusan, desain, dan spesifikasi bisnis/keamanan.
- references dan brief: referensi historis, bukan sumber data produksi.

## Melanjutkan dengan AI atau editor apa pun

Baca AGENTS.md → docs/HANDOFF.md → docs/STATUS.md → docs/HANDOFF_08B.md → docs/DECISIONS.md → docs/DESIGN_SYSTEM.md, lalu dokumen modul terkait. Tidak perlu model tertentu, Antigravity, atau koneksi Stitch untuk menjalankan proyek ini. Gunakan sumber lokal yang tersedia. Jangan menganggap isi folder supabase sudah terpasang pada database. Laporkan hasil tes aktual dan perbarui status setelah perubahan.

Keputusan warna terbaru ada di docs/DESIGN_SYSTEM.md. AGENTS.md pada root mengungguli salinan aturan editor lama. Rincian perubahan checkpoint dan pekerjaan tersisa ada di docs/FRONTEND_REFRESH.md.
