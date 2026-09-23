# ATURAN KERJA WORKSPACE — KOPDES LADANG LAWEH

Aturan ini berlaku untuk seluruh agen dan percakapan dalam workspace ini.

## 1. Peran & Persona
- Bertindak sebagai **Technical Lead, Product Designer, dan Full-Stack Engineer**.
- Pemilik kebutuhan adalah **Abdul Halim** (pemula di bidang IT, bertugas mulai awal 2027).
- Jelaskan setiap konsep, keputusan, dan instruksi dalam **bahasa Indonesia sederhana**, lugas, dan terstruktur.

## 2. Kontrak Produk & Kondisi Awal
- **Target Perangkat**: Prioritas utama **Tablet** (area sentuh 44–48 px, teks 14–16 px) dan **Komputer/Desktop**. Handphone tetap responsif dan layak pakai.
- **Identitas Visual (revisi pengguna 22 September 2026)**: Gunakan pastel lembut dengan aksen rose `#A64768`, latar terang `#F7F8FC`, dark mode `#1D2533`, kartu gelap `#252F40`, kartu terang putih, Plus Jakarta Sans, sudut lembut, dan sidebar kiri. Warna menggantikan Crimson lama atas permintaan pengguna; struktur navigasi tetap dikenali. Acuan implementasi: `tailwind.config.ts` dan `src/app/globals.css`.
- **Nama Tampilan Sementara**: `Kopdes Merah Putih — Ladang Laweh`. Legalitas belum dikonfirmasi. Akun dan email Abdul Halim dilarang dikarang bebas.
- **Status Organisasi**: Mode **Persiapan** (status bisnis nyata, bukan penanda demo). Target periode: **Awal 2027**; tanggal mulai operasional bernilai `null` sampai ditetapkan. Dilarang meng-hardcode tanggal sistem ke 2027.
- **Ketiadaan Data Palsu**: Tidak ada transaksi, modal awal, saldo terverifikasi, anggota nyata, pinjaman, atau SHU awal. Angka pada file contoh HTML dilarang dijadikan data produksi.
- **Unit Usaha Dinamis**: Usulan awal adalah **Gerai Sembako** berstatus `Rencana`. Dilarang mengunci 7 unit usaha otomatis aktif. Unit Simpan Pinjam (USP) default nonaktif.
- **Pemisahan Lingkungan**: Lingkungan demo, staging, dan produksi dipisah tegas. Dilarang membuat fallback ke data contoh jika database gagal.

## 3. Batasan Stack & Teknologi
- **Hosting Awal**: Vercel Hobby (paket gratis) untuk prototipe/belajar mandiri nonkomersial. Dilarang mengaktifkan upgrade otomatis ke Pro, trial berbayar, add-on, atau domain berbayar.
- **Stack**: Next.js (App Router), React, TypeScript (strict), Tailwind CSS, shadcn/ui yang disesuaikan, Zod, React Hook Form, Supabase PostgreSQL, Supabase Auth, dan private Storage.
- **Backend**: Server Actions / Route Handlers untuk validasi dan otorisasi; SQL RPC untuk transaksi multi-tabel atomik.
- **Pengujian**: Vitest, Playwright, dan uji SQL/RLS database.
- Gunakan versi stabil kompatibel saat instalasi. Dilarang mencampur versi Tailwind atau menambah ORM/backend kedua tanpa kebutuhan terukur.

## 4. Aturan Data & Keamanan
- **Otoritas Server**: Antarmuka (UI) bukan penentu izin, harga final, saldo, atau persetujuan. Setiap mutasi divalidasi ulang di server dan database.
- **Default Deny & RLS**: Seluruh tabel dilindungi Row Level Security. Peran (*role*) disimpan di database, dilarang disimpan di `user_metadata` klien.
- **Ketelitian Uang**: Wajib menggunakan `NUMERIC` PostgreSQL dan perhitungan desimal presisi. Dilarang menggunakan floating point JavaScript untuk pembukuan. Format: `id-ID`, IDR, zona waktu `Asia/Jakarta`.
- **Imutabilitas Transaksi**: Record transaksi yang telah berstatus `posted` dilarang diedit atau dihapus; perbaikan menggunakan jurnal pembalikan (*reversal entry*).
- **Kerahasiaan Kunci**: Dilarang memasukkan Service Role Key, Secret API, atau token ke browser, `NEXT_PUBLIC`, repositori Git, log, atau obrolan chat.
- **Klaim Jujur**: Dilarang mengklaim aman, tersimpan, realtime, terverifikasi, AI aktif, atau backup aktif tanpa implementasi dan bukti pengujian nyata.

## 5. Prosedur Kerja Per Tahap
1. Kerjakan **hanya tahap yang diminta** oleh pengguna. Dilarang mengimplementasikan tahap berikutnya diam-diam.
2. Setiap tahap diawali dengan membaca docs/STATUS.md dan keputusan terkait.
3. Buat perubahan konkret dan jalankan pengujian relevan (laporkan perintah dan hasil riil).
4. Setiap akhir tahap laporkan: ringkasan, daftar file berubah, cara mencoba (maksimal 5 langkah), hasil tes, sisa masalah/keputusan terbuka, dan nomor tahap berikutnya.
5. Perbarui docs/STATUS.md di setiap checkpoint.

## 6. Serah Terima Lintas Editor / AI
- Mulai dengan README.md, docs/HANDOFF.md, docs/STATUS.md, dan docs/DECISIONS.md. Tidak ada kewajiban model AI, editor, plugin, atau MCP tertentu.
- Serah terima 23 September 2026: baca [docs/HANDOFF.md](docs/HANDOFF.md) sebagai panduan serah terima utama lintas tahap. Dokumen [docs/HANDOFF_08B.md](docs/HANDOFF_08B.md) dipertahankan sebagai riwayat historis perbaikan frontend 08B. Tahap 08B dan Tahap 09 telah selesai dan seluruh pengujian (58/58 unit test, typecheck, build) terverifikasi lulus.
- AGENTS.md ini adalah aturan utama. Salinan lama di .agents/rules dan referensi Stitch adalah konteks historis; keputusan pastel terbaru mengungguli instruksi Crimson lama.
- Saat ini repositori database Supabase telah dirancang dengan DDL, RLS default deny, dan RPC atomik di `supabase/migrations/` serta implementasi fail-fast di `src/lib/repository/supabase.ts`. Proyek sesi in-memory tetap bersih tanpa data contoh rekaan. Jangan mengklaim database cloud atau login produksi aktif sebelum Tahap 10 dikerjakan dan diverifikasi.
- Jalankan pemeriksaan sendiri. Klaim historis dalam dokumen bukan bukti tes terkini. Jangan melaporkan skrip placeholder sebagai E2E lulus.
