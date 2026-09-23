# Menghubungkan Supabase — panduan untuk Abdul Halim

Status: **belum ada kredensial `.env.local` yang dikonfirmasi, migrasi cloud belum terbukti berjalan, dan modul operasional belum tersambung.** Panduan ini untuk menyiapkan koneksi login secara bertahap. Jangan masukkan anggota atau transaksi nyata sampai integrasi dan izin database diuji.

## 1. Buat proyek Supabase

Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) dan buat proyek khusus pengembangan. Simpan kata sandi database di pengelola sandi pribadi. Paket dan biaya harus dipilih sesuai keputusan Anda; proyek ini tidak memerlukan upgrade otomatis.

## 2. Isi konfigurasi lokal

Salin `.env.example` menjadi `.env.local` di root proyek. Pada Windows PowerShell: `Copy-Item .env.example .env.local`. Ambil **Project URL** dan **publishable key** dari menu **Connect** atau **Project Settings → API Keys** pada dashboard Supabase. Isi hanya:

```env
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
```

Nama variabel aplikasi masih `ANON_KEY`, tetapi menurut dokumentasi Supabase key publik baru berawalan `sb_publishable_` dapat digunakan sebagai kunci klien. Jangan kirim nilainya melalui chat. `SUPABASE_SERVICE_ROLE_KEY` tetap kosong pada tahap ini; kunci rahasia hanya untuk server berwenang dan belum diperlukan untuk mencoba login biasa. Berkas `.env.local` sudah dikecualikan oleh `.gitignore`. Setelah menyimpan, **hentikan dan jalankan ulang** `npm.cmd run dev`.

**Penting:** `NEXT_PUBLIC_SUPABASE_URL` harus berupa URL dasar proyek, misalnya `https://PROJECT_REF.supabase.co`. Jangan tambahkan `/auth/v1`, `/rest/v1`, atau jalur API lain. Tambahan jalur tersebut membuat permintaan login menuju alamat yang salah.

Jika halaman login tetap menampilkan pesan belum dikonfigurasi, periksa nama variabel, tanda kutip, dan restart server. Jangan memakai nilai contoh sebagai kredensial.

## 3. Siapkan Auth

Di dashboard Supabase, buka **Authentication → URL Configuration**. Untuk pengujian lokal, isi **Site URL** `http://localhost:3000` dan tambahkan redirect URL `http://localhost:3000/auth/callback` serta `http://localhost:3000/reset-password`. Buat akun uji resmi melalui menu pengguna Auth di dashboard. Gunakan email Anda sendiri; jangan menulisnya dalam kode atau chat.

Setelah login berhasil, middleware dapat mengenali sesi. Namun itu **belum berarti akun memiliki peran atau akses modul yang sah**: pembacaan peran dan izin operasi memerlukan skema database, migrasi, dan integrasi Tahap 11. Halaman dashboard/modul saat ini dapat menampilkan galat ketika dua variabel Supabase diisi, karena `SupabaseProductionRepository` masih berupa kerangka yang melempar galat. Jangan menyelesaikannya dengan fallback ke data contoh.

## 4. Database dan peran: pekerjaan lanjutan sebelum data nyata

Migrasi lokal ada di `supabase/migrations/`, termasuk skema, RLS, RPC, dan bootstrap admin. Statusnya **berkas tersedia, belum ada bukti telah dijalankan di proyek cloud**. Migrasi bootstrap terbaru sudah membatasi `bootstrap_initial_admin` dan `link_abdul_halim_profile` agar tidak bisa dipanggil lewat API publik. Seluruh SQL tetap perlu diaudit serta diuji pada proyek pengembangan, termasuk pengujian RLS dengan akun anonim/staf, sebelum dipasang ke proyek produksi.

Setelah audit itu, alur CLI resmi: `supabase login`, `supabase link --project-ref PROJECT_REF`, `supabase db push --dry-run`, tinjau daftar migrasi, lalu `supabase db push` ke proyek pengembangan yang benar. Jangan menjalankan `db reset --linked` pada proyek berisi data, dan jangan menyertakan seed contoh di produksi. Setelah migrasi dan akun resmi dibuat, bootstrap peran hanya lewat sesi SQL/server berwenang; nilai email resmi tidak boleh ditulis sebagai konstanta aplikasi.

## 5. Pemeriksaan yang diharapkan

- Tanpa env: halaman privat mengarah ke login dengan pesan konfigurasi belum lengkap.
- Cookie `kopdes_preview_mode` lama tidak memberi akses; `/auth/preview` tidak tersedia.
- Dengan URL/key publik yang benar: formulir login dapat mencoba Supabase Auth. Akun yang belum dibuat tetap gagal login.
- Modul operasional **belum siap** sampai repository, validasi server, dan otorisasi Tahap 11 benar-benar diimplementasikan dan diuji.

Rujukan resmi: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), dan [alur migrasi CLI](https://supabase.com/docs/guides/local-development/cli-workflows).
