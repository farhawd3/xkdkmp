# SECURITY CHECKS & VERIFICATION PLAN — KOPDES LADANG LAWEH
*(docs/SECURITY_CHECKS.md)*

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Rencana Kontrol Keamanan (Seluruh Status Awal: `Belum Diuji`)  

Dokumen ini mendefinisikan 10 kategori kontrol keamanan wajib yang harus diimplementasikan dan diuji secara empiris sebelum modul terkait dinyatakan lulus rilis.

---

## 1. Aturan Pengujian & Ketiadaan Klaim Palsu

Sesuai aturan kerja workspace:
- Dokumen ini adalah **rencana kontrol dan skenario uji**, bukan bukti bahwa pengujian telah lulus.
- Seluruh butir pengujian saat ini berstatus **Belum Diuji** karena basis data dan kode aplikasi belum dibangun pada tahap spesifikasi ini.
- Pada tahap implementasi mendatang (Tahap 09–18), setiap butir wajib diperbarui dengan mencantumkan **perintah riil yang dijalankan**, **hasil keluaran aktual**, dan **bukti pengujian**.

---

## 2. Sepuluh Kategori Kontrol Keamanan Wajib

### Kategori 1: Autentikasi & Manajemen Sesi (Tahap 10)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-AUTH-01` | **Nir-Kredensial Default**: Tidak ada akun/kata sandi bawaan atau hardcoded di kode sumber. | Grep riil pada seluruh kode sumber mencari string password. | Nol kemunculan kata sandi/kredensial bawaan. | Belum Diuji |
| `SEC-AUTH-02` | **Respon Otentikasi Bebas Enumerasi**: Pesan login atau reset sandi yang gagal tidak membocorkan apakah email terdaftar atau tidak. | Request login dengan email acak vs email terdaftar. | Respon pesan identik: *"Email atau kata sandi tidak sesuai"*. | Belum Diuji |
| `SEC-AUTH-03` | **Invalidation Sesi Aktif**: Perubahan wewenang peran mencabut izin mutasi secara instan tanpa menunggu kedaluwarsa JWT token lama. | Mutasi data via token lama setelah role di database diturunkan. | Request mutasi ditolak `403 Forbidden` langsung dari server/RLS. | Belum Diuji |
| `SEC-AUTH-04` | **Higienitas Perangkat Bersama**: Auto-logout saat kasir tutup shift dan batas waktu idle 15 menit. | Pengujian timeout browser pada tablet kasir. | Pengguna otomatis dialihkan ke layar `/login` saat waktu idle habis. | Belum Diuji |

---

### Kategori 2: Otorisasi & Batas Hak Akses (Tahap 09, 11)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-AUTHZ-01`| **Default Deny RLS**: Seluruh tabel di PostgreSQL terkunci RLS dan menolak anonim secara mutlak. | Query SQL dari klien tanpa otentikasi. | Seluruh SELECT/INSERT/UPDATE/DELETE mengembalikan 0 baris atau error. | Belum Diuji |
| `SEC-AUTHZ-02`| **Uji Tampering ID / IDOR**: Mengubah ID pada URL atau payload mutasi (misal edit anggota ID lain). | Eksekusi Server Action dengan ID di luar wewenang pengguna. | Server Actions mengembalikan error wewenang ditolak (`403 Forbidden`). | Belum Diuji |
| `SEC-AUTHZ-03`| **Isolasi Multi-Unit Scope**: Kasir Unit Sembako memutasi transaksi atau stok unit lain. | Eksekusi RPC mutasi dengan menyuntikkan `target_unit_id` lain. | Ditolak oleh fungsi PostgreSQL RLS scope unit. | Belum Diuji |
| `SEC-AUTHZ-04`| **Proteksi Mass Assignment Role**: User mengirim payload form registrasi dengan parameter tambahan `role: 'admin'`. | Request HTTP POST dengan field payload manipulatif. | Schema Zod membuang field tidak dikenal; database mengunci kolom role. | Belum Diuji |

---

### Kategori 3: Validasi Masukan & Keluaran (Tahap 02, 04, 06)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-INP-01`  | **Validasi Skema Server Terpadu**: Validasi Zod diterapkan ganda di klien dan Server Action. | Kirim payload HTTP tidak valid langsung ke Server Action. | Server menolak request dengan pesan validasi bahasa Indonesia terstruktur. | Belum Diuji |
| `SEC-INP-02`  | **Parameterized Query**: Seluruh query SQL menggunakan parameter binding, bebas string concatenation. | Uji input karakter `' OR '1'='1` pada pencarian dan form. | Karakter diperlakukan murni sebagai teks; nol eksekusi injeksi SQL. | Belum Diuji |
| `SEC-INP-03`  | **Nir-Raw HTML**: Larangan mutlak menggunakan `dangerouslySetInnerHTML` tanpa sanitasi ketat. | Grep kode sumber mencari pemanggilan raw HTML. | Nol pemanggilan raw HTML tanpa sanitasi library teruji. | Belum Diuji |
| `SEC-INP-04`  | **Proteksi SSRF & URL External**: Validasi allowlist URL protokol `http://` dan `https://` pada link agenda rapat. | Masukkan alamat lokal internal (`http://127.0.0.1`, `http://169.254.169.254`). | Skema validasi menolak URL privat/loopback. | Belum Diuji |

---

### Kategori 4: Keamanan Permintaan & Sesi (Tahap 02, 10)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-REQ-01`  | **Proteksi CSRF Server Action**: Verifikasi otomatis header Origin & Referer pada Next.js App Router. | Kirim request POST lintas domain (*cross-origin request*). | Server Action otomatis menolak request yang tidak berasal dari domain sah. | Belum Diuji |
| `SEC-REQ-02`  | **Pengelolaan Cookie Aman**: Cookie sesi beratribut `HttpOnly`, `Secure`, dan `SameSite=Lax`. | Inspeksi header respon `Set-Cookie` via browser DevTools. | Seluruh atribut keamanan cookie terpasang penuh. | Belum Diuji |

---

### Kategori 5: Pengamanan Transport & Browser (Tahap 19)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-TRN-01`  | **Header Keamanan Standar**: Mengaktifkan `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, dan `Referrer-Policy`. | Uji respons header pada Next.js via curl/browser inspect. | Seluruh header keamanan wajib muncul pada setiap rute. | Belum Diuji |
| `SEC-TRN-02`  | **Cache Control Data Finansial**: Respons data saldo kas, buku simpanan, dan jurnal menggunakan `Cache-Control: no-store, private`. | Periksa header respon endpoint data keuangan. | Data sensitif tidak tersimpan di cache publik browser bersama. | Belum Diuji |

---

### Kategori 6: Pembatasan Beban & Anti-Abuse (Tahap 10, 14)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-ABU-01`  | **Rate Limiting Login & Mutasi**: Batasan percobaan login maksimal 5 kali per menit per IP/akun. | Eksekusi script pengulangan login cepat. | Percobaan ke-6 ditolak dengan kode `429 Too Many Requests`. | Belum Diuji |
| `SEC-ABU-02`  | **Logging Tanpa Data Sensitif**: Log sistem mencatat ID pengguna dan waktu tanpa mencatat sandi, token, atau NIK lengkap. | Inspeksi isi berkas log mutasi. | Nol kata sandi atau data sensitif mentah pada log. | Belum Diuji |

---

### Kategori 7: Keamanan Berkas Dokumen (Tahap 09, 11)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-FIL-01`  | **Private Storage Bucket**: Berkas KTP dan notulen tersimpan di bucket privat Supabase Storage. | Akses URL publik langsung tanpa token otorisasi. | Respon ditolak `403 Forbidden` / `Access Denied`. | Belum Diuji |
| `SEC-FIL-02`  | **Validasi Jenis & Ekstensi File**: Menolak unggahan file executable (`.exe`, `.sh`, `.php`, `.js`, `.bat`). | Unggah file skrip samaran dengan ekstensi terlarang. | Sistem menolak file di sisi server; hanya PDF, JPG, PNG yang diizinkan. | Belum Diuji |
| `SEC-FIL-03`  | **Sanitasi CSV/XLSX Injection**: Karakter `=`, `+`, `-`, `@` pada kolom teks dinetralisir saat ekspor. | Ekspor rekap data anggota yang memuat nama `=SUM(...)`. | Karakter diawali tanda kutip tunggal (`'`) sehingga tidak dieksekusi Excel. | Belum Diuji |

---

### Kategori 8: Integritas Finansial & Akuntansi (Tahap 09, 12, 14)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-FIN-01`  | **Presisi Decimal NUMERIC**: Semua nominal uang menggunakan tipe `NUMERIC(15,2)` di database. | Uji kalkulasi penjumlahan 10.000 transaksi receh berulang. | Nol selisih sen; hasil konsisten dengan matematika presisi. | Belum Diuji |
| `SEC-FIN-02`  | **Keseimbangan Jurnal Mutlak**: Constraint database memeriksa `SUM(debet) = SUM(kredit)`. | Kirim eksekusi jurnal dengan selisih Rp1. | Database membatalkan transaksi dengan pesan constraint error. | Belum Diuji |
| `SEC-FIN-03`  | **Imutabilitas Transaksi Posted**: Record transaksi posted dilarang keras di-update atau di-delete langsung. | Jalankan perintah `UPDATE` / `DELETE` langsung pada tabel posted. | Ditolak mutlak oleh aturan RLS / trigger database. | Belum Diuji |
| `SEC-FIN-04`  | **Anti-Stok Negatif (Negative Inventory Prevention)**: Constraint database melarang kuantitas stok < 0. | Transaksi penjualan dengan kuantitas melebihi stok fisik riil. | Transaksi otomatis dibatalkan (*rollback*) dengan status stok tidak cukup. | Belum Diuji |
| `SEC-FIN-05`  | **Pemisahan Pembuat & Penyetuju (Maker-Checker)**: Pengaju PO atau pencairan beban dilarang menyetujui transaksinya sendiri. | Penyetujuan transaksi di mana `approver_id == creator_id`. | Transaksi ditolak oleh constraint validasi database. | Belum Diuji |

---

### Kategori 9: Kerahasiaan Kunci & Dependensi (Tahap 02, 19)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-SEC-01`  | **Zero Secret in Bundle**: Kunci rahasia `SUPABASE_SERVICE_ROLE_KEY` tidak muncul di bundle browser. | Analisis build output Next.js via browser DevTools/grep build. | Kunci privat tidak terpapar di bundle klien. | Belum Diuji |
| `SEC-SEC-02`  | **Audit Dependensi Bersih**: `npm audit` tidak memiliki temuan celah keamanan berbobot High atau Critical. | Eksekusi `npm audit` di terminal shell. | Nol celah keamanan berstatus High/Critical. | Belum Diuji |

---

### Kategori 10: Ketahanan Operasional & Pemulihan (Tahap 18, 19)
| ID Cek | Rincian Kontrol Keamanan | Metode & Perintah Uji | Kriteria Lulus (Pass Criteria) | Status |
|---|---|---|---|:---:|
| `SEC-OPS-01`  | **Pemisahan Lingkungan Nyata**: Database demo/pengembangan dipisahkan secara fisik dari database produksi. | Verifikasi connection string dan environment variables. | URL dan database produksi independen dari lingkungan uji coba. | Belum Diuji |
| `SEC-OPS-02`  | **Simulasi Pemulihan Bencana (Restore Drill)**: Uji pemulihan data dari snapshot backup database dan file storage. | Simulasi restore data cadangan ke basis data kosong di staging. | 100% data transaksi dan berkas fisik pulih utuh dan konsisten. | Belum Diuji |
