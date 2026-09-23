# CHANGELOG — Kopdes Merah Putih Ladang Laweh

Catatan perubahan kronologis proyek untuk pelacakan lintas agen AI dan pengembang.

---

## [v2.2.0] — 23 September 2026 (Penyempurnaan Pengalaman Manajer)

### ✅ Ditambahkan
- Komponen `Textarea` bersama dan fondasi kelas formulir terpusat.
- Pilihan tema **Terang**, **Gelap**, dan **Ikuti perangkat** pada halaman Pengaturan; preferensi tersimpan per perangkat.
- Label tanggal agenda berbahasa Indonesia pada panel kalender.
- Rencana pembangunan terperinci, alur kerja manajer, batas implementasi, dan prioritas lanjutan di `docs/HANDOFF.md`.

### 🛠️ Diperbaiki
- Input, dropdown, dan input tanggal dibuat konsisten, lebih lembut, memiliki tinggi 48 px, serta pesan bantuan/galat yang lebih aksesibel.
- Dialog lebih nyaman: panel bawah pada ponsel, panel tengah pada tablet/desktop, header/footer stabil, dan area isi dapat digulir.
- Kalender lebih aman untuk tablet dan ponsel: tombol navigasi 44 px, tab dapat digeser, tujuh kolom tidak dipadatkan berlebihan.
- Form tugas/agenda memakai komponen UI bersama agar lebih rapi dan mudah dirawat.
- Label saldo rekening yang belum diverifikasi tidak lagi menyatakan “Rp 0” sebagai saldo riil.
- Warna tema browser diselaraskan dengan latar terang dan gelap aplikasi.

### 🔍 Diverifikasi
- Audit visual langsung layar login pada desktop dan tablet 768×1024 dalam dark mode.
- `npm.cmd test -- --maxWorkers=1`: 95/95 tes lulus.
- `npm.cmd run typecheck`: lulus tanpa galat.
- Build produksi dicatat setelah verifikasi akhir pada `docs/STATUS.md`.

## [v2.1.0] — 23 September 2026 (Perbaikan & Penguatan Sistem)

### ✅ Ditambahkan
- **Dashboard**: Mini chart tren omset 7 hari terakhir (CSS murni, tanpa library grafik tambahan).
- **Dashboard**: Daftar 5 tugas mendesak/tinggi terbaru langsung di dashboard (bukan hanya angka).
- **Dashboard**: Progress bar kepatuhan pelaporan gerai harian dan daftar nama gerai yang belum lapor hari ini.
- **API Dashboard** (`/api/dashboard/executive`): Endpoint diperkaya — data tren 7 hari (`dailyTrend`), daftar tugas mendesak (`urgentTaskList`), dan gerai belum lapor (`unreportedUnits`).
- **docs/CHANGELOG.md**: File log perubahan baru untuk serah terima antar agen AI.

### 🛠️ Diperbaiki
- Label "Pusat Komando" di `ProductionDashboard.tsx` diganti → "Menu Utama" / "Dashboard Pemantauan Manajer".
- Link mati `/keuangan/jurnal` di halaman bantuan diarahkan ke `/keuangan`.
- Referensi halaman `/pemasok` dan `/aset` di `RelatedPages.tsx` dibersihkan.

### 🧹 Dihapus
- **Halaman**: `/aset` (aset koperasi — prematur), `/pemasok` (mitra pemasok — belum relevan).
- **API**: `/api/catalog` (duplikasi dengan `/api/stock-simple`).
- **Test**: `tests/phase11-catalog.test.ts` (test API catalog yang dihapus).
- **Navigasi**: Grup "Arsip & Referensi" (berisi Mitra Pemasok dan Buku Jurnal) dari sidebar.
- **Dokumen Usang** (10 file): `ACCEPTANCE.md`, `ACCESS_MATRIX.md`, `BUSINESS_RULES.md`, `DESIGN_EXTENSIONS.md`, `INTERACTION_MAP.md`, `PROJECT_BRIEF.md`, `SCOPE.md`, `SECURITY_CHECKS.md`, `THREAT_MODEL.md`, `USER_FLOWS.md`.
- **Folder Referensi Lama**: `references/stitch/`.

### 📝 Diperbarui
- `docs/HANDOFF.md`: Sinkronisasi daftar modul aktual, tabel API endpoint, dan identitas visual.
- `docs/STATUS.md`: Checkpoint terbaru pasca-pembersihan.
- Prompt files: Diperbarui agar lebih profesional dan detail.

---

## [v2.0.0] — 23 September 2026 (Transformasi Sistem)

### ✅ Ditambahkan
- **Kalender Agenda & Event** pada `/pekerjaan` (grid bulanan, navigasi, indikator tugas per tanggal).
- **Modul Keuangan**: Neraca (`/laporan`), Buku Besar (`/keuangan`), Simulasi SHU.
- **Pemantauan Gerai** (`/monitoring`): Form input rekap harian manual.
- **Database**: Migrasi bersih 7 tabel inti (`20260923000007_clean_simple_schema.sql`).

### 🧹 Dihapus
- Seluruh modul kasir POS lama (`/penjualan`, `/pembelian`, `/api/operations`).
- Migrasi database lama (`20260922000000` s.d. `20260923000006`).
- Dokumentasi historis usang dari `docs/`.

### 📝 Diperbarui
- Seluruh navigasi sidebar dibuka penuh (tidak ada lagi dialog "fitur ditunda").
- Penamaan dari "Pusat Komando" → "Menu Utama".
