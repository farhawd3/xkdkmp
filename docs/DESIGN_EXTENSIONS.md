# SPESIFIKASI DESAIN TAMBAHAN — KOPDES LADANG LAWEH
*(docs/DESIGN_EXTENSIONS.md)*

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Spesifikasi Komponen & Perbandingan Visual Stitch  

Dokumen ini mendefinisikan aturan konstruksi komponen tambahan, struktur HTML/Tailwind baku, serta tabel perbandingan keselarasan antara layar referensi Stitch asli dan komponen tambahan yang dirancang.

---

## 1. Spesifikasi Komponen Tambahan Terstandar

Seluruh komponen tambahan dibangun dengan mewarisi token baku Stitch (Crimson `#BE123C`, font Plus Jakarta Sans, kartu putih, dan bayangan lembut) dengan penyesuaian ergonomi tablet.

### A. Pola Modal Dialog Terstandar (Standard Modal Pattern)
Modal digunakan untuk aksi ringkas hingga menengah (Agenda, Pembayaran Kasir, Otorisasi PO):
```html
<!-- Struktur Modal Standar -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
  <div class="w-full max-w-xl bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <!-- Modal Header -->
    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-slate-900 text-base">Judul Aksi Terarah</h3>
        <p class="text-xs text-slate-500 mt-0.5">Penjelasan ringkas konsekuensi tindakan.</p>
      </div>
      <button class="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
    <!-- Modal Body (Maksimal tinggi layar dengan scroll aman) -->
    <div class="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
      <!-- Formulir isian sesuai standar Zod -->
    </div>
    <!-- Modal Footer -->
    <div class="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
      <button class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 min-h-[44px]">Batal</button>
      <button class="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-crimson-hover text-white text-xs font-bold shadow-sm shadow-rose-500/20 min-h-[44px]">Simpan Tindakan</button>
    </div>
  </div>
</div>
```

---

### B. Pola Formulir Input Ramah Tablet (Touch-Friendly Input)
Mencegah input yang terlalu kecil atau rapat di layar sentuh tablet:
```html
<div class="space-y-1.5">
  <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
    Label Field Isian <span class="text-rose-600">*</span>
  </label>
  <div class="relative">
    <input 
      type="text" 
      class="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container transition-all" 
      placeholder="Ketik keterangan di sini..."
    />
  </div>
  <p class="text-[11px] text-slate-400">Petunjuk pembantu pengisian data.</p>
</div>
```

---

### C. Pola Kartu Ringkasan Kesiapan (Preparation KPI Card)
Menggantikan kartu omzet miliaran semu menjadi metrik kesiapan jujur:
```html
<div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
  <div class="flex items-start justify-between">
    <div>
      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kesiapan Gerai Sembako</span>
      <div class="flex items-baseline gap-2 mt-1">
        <span class="text-2xl font-bold text-slate-900">4 dari 12 Item</span>
        <span class="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">33% Siap</span>
      </div>
    </div>
    <div class="w-10 h-10 rounded-xl bg-crimson-tint text-primary flex items-center justify-center shrink-0">
      <span class="material-symbols-outlined text-[22px]">checklist</span>
    </div>
  </div>
  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
    <span>Target Pembukaan Fisik:</span>
    <span class="font-bold text-slate-800">Awal 2027 (Menunggu Penetapan)</span>
  </div>
</div>
```

---

## 2. Tabel Perbandingan: Desain Asli Stitch vs Desain Tambahan

| Aspek Desain | Desain Asal Stitch (Referensi ZIP) | Rancangan Tambahan (01A Extension) | Manfaat & Resolusi Masalah |
|---|---|---|---|
| **Warna Utama** | Crimson `#BE123C`, dark `#95002A`, latar `#F8FAFC`. | **100% Identik**: Menggunakan palet token yang sama persis tanpa tema baru. | Menjaga identitas visual brand yang sudah disetujui pengguna. |
| **Tipografi** | Plus Jakarta Sans; banyak teks ukuran 10–11 px. | Plus Jakarta Sans; teks utama disesuaikan ke **14–16 px**. | Sangat nyaman dibaca di tablet kasir tanpa memperbesar (*zoom*). |
| **Target Sentuh** | Beberapa tombol aksi berukuran 28–32 px. | Seluruh tombol aksi & input memiliki tinggi minimum **44–48 px**. | Menghilangkan salah sentuh (*mis-click*) pada penggunaan layar sentuh. |
| **Menu Tugas** | Menu ada di sidebar tapi layarnya hilang dari ZIP. | Dibangun halaman modul Tugas terpadu di `/pekerjaan` dengan style kartu identik. | Alur navigasi tidak lagi buntu; tugas manajerial tertampung rapi. |
| **Pendaftaran Anggota**| Form statis cepat mengunci simpanan pokok otomatis. | Form terstruktur dua tahap: Calon Anggota → Penyetoran Kasir Terpisah. | Menjaga integritas akuntansi; tidak mencatat saldo kas tanpa uang riil. |
| **Otorisasi Kasir** | Tombol di kartu gerai hanya memicu `alert()`. | Form modal verifikasi setoran shift kasir dengan rekonsiliasi fisik (*blind count*). | Menutup potensi penggelapan kasir; memastikan kas fisik cocok dengan sistem. |
| **Simulasi SHU** | Label kalkulator tertulis "Siap Dicairkan". | Label diganti tegas menjadi "Estimasi Simulasi Pra-RAT" (Tombol cair nonaktif). | Mencegah tuntutan penarikan uang sebelum keputusan pleno RAT sah. |
| **Form Buat Agenda**| Tidak ada antarmuka form pembuatan agenda di kalender. | Form modal komprehensif (WIB Asia/Jakarta, PIC, lampiran, validasi Zod). | Manajer memiliki alat kerja nyata untuk mengelola jadwal persiapan. |

---

## 3. Catatan Integrasi MCP Stitch

Sesuai arahan teknis:
1. **Status Koneksi**: Pengguna belum memasukkan *Stitch Project ID* spesifik ke percakapan.
2. **Penyimpanan**: Seluruh rancangan layar tambahan disimpan sebagai spesifikasi resmi pada direktori `docs/` lokal.
3. **Integritas Aset**: Tidak ada layar asli Stitch yang ditimpa atau dihapus. Komponen tambahan ini siap dihubungkan atau dibuatkan varian layar saat ID proyek desain aktif dikonfirmasi.
