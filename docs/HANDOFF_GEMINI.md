# Serah terima ke Gemini — 23 September 2026

## Kondisi terakhir yang perlu diketahui

- Proyek: Kopdes Merah Putih — Ladang Laweh, Next.js 15/React/TypeScript/Tailwind, status organisasi **Persiapan**. Tema pastel rose dan dark mode biru abu. Aturan utama di `AGENTS.md`.
- Kode autentikasi Supabase Tahap 10 tersedia. `.env.local` ada di mesin ini, berisi URL dasar Supabase dan kunci publik; **jangan membaca, menyalin, menampilkan, atau mengirim nilai rahasia ke Gemini/chat**. File itu dikecualikan dari Git. Jika proyek dipindahkan ke mesin lain, pengguna mengisi env sendiri.
- Pengguna melaporkan migrasi bootstrap admin di SQL Editor berhasil. Hal itu **belum diperiksa langsung** oleh aplikasi/tes SQL cloud. Jangan menyatakan RLS, peran, dan operasi produksi telah teruji.
- Jalur masuk tamu `/auth/preview` telah dihapus. Cookie lama tidak lagi membuka dashboard.
- `src/lib/repository/supabase.ts` masih berisi metode yang melempar galat. Mengisi env dapat mengaktifkan login, tetapi modul dashboard/operasional belum terhubung. Jangan menambahkan fallback data contoh ketika Supabase gagal.
- Permasalahan paling baru: pengguna mengalami halaman login tertahan pada tombol “Memverifikasi akun...”. URL env semula memiliki jalur API tambahan dan sudah dikoreksi menjadi URL dasar. Pemeriksaan endpoint Auth dengan kunci publik mengembalikan HTTP 200. Form login kini memiliki batas tunggu 20 detik dan pengalihan halaman penuh setelah sukses; **hasil login ulang pengguna belum diketahui**. Batas tunggu UI tidak membatalkan permintaan jaringan yang sudah dimulai.

## Hasil pemeriksaan terakhir

- `npm.cmd run typecheck`: lulus.
- `npm.cmd test -- --maxWorkers=1`: **71/71 lulus**, enam berkas tes.
- `npm.cmd run build`: lulus pada checkpoint sebelum perubahan terakhir alur login; **belum diulang setelah perubahan batas tunggu/pengalihan**.
- Browser: formulir login terlihat aktif lagi setelah perubahan. Belum ada bukti masuk ke dashboard dengan akun pengguna, uji E2E nyata, atau uji RLS di cloud.

## Berkas penting dan prioritas

1. Baca `README.md`, `AGENTS.md`, `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/DECISIONS.md`, dan dokumen ini. Ikuti kode aktual bila dokumen lama berbeda.
2. Selesaikan diagnosis login dahulu. Minta pengguna mencoba ulang dan laporkan pesan tanpa kata sandi. Periksa respons Auth dan pengalihan secara aman; jangan menebak bahwa kata sandi salah. `src/app/login/page.tsx`, `src/lib/auth/utils.ts`, `src/lib/supabase/{client,server,middleware}.ts` adalah berkas utama.
3. Setelah login terbukti berhasil, audit `supabase/migrations/` dan uji RLS serta fungsi bootstrap/peran di lingkungan pengembangan. Fungsi bootstrap dan penautan profil dalam migrasi keempat telah diberi `REVOKE` dari PUBLIC/anon/authenticated dan `GRANT` ke service_role; pastikan versi itu benar-benar diterapkan di cloud.
4. Tahap 11 adalah rencana integrasi repository Supabase dan otorisasi mutasi server. Kerjakan **hanya jika pengguna memintanya**. Jangan klaim Tahap 11 dimulai hanya karena handoff ini.
5. Setelah perubahan, jalankan tes relevan, typecheck, build jika perlu, kemudian perbarui `docs/STATUS.md` dan dokumen serah terima. Bedakan tes lokal dari bukti koneksi cloud.

## Perintah lokal

```sh
npm ci
npm run dev
npm run typecheck
npm test -- --maxWorkers=1
npm run build
```

Pada Windows PowerShell gunakan `npm.cmd` bila `npm.ps1` terhalang. Jangan menjalankan `dev` dan `build` bersamaan pada `.next` yang sama. Server dari sesi Codex sebelumnya tidak boleh diasumsikan masih aktif di sesi Gemini.

## Prompt siap tempel ke Gemini

> Saya melanjutkan proyek Kopdes Merah Putih — Ladang Laweh di folder proyek lengkap ini. Baca AGENTS.md, README.md, docs/STATUS.md, docs/HANDOFF.md, docs/HANDOFF_GEMINI.md, dan docs/DECISIONS.md. Periksa kode aktual. Prioritas pertama adalah memastikan login Supabase berhasil setelah perbaikan URL dasar, batas tunggu 20 detik, dan pengalihan halaman penuh. Jangan membaca atau meminta isi `.env.local`, kata sandi, maupun kunci. Saya telah melaporkan bootstrap admin di SQL Editor berhasil, tetapi login dashboard dan uji RLS cloud belum terverifikasi. Jelaskan temuan dalam bahasa Indonesia sederhana. Setelah login jelas, berikan penilaian dan langkah berikutnya; jangan mulai Tahap 11 tanpa instruksi saya.
