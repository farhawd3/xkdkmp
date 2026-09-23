# THREAT MODEL — KOPDES MERAH PUTIH LADANG LAWEH
*(docs/THREAT_MODEL.md)*

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Rencana Mitigasi Ancaman Keamanan  

Dokumen ini memetakan vektor ancaman keamanan, potensi eksploitasi, kontrol mitigasi yang dirancang, serta skenario pengujiannya sebelum implementasi kode.

---

## 1. Prinsip Keamanan Mengikat

1. **Security by Design, Not UI Badges**: Keamanan ditegakkan melalui validasi server dan constraint database, bukan teks "Aman" atau tombol tersembunyi di browser.
2. **Prinsip Default Deny**: Seluruh akses rute, endpoint Server Actions, fungsi RPC, dan tabel PostgreSQL ditolak secara bawaan kecuali terdapat izin eksplisit.
3. **Pemisahan Wewenang (Maker-Checker)**: Tindakan finansial dan persetujuan pengadaan di atas ambang batas wewenang mewajibkan dua pihak berbeda (*two-person rule*).
4. **Keamanan Tanpa Data Palsu**: Tidak ada fallback ke data tiruan jika layanan autentikasi atau basis data gagal.

---

## 2. Pemetaan 11 Vektor Ancaman Kritis

| ID Ancaman | Vektor & Skenario Serangan | Dampak Bisnis / Teknis | Kontrol Mitigasi yang Dirancang | Tahap | Status |
|---|---|---|---|:---:|:---:|
| **THR-01** | **Perangkat Bersama (Shared Tablet/PC)**: Operator kasir meninggalkan sesi login di tablet; staf lain menyalahgunakan akses. | Mutasi transaksi ilegal, pencurian kasir, akses data warga desa. | Auto-lock sesi idle (15 menit), logout otomatis saat shift tutup, dilarang simpan sandi di browser kasir. | 10 | Belum Diuji |
| **THR-02** | **Bypass Otorisasi di Klien (IDOR & URL Tampering)**: Penyerang mengganti parameter ID pada URL/payload (misal `/anggota/999` atau `po_id`). | Melihat/mengubah data anggota lain atau menyetujui PO unit lain. | Server Actions & Route Handlers memvalidasi ulang kepemilikan data dan scope unit pengguna di database. | 09, 11 | Belum Diuji |
| **THR-03** | **Manipulasi Peran Mandiri (Role Escalation)**: Penyerang mengubah role menjadi `admin` melalui manipulasi payload `user_metadata` Supabase Auth. | Pengambilalihan seluruh sistem dan pembukuan koperasi. | Peran disimpan murni di tabel `user_roles` database; metadata klien diabaikan total oleh server & RLS. | 09, 10 | Belum Diuji |
| **THR-04** | **Transmutasi Finansial Parsial & Race Condition**: Transaksi kasir klik ganda saat koneksi lambat; mutasi stok terpotong dua kali. | Selisih kas, stok negatif, atau pencatatan omzet ganda. | Transaksi atomik via PostgreSQL RPC dengan idempotency key dan row locking (`SELECT ... FOR UPDATE`). | 09, 14 | Belum Diuji |
| **THR-05** | **Bocornya Berkas Identitas (Storage Exposure)**: Dokumen KTP/NIK warga desa dapat diunduh siapa saja karena bucket storage publik. | Kebocoran data pribadi massal, pelanggaran berat UU PDP. | Bucket Supabase berstatus private; unduhan mewajibkan signed URL berumur pendek (maks 5 menit) via server. | 09, 11 | Belum Diuji |
| **THR-06** | **Injeksi Script Sumber Desain/MCP**: Eksekusi script HTML/JS rusak bawaan Stitch yang meminta kredensial atau manipulasi DOM. | Pencurian token sesi, manipulasi formulir di browser. | Melarang penyalinan mentah JavaScript referensi; seluruh logika dibangun ulang via TypeScript/React murni. | 02 | Belum Diuji |
| **THR-07** | **Injeksi Formula pada Ekspor (CSV Injection)**: Nama anggota/produk diawali `=cmd\|`, `@`, `+`, atau `-` dieksekusi saat dibuka di Microsoft Excel. | Eksekusi perintah jahat pada komputer manajer/pengurus saat membuka rekap. | Sanitasi karakter berbahaya pada generator CSV/XLSX dengan menambahkan tanda kutip tunggal (`'`). | 16 | Belum Diuji |
| **THR-08** | **Serangan CSRF & Pemalsuan Permintaan**: Penyerang memicu mutasi Server Action dari situs luar melalui browser pengguna yang aktif. | Eksekusi mutasi tidak sah tanpa sepengetahuan pengguna. | Next.js Server Actions origin validation otomatis, verifikasi header `Origin`/`Referer`, dan token sesi aman. | 02, 10 | Belum Diuji |
| **THR-09** | **Kebocoran Kunci Rahasia (Secret Leakage)**: `SUPABASE_SERVICE_ROLE_KEY` atau token rahasia terpapar ke repositori Git atau bundle browser. | Akses penuh penyerang ke database tanpa batasan RLS. | Kunci service role hanya di environment server privat; dilarang keras menggunakan prefiks `NEXT_PUBLIC_`. | 02, 09 | Belum Diuji |
| **THR-10** | **Kerusakan Pencadangan Parsial**: Terjadi musibah data; database dipulihkan tetapi dokumen bukti fisik di Storage hilang total. | Koperasi kehilangan arsip legalitas dan bukti sah transaksi. | Prosedur backup menyatukan snapshot database PostgreSQL dan arsip berkas Storage, diuji berkala (*drill*). | 18, 19 | Belum Diuji |
| **THR-11** | **Bypass Konfirmasi Sendiri (Maker-Checker Bypass)**: Bendahara mencairkan kas untuk pengajuannya sendiri tanpa otorisasi kedua. | Penggelapan dana kas koperasi tanpa pengawasan. | Constraint database memeriksa `creator_id != approver_id` pada transaksi di atas batas nominal operasional. | 09, 12, 15 | Belum Diuji |

---

## 3. Matriks Skenario Uji Penetrasi & Validasi Negatif

Setiap modul yang dibangun wajib diuji terhadap skenario penyerangan berikut sebelum rilis:
1. **Uji IDOR URL**: Ubah nomor ID pada endpoint API/Action; pastikan server mengembalikan kode `403 Forbidden` jika di luar hak pengguna.
2. **Uji Penetrasi Anonim**: Panggil endpoint mutasi tanpa header otentikasi; pastikan ditolak `401 Unauthorized`.
3. **Uji Injeksi Karakter Khusus**: Masukkan string SQL (`' OR '1'='1`), XSS script (`<script>`), dan simbol formula Excel ke seluruh kolom input.
4. **Uji Konkurensi Kasir**: Kirim 5 request penyelesaian transaksi kasir secara simultan dengan item stok tersisa 1 zak; pastikan hanya 1 transaksi sukses dan 4 lainnya gagal teratur.
5. **Uji Isolasi Operator Unit**: Operator Gerai Sembako mencoba memutasi stok unit lain; pastikan RLS menolak mutasi secara mutlak.
