-- ==============================================================================
-- SKRIP MASTER: RESET BERSIH & SETUP DATABASE TERBARU (1-KLIK)
-- KOPDES MERAH PUTIH LADANG LAWEH
-- Berkas: supabase/MASTER_RESET_DAN_SETUP_DATABASE.sql
-- 
-- CATATAN PENGGUNAAN:
-- 1. Jalankan skrip ini langsung di SQL Editor Supabase Dashboard Anda.
-- 2. Skrip ini akan menghapus tabel-tabel lama (reset bersih) dan membuat
--    seluruh 6 tabel operasional inti dengan struktur paling mutakhir & teruji.
-- 3. Data awal unit usaha perdana dan profil organisasi akan otomatis terisi.
-- ==============================================================================

RESET ROLE;

BEGIN;

-- ------------------------------------------------------------------------------
-- TAHAP 1: HAPUS TABEL-TABEL LAMA (RESET BERSIH / DROP OLD TABLES)
-- ------------------------------------------------------------------------------
-- Hapus tabel-tabel transaksi rumit warisan lama jika masih tersisa
DROP TABLE IF EXISTS public.pos_transaction_items CASCADE;
DROP TABLE IF EXISTS public.pos_transactions CASCADE;
DROP TABLE IF EXISTS public.cashier_shifts CASCADE;
DROP TABLE IF EXISTS public.goods_receipt_items CASCADE;
DROP TABLE IF EXISTS public.goods_receipts CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.stock_mutations CASCADE;
DROP TABLE IF EXISTS public.stock_opname_items CASCADE;
DROP TABLE IF EXISTS public.stock_opnames CASCADE;
DROP TABLE IF EXISTS public.journal_lines CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;

-- Hapus 6 tabel inti lama untuk memastikan skema benar-benar bersih dan baru
DROP TABLE IF EXISTS public.unit_daily_reports CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.business_units CASCADE;
DROP TABLE IF EXISTS public.organization_profile CASCADE;

-- ------------------------------------------------------------------------------
-- TAHAP 2: PEMBUATAN 6 TABEL OPERASIONAL INTI
-- ------------------------------------------------------------------------------

-- 1. TABEL UNIT USAHA / GERAI KOPERASI (business_units)
CREATE TABLE public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  unit_type VARCHAR(100) NOT NULL DEFAULT 'Sembako & Kebutuhan Pokok',
  status VARCHAR(50) NOT NULL DEFAULT 'rencana', -- 'rencana', 'persiapan', 'aktif', 'ditutup_sementara'
  pic_name VARCHAR(150) NOT NULL DEFAULT 'Abdul Halim',
  phone VARCHAR(50),
  location VARCHAR(200) DEFAULT 'Ladang Laweh',
  monthly_target NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  readiness_percentage INT NOT NULL DEFAULT 0,
  operational_start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL REKAPITULASI PEMANTAUAN GERAI (unit_daily_reports)
CREATE TABLE public.unit_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  operational_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  net_profit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  transaction_count INT NOT NULL DEFAULT 0,
  cash_in_hand NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  operational_notes TEXT,
  source_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_unit_date UNIQUE (unit_id, report_date)
);

-- 3. TABEL MANAJEMEN TUGAS OPERASIONAL (tasks)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  unit_id UUID REFERENCES public.business_units(id) ON DELETE SET NULL,
  pic_name VARCHAR(150) NOT NULL DEFAULT 'Abdul Halim',
  due_date DATE,
  priority VARCHAR(50) NOT NULL DEFAULT 'sedang', -- 'rendah', 'sedang', 'tinggi', 'mendesak'
  status VARCHAR(50) NOT NULL DEFAULT 'belum_mulai', -- 'belum_mulai', 'sedang_proses', 'selesai', 'tertunda'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL BARANG & STOK FISIK (products)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Sembako',
  unit_id UUID REFERENCES public.business_units(id) ON DELETE SET NULL,
  base_unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  min_stock NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABEL DATA ANGGOTA KOPERASI (members)
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number VARCHAR(50) NOT NULL UNIQUE,
  member_no VARCHAR(50),
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  domicile VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'calon', -- 'calon', 'aktif', 'nonaktif'
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABEL PROFIL ORGANISASI & KELEMBAGAAN (organization_profile)
CREATE TABLE public.organization_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name VARCHAR(150) NOT NULL DEFAULT 'Kopdes Merah Putih — Ladang Laweh',
  legal_name VARCHAR(200),
  business_status VARCHAR(50) NOT NULL DEFAULT 'persiapan', -- 'persiapan', 'siap_buka', 'aktif', 'ditutup_sementara'
  manager_name VARCHAR(150) NOT NULL DEFAULT 'Abdul Halim',
  manager_title VARCHAR(100) NOT NULL DEFAULT 'Manajer Koperasi',
  region VARCHAR(150) NOT NULL DEFAULT 'Nagari Ladang Laweh, Kec. Banuhampu, Agam',
  full_address TEXT DEFAULT 'Simpang Tiga Ladang Laweh, Kec. Banuhampu, Kab. Agam, Sumatera Barat',
  fiscal_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  operational_target_date DATE,
  phone VARCHAR(50),
  email VARCHAR(100),
  legal_doc_status VARCHAR(50) NOT NULL DEFAULT 'belum_diunggah', -- 'belum_diunggah', 'dalam_proses', 'terbit'
  npwp_koperasi VARCHAR(50),
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(100),
  bank_account_holder VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TAHAP 3: INDEKS PERFORMA & FUNGSI SINKRONISASI
-- ------------------------------------------------------------------------------
CREATE INDEX idx_reports_unit_date ON public.unit_daily_reports(unit_id, report_date DESC);
CREATE INDEX idx_reports_date ON public.unit_daily_reports(report_date DESC);
CREATE INDEX idx_tasks_status_due ON public.tasks(status, due_date);
CREATE INDEX idx_products_active ON public.products(is_archived, name);
CREATE INDEX idx_members_active ON public.members(is_archived, status);

-- Trigger sinkronisasi nomor anggota (member_number <-> member_no)
CREATE OR REPLACE FUNCTION public.sync_member_number()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.member_number IS DISTINCT FROM OLD.member_number
       AND NEW.member_no IS NOT DISTINCT FROM OLD.member_no THEN
      NEW.member_no := NEW.member_number;
    ELSIF NEW.member_no IS DISTINCT FROM OLD.member_no
       AND NEW.member_number IS NOT DISTINCT FROM OLD.member_number THEN
      NEW.member_number := NEW.member_no;
    END IF;
  END IF;
  NEW.member_number := COALESCE(NEW.member_number, NEW.member_no);
  NEW.member_no := COALESCE(NEW.member_no, NEW.member_number);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_sync_member_number
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.sync_member_number();

-- ------------------------------------------------------------------------------
-- TAHAP 4: DATA AWAL RESMI (SEED DATA)
-- ------------------------------------------------------------------------------

-- Gerai Usaha Perdana
INSERT INTO public.business_units (
  code,
  name,
  unit_type,
  status,
  pic_name,
  location,
  monthly_target,
  readiness_percentage,
  notes
)
VALUES (
  'GERAI-SEMBAKO-01',
  'Gerai Sembako Nagari',
  'Sembako & Kebutuhan Pokok',
  'persiapan',
  'Abdul Halim',
  'Simpang Tiga Ladang Laweh',
  25000000.00,
  45,
  'Unit usaha perdana penyedia kebutuhan pokok warga nagari.'
);

-- Profil Kelembagaan Koperasi
INSERT INTO public.organization_profile (
  display_name,
  legal_name,
  business_status,
  manager_name,
  manager_title,
  region,
  full_address,
  fiscal_year
)
VALUES (
  'Kopdes Merah Putih — Ladang Laweh',
  NULL,
  'persiapan',
  'Abdul Halim',
  'Manajer Koperasi',
  'Nagari Ladang Laweh, Kec. Banuhampu, Agam',
  'Simpang Tiga Ladang Laweh, Kec. Banuhampu, Kab. Agam, Sumatera Barat',
  '2026/2027'
);

-- ------------------------------------------------------------------------------
-- TAHAP 5: ROW LEVEL SECURITY (RLS) & HAK AKSES SISTEM
-- ------------------------------------------------------------------------------
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Pengguna Masuk (authenticated)
CREATE POLICY "Izin baca gerai authenticated" ON public.business_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola gerai authenticated" ON public.business_units FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Izin baca rekap gerai authenticated" ON public.unit_daily_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola rekap gerai authenticated" ON public.unit_daily_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Izin baca tugas authenticated" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola tugas authenticated" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Izin baca produk authenticated" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola produk authenticated" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Izin baca anggota authenticated" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola anggota authenticated" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Izin baca profil organisasi authenticated" ON public.organization_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola profil organisasi authenticated" ON public.organization_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Berikan izin akses penuh ke role authenticated dan service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_units TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_daily_reports TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_profile TO authenticated, service_role;

-- Segarkan cache skema Supabase PostgREST
NOTIFY pgrst, 'reload schema';

COMMIT;
