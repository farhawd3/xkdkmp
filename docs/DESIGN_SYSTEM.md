# DESIGN SYSTEM — KOPDES MERAH PUTIH LADANG LAWEH

**Tanggal Pembaruan**: 23 September 2026  
**Status**: Acuan Desain Baku (Single Source of Design Truth)  

Dokumen ini menyatukan token warna, tipografi, dan aturan tata letak dari kedua spesifikasi Stitch, serta menetapkan panduan ergonomi untuk perangkat tablet, komputer, dan ponsel.

## Penyempurnaan 08B — implementasi berjalan, belum lolos audit visual

- Identitas: rose `#A64768`, latar terang `#F7F8FC`, kartu putih, latar gelap `#1D2533`, kartu gelap `#252F40`, Plus Jakarta Sans, sidebar kiri, sudut lembut. Referensi Crimson lama tidak mengungguli keputusan ini.
- Judul halaman ditempatkan dalam panel bersih dengan gradasi rose sangat tipis. Aksi utama mengikuti lebar layar; tautan “Lanjutkan ke” menghubungkan pekerjaan terkait.
- Kartu ringkasan memakai ikon dalam bidang pastel, judul 14 px, angka sekitar 20–24 px, keterangan terbaca, dan aksi bawah minimal 44 px. Gunakan rose, sky, emerald, amber, dan indigo secukupnya; hindari seluruh layar penuh aksen.
- Dashboard mengutamakan ringkasan nyata dari repository sesi, akses cepat, prioritas persiapan, agenda mendatang, dan kemajuan per kategori. Jangan mengarang angka organisasi atau saldo.
- Bedakan memuat, gagal, belum ada data, dan hasil pencarian kosong. Kegagalan harus menawarkan coba lagi; keadaan kosong menawarkan langkah yang sesuai.
- Bahasa singkat dan mudah dipahami: “Data anggota”, “Mitra pemasok”, “Buku jurnal”. Tombol menjelaskan hasil aksinya. Jangan menyebut tersimpan permanen, aman, terverifikasi, atau otomatis tanpa implementasi.
- Mode gelap harus mempertahankan permukaan biru abu lembut dan kontras teks/aksi. Periksa komponen baru pada tablet, desktop, dan ponsel; tampilan 08B belum dianggap selesai.

Detail berkas dan pekerjaan tertunda: [HANDOFF_08B.md](HANDOFF_08B.md).

---

## 1. Token Warna Baku (Unified Color Palette)

Revisi 22 September 2026: pastel rose dengan permukaan netral; warna aksi tetap cukup gelap agar teks putih terbaca.

| Kategori Token | Nama Token | Nilai Hex | Penggunaan Utama |
|---|---|---|---|
| **Warna Utama** | `primary-container` (Rose lembut) | `#A64768` | Tombol utama, badge aktif, aksen identitas brand. |
| | `primary` (Rose gelap) | `#9B4564` | Header sidebar, elemen aktif kontras tinggi, teks judul primer. |
| | `crimson-hover` | `#8D3A58` | Efek hover pada tombol dan tautan utama. |
| | `crimson-light` | `#FFE4E6` | Latar badge peringatan kritis stok, sorotan baris. |
| | `crimson-tint` | `#FFF1F2` | Latar menu aktif di sidebar, kotak pengumuman lembut. |
| **Permukaan & Latar** | `background` | `#F7F8FC` | Latar belakang seluruh area halaman aplikasi. |
| | `surface-card` | `#FFFFFF` | Latar kartu konten, tabel, dan formulir (putih bersih). |
| | `surface-container-low` | `#F1F5F9` | Latar kotak isian input, baris header tabel. |
| | `surface-container` | `#E2E8F0` | Garis pemisah (*divider*), elemen nonaktif. |
| **Garis Batas (Border)** | `border-subtle` | `#F1F5F9` | Garis pemisah tipis antar-kartu atau baris tabel. |
| | `border-muted` | `#E2E8F0` | Garis tepi kartu utama, garis kotak input formulir. |
| **Teks & Kontras** | `on-surface` (Teks Utama) | `#252F40` | Teks judul, angka saldo, label penting (kontras tajam). |
| | `secondary` (Teks Redup) | `#637189` | Keterangan pembantu, placeholder, teks tanggal. |
| | `on-primary` | `#FFFFFF` | Teks di atas tombol crimson gelap. |
| **Status Sistem** | `status-success-fg` / `bg` | `#059669` / `#ECFDF5` | Transaksi berhasil, anggota aktif, stok aman, SOP dipenuhi. |
| | `status-warning-fg` / `bg` | `#D97706` / `#FEF3C7` | Stok menipis, butuh verifikasi kasir, izin bertingkat. |
| | `status-info-fg` / `bg` | `#0284C7` / `#F0F9FF` | Agenda hari ini, pengumuman umum, informasi non-kritis. |
| | `error` / `error-bg` | `#BA1A1A` / `#FFDAD6` | Stok habis, transaksi gagal, penolakan izin akses. |

---

## 2. Tipografi (Font: Plus Jakarta Sans)

| Tingkatan | Ukuran / Line Height | Bobot | Penggunaan |
|---|---|---|---|
| **Headline XL** | 36px / 44px (Mobile: 28px/36px) | Bold (700) | Judul utama dashboard persiapan dan angka total agregat. |
| **Headline LG** | 24px / 32px (Mobile: 20px/28px) | Bold (700) | Judul halaman modul (misal: "Data Keanggotaan"). |
| **Headline SM** | 18px / 26px | SemiBold (600) | Judul kartu informasi atau judul tabel utama. |
| **Title MD** | 16px / 24px | SemiBold (600) | Subjudul bagian, label grup formulir. |
| **Body LG** | 15px / 24px | Regular (400) | Teks penjelasan panjang, pengantar modul. |
| **Body MD** | 14px / 20px | Regular (400) | **Standar teks umum**: isi tabel, paragraf, deskripsi tugas. |
| **Body SM** | 12px / 18px | Regular (400) | Teks bantuan form, catatan kaki, tanggal mutasi. |
| **Label MD/LG** | 11px–13px / 16–18px | Bold / SemiBold | Label badge status, judul kolom tabel (kapital halus). |

---

## 3. Panduan Ergonomi Perangkat

### A. Tablet (Prioritas Utama — Layar Sentuh)
- **Target Sentuh (*Touch Target*)**: Seluruh tombol, menu navigasi, dan baris aksi memiliki ukuran area sentuh minimum **44–48 px**.
- **Ukuran Teks Minimum**: Teks konten dan formulir utama wajib berukuran **14–16 px** agar tidak melelahkan mata saat tablet dipasang di meja kasir/kantor.
- **Formulir & Dialog**: Menggunakan panel laci samping (*sheet drawer*) atau modal berukuran sedang agar tombol aksi mudah dijangkau oleh ibu jari saat tablet dipegang dengan dua tangan.
- **Dukungan Orientasi**: Tampilan harus berfungsi seimbang pada orientasi Lanskap (*Landscape*) maupun Potret (*Portrait*).

### B. Komputer / Desktop (Prioritas Utama — Kerja Administratif)
- **Sidebar Navigasi**: Lebar tetap 260 px di sebelah kiri dengan pengelompokan menu yang jelas.
- **Bilah Atas (*Topbar*)**: Tinggi 64 px berisi identitas modul, pencarian global, tanggal kalender, dan profil pengguna.
- **Grid Layout**: Menggunakan tata letak kartu berbasis 12 kolom (*12-column grid*) untuk membagi statistik dan tabel secara proporsional.

### C. Ponsel Pintar / Handphone (Responsif & Layak Pakai)
- **Navigasi**: Sidebar otomatis disembunyikan dan diakses melalui tombol menu hamburger di bilah atas.
- **Tabel Data**: Menampilkan kolom-kolom terpenting saja dengan opsi kartu tumpuk (*stacked card view*) atau geser horizontal yang mulus (*smooth horizontal scroll*).
- **Aksi Kasir Cepat**: Tombol simpan dan bayar diletakkan di bagian bawah layar (*bottom action bar*) agar mudah ditekan satu tangan.

---

## 4. Standar Desain Kondisi Antarmuka (*Interface States*)

1. **Kondisi Kosong Jujur (*Empty State*)**:
   - Jika belum ada data (misal: belum ada transaksi belanja atau anggota), sistem menampilkan ilustrasi/ikon netral, teks penjelasan jujur (misal: *"Belum ada transaksi tercatat — mode persiapan operasional"*), dan tombol ajakan bertindak (*Call to Action*).
   - Dilarang keras menampilkan data tiruan atau angka fiktif untuk menutupi kondisi kosong.
2. **Kondisi Memuat (*Loading State*)**:
   - Menggunakan kerangka abu-abu berkilau halus (*skeleton visual loader*) dengan bentuk kartu yang persis sama dengan konten aslinya. Dilarang menggunakan indikator putar (*spinner*) yang menutupi seluruh layar.
3. **Kondisi Eror (*Error State*)**:
   - Menampilkan kotak pemberitahuan berbingkai merah lembut dengan bahasa Indonesia sederhana yang menjelaskan apa yang terjadi dan tombol "Coba Lagi" atau "Hubungi Pengelola".
4. **Kondisi Penolakan Izin (*Permission Denied State*)**:
   - Jika pengguna membuka halaman atau menekan tombol di luar wewenangnya, tampilkan pesan informatif: *"Akses Dibatasi: Tindakan ini memerlukan wewenang Manajer atau Bendahara"*, tanpa menampilkan data yang bersifat rahasia.

## Revisi dark mode dan komponen bersama

- Latar gelap `#1D2533`, kartu `#252F40`, permukaan sekunder/border `#303C50`, teks utama `#F7F8FC`, aksen teks rose `#E9ACC0`.
- Skala slate di Tailwind sengaja disesuaikan agar seluruh modul dan modifier opacity memakai nuansa sama. Jangan menambah override warna per halaman tanpa kebutuhan.
- Tombol bersama termasuk ukuran sm minimal 44 px; sidebar 44 px. Aksi header turun ke baris berikutnya sebelum desktop lebar.
- Kartu metrik menampilkan progressbar hanya jika ada nilai progres valid. Deskripsi metrik tidak dipotong satu baris.
- Dialog dan drawer menggunakan portal, fokus keyboard melingkar, Escape, serta pengembalian fokus. Hormati prefers-reduced-motion.
- Pencarian dan sidebar memakai sumber yang sama melalui src/lib/navigation.ts. Rute terpanjang menentukan menu aktif.
- Pemeriksaan visual checkpoint dicatat di STATUS.md; tidak berarti semua kombinasi halaman/perangkat telah diuji.
