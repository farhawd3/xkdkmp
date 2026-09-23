-- ==============================================================================
-- MIGRASI PENYEDERHANAAN DATABASE — KOPDES MERAH PUTIH LADANG LAWEH
-- Berkas: 20260923000007_clean_simple_schema.sql
-- Tujuan: Menghapus tabel-tabel transaksi rumit yang tidak diperlukan, dan
--         menyediakan 7 tabel inti pemantauan manajemen yang jelas dan sederhana.
-- ==============================================================================

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 1. HAPUS TABEL-TABEL TRANSAKSI RUMIT LAMA YANG TIDAK DIPERLUKAN
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. PENYESUAIAN TABEL GERAI / UNIT USAHA (business_units)
-- Menyimpan profil setiap unit usaha/gerai koperasi (nama, PIC, target omset, dll)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  unit_type VARCHAR(100) NOT NULL DEFAULT 'Sembako & Kebutuhan Pokok',
  status VARCHAR(50) NOT NULL DEFAULT 'rencana',
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

-- Tambahkan kolom jika tabel business_units sudah ada sebelumnya dari init_schema
ALTER TABLE public.business_units ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.business_units ADD COLUMN IF NOT EXISTS location VARCHAR(200) DEFAULT 'Ladang Laweh';
ALTER TABLE public.business_units ADD COLUMN IF NOT EXISTS monthly_target NUMERIC(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.business_units ADD COLUMN IF NOT EXISTS notes TEXT;

-- Masukkan data awal Gerai Sembako Nagari jika belum ada
INSERT INTO public.business_units (code, name, unit_type, status, pic_name, location, monthly_target, readiness_percentage, notes)
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
)
ON CONFLICT (code) DO UPDATE SET
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  monthly_target = EXCLUDED.monthly_target,
  notes = EXCLUDED.notes;

-- ------------------------------------------------------------------------------
-- 3. TABEL REKAPITULASI PEMANTAUAN GERAI (unit_daily_reports)
-- Mencatat omset, pengeluaran, laba kotor, dan kendala operasional harian gerai
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.unit_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.business_units(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  operational_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  net_profit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  transaction_count INT NOT NULL DEFAULT 0,
  cash_in_hand NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  operational_notes TEXT,
  source_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual' (input web) atau 'api' (di masa depan)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_unit_date UNIQUE (unit_id, report_date)
);

-- ------------------------------------------------------------------------------
-- 4. TABEL MANAJEMEN TUGAS OPERASIONAL KOPERASI (tasks)
-- Mengatur pekerjaan, tanggung jawab, prioritas, dan status penyelesaian tugas
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  unit_id UUID REFERENCES public.business_units(id) ON DELETE SET NULL,
  pic_name VARCHAR(150) NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL DEFAULT 'sedang', -- 'rendah', 'sedang', 'tinggi', 'mendesak'
  status VARCHAR(50) NOT NULL DEFAULT 'belum_mulai', -- 'belum_mulai', 'sedang_proses', 'selesai', 'tertunda'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PENYESUAIAN TABEL BARANG & STOK (products)
-- Hanya untuk memantau nama barang, satuan, dan jumlah angka stok fisik
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
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

-- ------------------------------------------------------------------------------
-- 6. PENYESUAIAN TABEL ANGGOTA (members)
-- Hanya untuk memantau data dan jumlah anggota koperasi
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'calon', -- 'calon', 'aktif', 'nonaktif'
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. PENGATURAN HAK AKSES SEDERHANA (Row Level Security)
-- ------------------------------------------------------------------------------
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Cabut kebijakan lama jika ada
DROP POLICY IF EXISTS "Izin baca gerai authenticated" ON public.business_units;
DROP POLICY IF EXISTS "Izin kelola gerai authenticated" ON public.business_units;
DROP POLICY IF EXISTS "Izin baca rekap gerai authenticated" ON public.unit_daily_reports;
DROP POLICY IF EXISTS "Izin kelola rekap gerai authenticated" ON public.unit_daily_reports;
DROP POLICY IF EXISTS "Izin baca tugas authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Izin kelola tugas authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Izin baca produk authenticated" ON public.products;
DROP POLICY IF EXISTS "Izin kelola produk authenticated" ON public.products;
DROP POLICY IF EXISTS "Izin baca anggota authenticated" ON public.members;
DROP POLICY IF EXISTS "Izin kelola anggota authenticated" ON public.members;

-- Berikan izin akses yang jelas untuk pengguna masuk (authenticated)
-- Gerai
CREATE POLICY "Izin baca gerai authenticated" ON public.business_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola gerai authenticated" ON public.business_units FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Rekap Pemantauan Gerai
CREATE POLICY "Izin baca rekap gerai authenticated" ON public.unit_daily_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola rekap gerai authenticated" ON public.unit_daily_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tugas Operasional
CREATE POLICY "Izin baca tugas authenticated" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola tugas authenticated" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Barang & Stok Angka
CREATE POLICY "Izin baca produk authenticated" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola produk authenticated" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anggota
CREATE POLICY "Izin baca anggota authenticated" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Izin kelola anggota authenticated" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Berikan hak akses tabel ke authenticated dan service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_units TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_daily_reports TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated, service_role;
