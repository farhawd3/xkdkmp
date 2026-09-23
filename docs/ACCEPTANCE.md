# ACCEPTANCE CRITERIA — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Tolok Ukur Pengujian dan Penyelesaian Per Tahap  

Dokumen ini menetapkan kriteria kelulusan (*acceptance criteria*) yang wajib dipenuhi dan dibuktikan pada setiap tahap pengerjaan sebelum dapat berpindah ke tahap berikutnya.

---

## 1. Kriteria Penyelesaian Tahap Aktif Saat Ini (Tahap 01)

Tahap 01 (Audit Referensi dan Spesifikasi) dinyatakan **Selesai** apabila:
1. [x] Seluruh 9 berkas `code.html`, 2 berkas dokumen desain, dan aset gambar valid telah diperiksa langsung.
2. [x] Empat berkas PNG rusak (*Anggota, Simpan Pinjam, Kalender, Laporan*) dicatat sebagai referensi tidak tersedia, dan analisisnya mengacu langsung pada kode HTML.
3. [x] Dokumen audit (`docs/AUDIT_STITCH.md`) memetakan temuan P0, P1, P2 beserta solusi dan alokasi tahap perbaikannya.
4. [x] Peta navigasi (`docs/ROUTES.md`) memuat struktur rute maksimal 2 tingkat, pembagian Inventaris menjadi Barang & Stok dan Aset Tetap, serta matriks perizinan peran (*Permission Matrix*).
5. [x] Alur pengguna (`docs/USER_FLOWS.md`) mendefinisikan 8 alur terhubung dan 12 mesin status (*state machines*) entitas bisnis.
6. [x] Desain sistem (`docs/DESIGN_SYSTEM.md`) menyatukan token visual, aturan ergonomi tablet (sentuh 44–48 px, teks 14–16 px), desktop, dan penanganan kondisi antarmuka (*states*).
7. [x] Ruang lingkup (`docs/SCOPE.md`) menegaskan batasan MVP (gerai sembako dinamis, kasir tunai/manual non-tunai, tanpa piutang, tanpa USP aktif, tanpa API berbayar).
8. [x] Daftar 10 keputusan terbuka dipertahankan dan diperbarui.
9. [x] **Dilarang**: Melakukan desain ulang total, memasukkan data transaksi palsu ke produksi, atau membuat skema database pada tahap ini.

---

## 2. Sepuluh Perubahan Terpenting dari Desain Stitch Asli

| No | Komponen Desain Asal | Perubahan yang Ditetapkan | Alasan & Rasional bagi Pemula |
|---|---|---|---|
| **1** | Menu & Script Simpan Pinjam (USP) | **Dinonaktifkan Bawaan (Default Disabled)** | Mencegah risiko hukum dan kredit macet sebelum perizinan resmi dari kementerian/OJK tersedia. |
| **2** | 7 Unit Usaha Terkunci (*Hardcoded*) | **Unit Usaha Dinamis (Gerai Sembako = Rencana)** | Disesuaikan dengan kapasitas riil desa Ladang Laweh yang memulai dari satu gerai sembako. |
| **3** | Pemilih Peran Login Bebas di Klien | **Otorisasi Server Berbasis Database** | Menutup celah keamanan fatal di mana siapa pun bisa mengaku sebagai Manajer atau Pengurus. |
| **4** | Pemisahan Inventaris Campur Aduk | **Pecah Menjadi "Barang & Stok" vs "Aset Tetap"** | Memisahkan barang dagangan (beras, minyak) dari perlengkapan kantor/toko (rak, timbangan, PC kasir). |
| **5** | Menu "Tugas" Hilang di ZIP | **Membangun Modul Tugas Terpadu** | Menyediakan tempat bagi Manajer untuk membagi tugas persiapan dan menampung bukti kerja. |
| **6** | Angka Laporan Keuangan Tidak Sinkron | **Single Source of Truth (Satu Sumber Transaksi)** | Menghapus selisih Rp37 juta dan Rp1 juta dengan menghitung seluruh subtotal otomatis dari transaksi riil. |
| **7** | NIK Terpampang Utuh di Tabel Anggota | **Penyensoran NIK di Server (Masking)** | Mematuhi UU Perlindungan Data Pribadi (UU PDP) agar identitas warga desa tidak disalahgunakan. |
| **8** | Pendaftaran Anggota Mengunci Simpanan | **Pemisahan Pendaftaran vs Setoran Simpanan** | Menjadi anggota tidak otomatis menyetor uang; setoran kas memerlukan bukti transaksi kasir/bank sah. |
| **9** | Status Simulasi SHU "Siap Dicairkan" | **Pemisahan Tegas Simulasi vs Ketetapan RAT** | Simulasi kalkulator tidak boleh dianggap uang siap ambil sebelum disahkan dalam sidang resmi RAT. |
| **10** | Teks dan Tombol Terlalu Kecil | **Standar Ergonomi Layar Sentuh Tablet** | Memperbesar teks ke 14–16 px dan target sentuh ke 44–48 px agar nyaman dioperasikan di tablet meja kasir. |

---

## 3. Matriks Kriteria Penerimaan Tahapan Berikutnya (Roadmap Kualitas)

| No. Tahap | Nama Tahap | Tolok Ukur Kelulusan (Acceptance Criteria) |
|---|---|---|
| **01A** | Semua Aksi & Desain Tambahan | Seluruh aksi pada setiap layar terdata di `docs/INTERACTION_MAP.md` dengan status jelas (*designed / missing / tested*). Tidak ada tombol buntu. |
| **01B** | Desain Keamanan Sejak Awal | Tersedia matriks ancaman keamanan, kontrol RLS, dan skenario uji penetrasi/otorisasi sebelum kode dibuat. |
| **02** | Fondasi & Desain UI | Proyek Next.js berjalan tanpa eror; Tailwind CSS terkonfigurasi dengan palet Crimson Stitch; font Plus Jakarta Sans aktif. |
| **03** | Dashboard Persiapan | Menampilkan checklist persiapan nyata, status persentase kesiapan, dan kondisi kosong jujur tanpa angka miliaran fiktif. |
| **04** | UI Anggota, Unit, & Master | Form anggota dan gerai sembako responsif di tablet dan desktop; validasi form Zod aktif; data terhubung. |
| **05** | UI Pekerjaan & Tata Kelola | Halaman tugas, agenda kalender, dan pengarsipan dokumen AD/ART dapat dioperasikan secara visual. |
| **06** | UI Pembelian, Stok, & Kasir | Alur simulasi kasir POS, stok barang, dan PO pemasok berfungsi mulus di tampilan frontend. |
| **07** | UI Keuangan & Laporan | Tampilan kas, simpanan, jurnal, dan laporan keuangan komparatif bebas dari inkonsistensi kalkulasi. |
| **08** | Pemeriksaan Frontend | Seluruh tombol diuji di tablet dan desktop; nol eror console; tidak ada broken link atau layout tumpang tindih. |
| **09** | Database & Batas Akses | Skema Supabase PostgreSQL terpasang dengan RLS default deny, tipe moneter `NUMERIC`, dan fungsi RPC atomik. |
| **10** | Login & Pengguna Nyata | Autentikasi Supabase nyata berhasil; sesi tersimpan aman; hak akses peran tervalidasi di server. |
| **11–17** | Backend & Akuntansi | Seluruh mutasi kas, stok, pembelian, kasir, dan jurnal tersimpan permanen di database dengan integritas atomik. |
| **18** | Uji Menyeluruh & Pemulihan | Pengujian Vitest & Playwright lulus 100%; uji konkurensi kasir berhasil; simulasi backup-restore terbukti. |
| **19–20** | Deploy & Kesiapan 2027 | Berhasil tayang di Vercel Hobby tanpa biaya; panduan serah terima lengkap untuk Bapak Abdul Halim. |
