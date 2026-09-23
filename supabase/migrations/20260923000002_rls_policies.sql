-- Migration: 20260923000002_rls_policies.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh (Tahap 09)
-- Deskripsi: Kebijakan Row Level Security (RLS) Default Deny & Imutabilitas Pembukuan
-- Acuan: docs/ACCESS_MATRIX.md dan docs/SECURITY_CHECKS.md

-- 1. FUNGSI PEMBANTU CEK PERAN (ROLE SECURITY DEFINER DI DATABASE)
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = required_role 
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_any_role(required_roles user_role[]) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = ANY(required_roles) 
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. AKTIFKAN ROW LEVEL SECURITY PADA SELURUH TABEL
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opnames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opname_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. KEBIJAKAN: USER ROLES
-- Hanya Admin yang boleh mengelola peran; pengguna boleh melihat perannya sendiri
CREATE POLICY "Pengguna membaca peran sendiri" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin'));

CREATE POLICY "Hanya admin mengelola peran" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role('admin'))
  WITH CHECK (public.has_role('admin'));

-- 4. KEBIJAKAN: ORGANISASI & PROFIL
CREATE POLICY "Profil organisasi dibaca staf terautentikasi" ON public.organization_profile
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Profil organisasi diedit manajer atau admin" ON public.organization_profile
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

-- 5. KEBIJAKAN: DATA ANGGOTA (MEMBERS)
CREATE POLICY "Anggota dibaca staf terautentikasi" ON public.members
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Pendaftaran anggota oleh admin, manajer, atau bendahara" ON public.members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer', 'bendahara']::user_role[]));

CREATE POLICY "Pembaruan anggota oleh admin atau manajer" ON public.members
  FOR UPDATE TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

-- 6. KEBIJAKAN: MITRA PEMASOK & KATALOG PRODUK
CREATE POLICY "Pemasok dan produk dibaca staf terautentikasi" ON public.suppliers
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Pemasok dikelola admin atau manajer" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

CREATE POLICY "Produk dibaca staf terautentikasi" ON public.products
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Katalog produk dikelola admin atau manajer" ON public.products
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]))
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

-- 7. KEBIJAKAN: PENGADAAN (PURCHASE ORDERS & GOODS RECEIPTS)
CREATE POLICY "PO dibaca staf berwenang" ON public.purchase_orders
  FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'bendahara', 'pengawas', 'operator']::user_role[]));

CREATE POLICY "PO dibuat oleh manajer atau operator pengadaan" ON public.purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer', 'operator']::user_role[]));

CREATE POLICY "PO disetujui atau diperbarui manajer atau pengurus" ON public.purchase_orders
  FOR UPDATE TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'pengurus']::user_role[]));

CREATE POLICY "PO items dibaca staf berwenang" ON public.purchase_order_items
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "PO items dikelola pengadaan" ON public.purchase_order_items
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'operator']::user_role[]));

CREATE POLICY "Penerimaan barang dibaca staf berwenang" ON public.goods_receipts
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Penerimaan barang dibuat staf penerima atau manajer" ON public.goods_receipts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'manajer', 'operator']::user_role[]));

CREATE POLICY "Penerimaan barang items dikelola penerima" ON public.goods_receipt_items
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'operator']::user_role[]));

-- 8. KEBIJAKAN IMUTABILITAS: KARTU MUTASI STOK (STOCK MUTATIONS)
CREATE POLICY "Mutasi stok dibaca staf berwenang" ON public.stock_mutations
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Mutasi stok dicatat via RPC atau sistem terautentikasi" ON public.stock_mutations
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- KETENTUAN IMUTABILITAS: DILARANG UPDATE DAN DELETE LANGSUNG PADA MUTASI STOK
CREATE POLICY "Mutasi stok dilarang diedit langsung" ON public.stock_mutations
  FOR UPDATE TO authenticated USING (FALSE);

CREATE POLICY "Mutasi stok dilarang dihapus langsung" ON public.stock_mutations
  FOR DELETE TO authenticated USING (FALSE);

-- 9. KEBIJAKAN: KASIR POS & TRANSAKSI RITEL
CREATE POLICY "Shift kasir dibaca kasir dan manajer" ON public.cashier_shifts
  FOR SELECT TO authenticated
  USING (cashier_id = auth.uid() OR public.has_any_role(ARRAY['admin', 'manajer', 'bendahara', 'pengawas']::user_role[]));

CREATE POLICY "Kasir membuka shift" ON public.cashier_shifts
  FOR INSERT TO authenticated
  WITH CHECK (cashier_id = auth.uid() OR public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

CREATE POLICY "Kasir menutup shift" ON public.cashier_shifts
  FOR UPDATE TO authenticated
  USING (cashier_id = auth.uid() OR public.has_any_role(ARRAY['admin', 'manajer']::user_role[]));

CREATE POLICY "Transaksi POS dibaca kasir dan keuangan" ON public.pos_transactions
  FOR SELECT TO authenticated
  USING (cashier_id = auth.uid() OR public.has_any_role(ARRAY['admin', 'manajer', 'bendahara', 'pengawas']::user_role[]));

CREATE POLICY "Transaksi POS dicatat kasir" ON public.pos_transactions
  FOR INSERT TO authenticated WITH CHECK (cashier_id = auth.uid());

-- KETENTUAN IMUTABILITAS: TRANSAKSI KASIR TIDAK BOLEH DIEDIT ATAU DIHAPUS (KOREKSI VIA RETUR)
CREATE POLICY "Transaksi kasir dilarang diedit langsung" ON public.pos_transactions
  FOR UPDATE TO authenticated USING (FALSE);

CREATE POLICY "Transaksi kasir dilarang dihapus langsung" ON public.pos_transactions
  FOR DELETE TO authenticated USING (FALSE);

CREATE POLICY "Item transaksi kasir dibaca staf" ON public.pos_transaction_items
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Item transaksi kasir dibuat kasir" ON public.pos_transaction_items
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Item transaksi kasir dilarang diedit" ON public.pos_transaction_items
  FOR UPDATE TO authenticated USING (FALSE);

CREATE POLICY "Item transaksi kasir dilarang dihapus" ON public.pos_transaction_items
  FOR DELETE TO authenticated USING (FALSE);

-- 10. KEBIJAKAN IMUTABILITAS: JURNAL PEMBUKUAN (AKUNTANSI KOPERASI)
CREATE POLICY "Bagan akun dibaca staf" ON public.chart_of_accounts
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Bagan akun dikelola bendahara atau admin" ON public.chart_of_accounts
  FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'bendahara']::user_role[]));

CREATE POLICY "Jurnal dibaca keuangan, manajer, dan pengawas" ON public.journal_entries
  FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'bendahara', 'pengawas']::user_role[]));

CREATE POLICY "Jurnal dibuat oleh bendahara atau RPC sistem" ON public.journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'bendahara']::user_role[]));

-- KETENTUAN IMUTABILITAS MUTLAK: JURNAL TIDAK BOLEH DI-UPDATE ATAU DI-DELETE
CREATE POLICY "Jurnal dilarang diedit langsung" ON public.journal_entries
  FOR UPDATE TO authenticated USING (FALSE);

CREATE POLICY "Jurnal dilarang dihapus langsung" ON public.journal_entries
  FOR DELETE TO authenticated USING (FALSE);

CREATE POLICY "Baris jurnal dibaca keuangan dan pengawas" ON public.journal_lines
  FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'manajer', 'bendahara', 'pengawas']::user_role[]));

CREATE POLICY "Baris jurnal dibuat bendahara" ON public.journal_lines
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['admin', 'bendahara']::user_role[]));

CREATE POLICY "Baris jurnal dilarang diedit langsung" ON public.journal_lines
  FOR UPDATE TO authenticated USING (FALSE);

CREATE POLICY "Baris jurnal dilarang dihapus langsung" ON public.journal_lines
  FOR DELETE TO authenticated USING (FALSE);

-- 11. KEBIJAKAN: AUDIT LOG
CREATE POLICY "Audit log dibaca admin dan pengawas" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_any_role(ARRAY['admin', 'pengawas']::user_role[]));

CREATE POLICY "Audit log dicatat oleh sistem terautentikasi" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Audit log dilarang diedit" ON public.audit_logs FOR UPDATE TO authenticated USING (FALSE);
CREATE POLICY "Audit log dilarang dihapus" ON public.audit_logs FOR DELETE TO authenticated USING (FALSE);
