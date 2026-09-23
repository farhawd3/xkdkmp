# ACCESS MATRIX — KOPDES LADANG LAWEH
*(docs/ACCESS_MATRIX.md)*

**Tanggal Pembaruan**: 22 September 2026  
**Status**: Berlaku — Matriks Akses Peran & Otorisasi Server  

Dokumen ini memetakan setiap aksi operasional kritis ke dalam batas wewenang peran, cakupan unit usaha, kolom data yang diizinkan, prasyarat status bisnis, endpoint/RPC yang mengeksekusi, serta skenario pengujian izin diterima (*allowed*) dan ditolak (*denied*).

---

## 1. Aturan Dasar Wewenang Peran

1. **Bukan Kuasa Mutlak**: Tidak ada satu pun peran (termasuk Admin Sistem, Pengurus, maupun Manajer Bpk. Abdul Halim) yang memiliki wewenang tanpa batas (*no absolute superuser*).
2. **Larangan Angkat Peran Mandiri**: Pengguna dilarang mengubah perannya sendiri di sistem. Perubahan wewenang harus dilakukan oleh Admin dan diaudit secara permanen.
3. **Pemisahan Unit (Multi-Unit Scope)**: Operator yang ditugaskan pada satu unit usaha (misal Gerai Sembako) tidak memiliki wewenang memutasi stok, shift, atau transaksi pada unit usaha lain.
4. **Perlindungan Kolom Sensitif (Field-Level Security)**: NIK warga disamarkan di level database/query bagi operator dan pengawas. HPP modal barang dagangan disembunyikan dari layar kasir kasir harian.

---

## 2. Matriks Otorisasi Aksi Kritis & Endpoint

| ID Aksi | Peran Berizin | Scope Unit & Objek | Kolom Boleh Dibaca / Diubah | Prasyarat Status | Endpoint / SQL RPC | Skenario Uji Allowed | Skenario Uji Denied |
|---|---|---|---|---|---|---|---|
| `ACT-AUTH-01` | Publik / Tamu | Global | `email`, `password` | Akun aktif & terverifikasi | `auth.signInWithPassword` | Login email/sandi valid | Sandi salah atau akun dinonaktifkan (401) |
| `ACT-MBR-03` | Admin, Manajer | Global | Tulis: `name`, `nik`, `phone`, `address` | Dokumen pendaftaran lengkap | `action_register_member` | Manajer input calon anggota baru | Kasir unit mencoba tambah anggota (403) |
| `ACT-MBR-05` | Manajer, Bendahara, Pengawas | Global | Baca: `saving_type`, `amount`, `date` | Anggota terdaftar | `action_get_member_savings` | Bendahara buka buku simpanan | Operator gudang buka buku simpanan (403) |
| `ACT-MBR-06` | Bendahara | Global | Tulis: `savings_ledger` (debit kas, kredit simpanan) | Bukti setoran kas/bank sah | `rpc_deposit_member_savings` | Bendahara input setoran simpanan pokok | Manajer input setoran sendiri tanpa peran bendahara (403) |
| `ACT-UNT-01` | Admin, Pengurus | Global | Tulis: `name`, `type`, `pic_id` (status default `Rencana`) | Keputusan rapat pengurus | `action_propose_business_unit` | Pengurus buat usulan unit sembako | Operator kasir buat unit baru (403) |
| `ACT-STK-01` | Admin, Manajer | Unit Terkait | Tulis: `sku`, `name`, `unit_id`, `price`, `buffer` | SKU belum pernah dipakai | `action_create_product` | Manajer buat komoditas sembako baru | SKU duplikat atau kasir buat barang (403) |
| `ACT-PUR-01` | Manajer, Petugas Gudang | Unit Terkait | Tulis: `supplier_id`, `items`, `qty` (status default `Draft`) | Pemasok aktif | `action_create_purchase_order` | Gudang buat pengajuan PO | Pelanggan/anonim memanggil endpoint PO (401) |
| `ACT-PUR-02` | Manajer, Pengurus | Unit Terkait | Ubah: `status` menjadi `Disetujui`, `approved_by` | PO berstatus `Draft`, creator != approver | `rpc_approve_purchase_order` | Manajer menyetujui PO staf gudang | Staf gudang mencoba menyetujui PO buatannya sendiri (403) |
| `ACT-PUR-04` | Petugas Gudang | Unit Terkait | Ubah: `received_qty`, tambah `stock_cards` | PO berstatus `Disetujui` | `rpc_receive_goods_shipment` | Gudang verifikasi fisik penerimaan | Penerimaan tanpa dokumen PO sah (403) |
| `ACT-PUR-06` | Bendahara | Global | Tulis: `payment_record`, kurangi `cash_balance` | Tagihan berstatus `Terverifikasi` | `rpc_pay_supplier_invoice` | Bendahara melunasi utang tagihan | Gudang membayar tagihan tanpa otorisasi bendahara (403) |
| `ACT-POS-01` | Kasir Unit | Unit Tugas | Tulis: `cashier_shifts` (`opening_cash`, `opened_at`) | Unit usaha berstatus `Aktif` | `rpc_open_cashier_shift` | Kasir buka shift dengan modal awal | Buka shift pada unit berstatus `Rencana` / `Persiapan` (403) |
| `ACT-POS-05` | Kasir Unit | Unit Tugas | Tulis: `sales`, `stock_deduction`, `journal` | Shift aktif, stok fisik >= qty belanja | `rpc_process_pos_sale` | Kasir proses bayar tunai/non-tunai | Stok tidak mencukupi atau shift sudah ditutup (400/403) |
| `ACT-POS-07` | Kasir & Manajer | Unit Tugas | Tulis: `returns`, pembalikan jurnal pendapatan | Nomor struk asal sah & verified | `rpc_process_sales_return` | Manajer beri otorisasi retur struk sah | Kasir retur tanpa persetujuan manajer (403) |
| `ACT-POS-08` | Kasir & Bendahara | Unit Tugas | Tulis: `closing_cash_actual`, `discrepancy_note` | Shift aktif pada hari berjalan | `rpc_close_cashier_shift` | Kasir tutup shift dengan blind count | Mengubah angka kas fisik setelah shift ditutup (403) |
| `ACT-FIN-01` | Bendahara | Global | Tulis: `expenses`, kredit kas, debet beban | Bukti transaksi pengeluaran sah | `rpc_record_operational_expense` | Bendahara mencatat beban listrik/notaris | Kasir toko mencatat beban operasional (403) |
| `ACT-FIN-03` | Bendahara | Global | Tulis: `journal_entries` (Total Debit = Total Kredit) | Periode akuntansi belum ditutup | `rpc_create_balanced_journal` | Jurnal seimbang Debit Rp500rb = Kredit Rp500rb | Jurnal tidak seimbang Debit Rp500rb != Kredit Rp400rb (400) |
| `ACT-FIN-04` | Bendahara | Global | Tulis: `journal_reversals` (referensi jurnal asal) | Jurnal asal berstatus `Posted` | `rpc_reverse_posted_journal` | Koreksi kesalahan via reversal entry | Mengedit atau menghapus record jurnal posted langsung (403) |
| `ACT-FIN-08` | Pengurus (Pleno) | Global | Ubah: status SHU menjadi `Disahkan RAT` | Berita Acara Rapat Anggota Tahunan sah | `action_ratify_shu_distribution` | Pengurus sahkan pembagian SHU pasca-RAT | Manajer mencairkan SHU saat status masih Simulasi (403) |
| `ACT-SET-02` | Admin | Global | Tulis: `users`, `user_roles` (role database) | Akun belum terdaftar | `action_create_user_account` | Admin daftarkan kasir & beri peran kasir | Pengguna biasa mengangkat dirinya jadi Manajer (403) |

---

## 3. Matriks Hak Akses Kolom Sensitif (Field-Level Permissions)

| Tabel / Objek Data | Kolom Sensitif | Hak Akses Admin / Manajer | Hak Akses Bendahara | Hak Akses Operator (Kasir/Gudang) | Hak Akses Pengawas (Auditor) |
|---|---|:---:|:---:|:---:|:---:|
| `members` | `nik` (16 Digit KTP) | Baca Utuh / Edit | Baca Utuh | **Disensor (`3372********0001`)** | **Disensor (`3372********0001`)** |
| `products` | `cost_price` (HPP Modal) | Baca Utuh / Edit | Baca Utuh | **Disembunyikan (Nilai `null`)** | Baca Utuh (*Read-Only*) |
| `suppliers` | `bank_account_number` | Baca Utuh / Edit | Baca Utuh / Bayar | **Disembunyikan (Nilai `null`)** | Baca Utuh (*Read-Only*) |
| `audit_logs` | Seluruh Baris Audit | Baca Utuh | Tolak Akses | Tolak Akses | Baca Utuh (*Read-Only*) |
| `cashier_shifts` | `expected_cash_system` | Baca Hasil Rekon | Baca Hasil Rekon | **Disembunyikan saat hitung fisik** | Baca Hasil Rekon |

---

## 4. Penegakan Otorisasi Sisi Database (PostgreSQL RLS Rule)

Setiap tabel di Supabase diwajibkan memiliki fungsi pembantu (*helper function*) di database:
```sql
-- Memeriksa peran pengguna aktif langsung dari tabel database (bukan user_metadata)
CREATE FUNCTION auth.has_role(required_role text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = required_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
Kebijakan RLS pada tabel sensitif (contoh `journal_entries`):
```sql
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Hanya Bendahara, Manajer, dan Pengawas yang boleh membaca jurnal
CREATE POLICY "Jurnal dibaca oleh keuangan dan pengawas" ON public.journal_entries
  FOR SELECT USING (auth.has_role('bendahara') OR auth.has_role('manajer') OR auth.has_role('pengawas'));

-- Hanya Bendahara yang boleh memasukkan jurnal baru
CREATE POLICY "Jurnal dibuat oleh bendahara" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.has_role('bendahara'));

-- Dilarang update dan delete untuk menjamin imutabilitas
CREATE POLICY "Jurnal dilarang diedit" ON public.journal_entries FOR UPDATE USING (false);
CREATE POLICY "Jurnal dilarang dihapus" ON public.journal_entries FOR DELETE USING (false);
```
