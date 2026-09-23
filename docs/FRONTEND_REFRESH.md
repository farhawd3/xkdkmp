# Pemeriksaan dan penyegaran antarmuka — 22 September 2026

> Arsip checkpoint 08A. Kode telah berubah pada 08B dan belum tervalidasi ulang. Untuk kondisi terkini gunakan [STATUS.md](STATUS.md) dan [HANDOFF_08B.md](HANDOFF_08B.md); hasil tes di dokumen ini bukan bukti kelulusan kode terbaru.

## Hasil checkpoint 08A

Permintaan pengguna: desain fresh, bersih, sederhana, pastel, dark mode lembut, perbaikan menu/fungsi, dan dokumentasi lintas AI. Implementasi memusatkan warna dan komponen agar seluruh halaman mendapat perubahan konsisten tanpa mengganti alur bisnis.

- Palet rose pastel, latar lavender sangat muda, dark mode biru abu. Struktur sidebar dan font tetap.
- Area sentuh tombol bersama dan sidebar minimal 44 px. Header tablet memakai tombol pencarian ringkas; aksi judul turun baris sebelum desktop lebar.
- Sidebar hanya mengaktifkan rute paling spesifik. Pencarian mengambil semua menu dari sumber yang sama, termasuk pemasok dan unit usaha.
- Dialog/drawer memiliki portal, fokus keyboard, Escape, pengembalian fokus, dan penguncian scroll yang tidak dibatalkan oleh modal tertutup.
- Dashboard menghitung anggota dan grafik dari repository sesi; menghapus angka 20 anggota, persentase grafik hardcoded, saldo Rp0 yang diklaim riil, dan tanggal roadmap yang terkesan pasti.
- Notifikasi contoh dihapus, email/ID pengguna rekaan dikosongkan, badge jumlah statis di sidebar dihapus. Banner membedakan status Persiapan dari prototipe berisi contoh sesi.
- Sintaks utilitas Tailwind yang tidak cocok dengan v3 diselaraskan pada halaman terkait.
- README, aturan root, keputusan, desain, dan petunjuk mulai tidak mewajibkan editor/model tertentu.

## Berkas baru

- README.md
- docs/FRONTEND_REFRESH.md
- src/lib/navigation.ts
- src/lib/checklist.ts
- src/lib/useModalFocus.ts
- tests/navigation-dialog.test.tsx

## Berkas diperbarui

- AGENTS.md, MULAI_DI_SINI.txt, package.json, tailwind.config.ts
- docs/STATUS.md, docs/DECISIONS.md, docs/DESIGN_SYSTEM.md
- src/app/globals.css
- src/components/layout/AppShell.tsx, DemoBanner.tsx, Header.tsx, Sidebar.tsx, PageHeader.tsx
- src/components/ui/Alert.tsx, Button.tsx, Card.tsx, Dialog.tsx, Drawer.tsx
- src/lib/constants.ts, src/lib/ThemeContext.tsx
- src/app/dashboard/page.tsx, src/app/persiapan/page.tsx
- Penyesuaian utilitas Tailwind pada src/app/anggota/page.tsx, anggota/[id]/page.tsx, aset/page.tsx, bantuan/page.tsx, keuangan/page.tsx, laporan/page.tsx, pekerjaan/page.tsx, pembelian/page.tsx, pengaturan/page.tsx, penjualan/page.tsx, stok/page.tsx, tata-kelola/page.tsx.

## Temuan yang belum diselesaikan oleh checkpoint desain

1. Repository in-memory masih memuat contoh checklist, agenda, dokumen, pemasok, aset, dan PO. Banner kini menjelaskan contoh sesi; data ini wajib dipisahkan dari lingkungan produksi sebelum integrasi backend.
2. Login, keanggotaan pengguna, role server, Supabase/RLS, storage privat, audit log persisten, backup, dan transaksi atomik belum tersedia sebagai sistem produksi.
3. Perhitungan uang dalam repository prototipe masih memakai number JavaScript. Dilarang menggunakannya untuk pembukuan nyata; implementasikan NUMERIC dan RPC pada tahap backend.
4. Banyak alur modul telah ada di UI, tetapi belum semuanya dibuktikan dengan E2E. Tidak menambah menu kosong seolah fitur sudah selesai.
5. Beberapa teks bisnis lama, contoh dokumen, dan asumsi Bank Nagari masih membutuhkan peninjauan pemilik kebutuhan. Tidak mengesahkan legalitas atau rekening.
6. Playwright dan ESLint belum menjadi pemeriksaan otomatis. Skrip placeholder kini keluar dengan kode gagal agar tidak disalahartikan sebagai kelulusan.
7. Tidak ada metadata Git pada folder audit. Backup/riwayat commit belum dapat diklaim. Referensi historis dan salinan aturan editor lama tidak ditulis ulang; aturan root menjelaskan prioritas keputusan terbaru.
8. Font Google memerlukan jaringan; fallback system-ui tetap tersedia. Tidak ada perubahan dependensi atau layanan berbayar.

## Cara mencoba

1. Jalankan npm.cmd run dev, lalu buka http://localhost:3000.
2. Periksa Dashboard dan ubah mode terang/gelap lewat ikon bulan/matahari.
3. Cari pemasok melalui pencarian header, lalu buka hasilnya.
4. Buka Buku Jurnal; hanya menu Jurnal yang menjadi aktif.
5. Di tablet/ponsel, buka menu geser dan dialog; coba Tab, Shift+Tab, dan Escape.

Hasil pengujian aktual dan batas pemeriksaan browser ada di STATUS.md. Tahap selanjutnya tetap 09: database dan batas akses, diawali pemisahan data contoh.
