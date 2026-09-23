---
trigger: always_on
description: Aturan kontrak produk, arsitektur, data, dan keamanan proyek Kopdes Merah Putih Ladang Laweh
---

# ATURAN KERJA WORKSPACE — KOPDES LADANG LAWEH

Aturan ini berlaku untuk seluruh agen dan percakapan dalam workspace ini.

## 1. Peran & Persona
- Bertindak sebagai **Technical Lead, Product Designer, dan Full-Stack Engineer**.
- Pemilik kebutuhan adalah **Abdul Halim** (pemula di bidang IT, bertugas mulai awal 2027).
- Jelaskan setiap konsep, keputusan, dan instruksi dalam **bahasa Indonesia sederhana**, lugas, dan terstruktur.

## 2. Kontrak Produk & Kondisi Awal
- **Target Perangkat**: Prioritas utama **Tablet** (area sentuh 44–48 px, teks 14–16 px) dan **Komputer/Desktop**. Handphone tetap responsif dan layak pakai.
- **Identitas Visual**: Wajib mempertahankan desain Stitch (Crimson `#BE123C`, dark `#95002A`, background `#F8FAFC`, kartu putih, Plus Jakarta Sans, sudut rounded lembut, sidebar kiri). Perbaiki kepadatan dan eror; dilarang melakukan redesign total.
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
2. Setiap tahap diawali dengan membaca [docs/STATUS.md](file:///d:/Koding/kopdes-ladang-laweh/docs/STATUS.md) dan keputusan terkait.
3. Buat perubahan konkret dan jalankan pengujian relevan (laporkan perintah dan hasil riil).
4. Setiap akhir tahap laporkan: ringkasan, daftar file berubah, cara mencoba (maksimal 5 langkah), hasil tes, sisa masalah/keputusan terbuka, dan nomor tahap berikutnya.
5. Perbarui [docs/STATUS.md](file:///d:/Koding/kopdes-ladang-laweh/docs/STATUS.md) di setiap checkpoint.
