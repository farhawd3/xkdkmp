# CATATAN PENGGUNAAN SKILL — KOPDES LADANG LAWEH

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Tercatat & Terverifikasi  

Dokumen ini mencatat skill Antigravity yang aktif, referensi skill yang diizinkan, serta verifikasi integritas keamanan sesuai aturan kerja.

---

## 1. Skill Bawaan Antigravity yang Aktif

| Nama Skill | Lokasi Sumber | Fungsi & Tugas dalam Proyek |
|---|---|---|
| **agy-customizations** | `builtin/skills/agy-customizations` | Panduan arsitektur sistem aturan proyek (`.agents/rules/`), siklus hidup, dan mekanisme `trigger: always_on`. |
| **antigravity-guide** | `builtin/skills/antigravity_guide` | Panduan operasional Antigravity IDE, konfigurasi workspace, dan sitemap dokumentasi resmi. |

---

## 2. Status Skill Eksternal (Audit Keamanan)

Sesuai arahan pada Prompt 01A:
- Skill pendukung `ui-ux-pro-max-skill` dan `stitch-skills` dapat digunakan untuk pengayaan interaksi dan aksesibilitas tanpa mengubah identitas tema Stitch.
- **Hasil Pemeriksaan**:
  - Pada lingkungan lokal saat ini, belum terpasang skill pihak ketiga pada direktori `.agents/skills/`.
  - Prinsip kehati-hatian diterapkan: tidak memasang kumpulan skill global tanpa audit kode, tidak menjalankan skrip jarak jauh (*remote script*) yang belum diperiksa, dan tidak mengeklaim penggunaan skill yang belum dibaca.
  - Standar ergonomi aksesibilitas (target sentuh 44–48 px, teks 14–16 px, kontras warna WCAG AA, navigasi ramah tablet) diterapkan langsung ke dalam `docs/DESIGN_SYSTEM.md` dan `docs/DESIGN_EXTENSIONS.md` mengacu pada panduan resmi Stitch dan kaidah desain ramah pemula.
