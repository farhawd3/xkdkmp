-- Migration: 20260923000001_core_schema.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh (Tahap 09)
-- Deskripsi: Skema tabel inti operasional, inventaris, pengadaan, kasir POS, dan akuntansi presisi.
-- Aturan: Kolom moneter wajib NUMERIC(15, 2). Ketiadaan data tiruan di produksi.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TIPE TAMBAHAN
DO $$ BEGIN
  CREATE TYPE po_status AS ENUM ('diajukan', 'disetujui', 'diterima_sebagian', 'selesai', 'ditolak', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE receipt_status AS ENUM ('draft', 'posted', 'batal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE stock_mutation_type AS ENUM ('masuk_po', 'keluar_penjualan', 'penyesuaian_opname', 'retur_penjualan', 'retur_pemasok', 'karantina');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shift_status AS ENUM ('aktif', 'ditutup', 'disetujui');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('tunai', 'transfer_manual', 'qris_manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('aset', 'kewajiban', 'ekuitas', 'pendapatan', 'beban');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE journal_status AS ENUM ('draft', 'posted', 'dibalikkan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. TABEL PERAN PENGGUNA (ROLE DI DATABASE, BUKAN CLIENT METADATA)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT unique_active_user_role UNIQUE (user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role) WHERE is_active = TRUE;

-- 4. TABEL PROFIL ORGANISASI (SATU ORGANISASI TUNGGAL)
CREATE TABLE IF NOT EXISTS public.organization_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name VARCHAR(150) NOT NULL DEFAULT 'Kopdes Merah Putih — Ladang Laweh',
  legal_name VARCHAR(200),
  business_status business_status NOT NULL DEFAULT 'persiapan',
  region VARCHAR(150) NOT NULL DEFAULT 'Nagari Ladang Laweh, Kec. Banuhampu, Agam',
  full_address TEXT,
  fiscal_year VARCHAR(10) NOT NULL DEFAULT '2026/2027',
  operational_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABEL DATA ANGGOTA KOPERASI
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_no VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  masked_nik VARCHAR(20),
  raw_nik_hash VARCHAR(64), -- SHA-256 hash untuk pencegahan NIK duplikat tanpa menyimpan plaintext bagi operator umum
  phone VARCHAR(30) NOT NULL,
  domicile VARCHAR(100) NOT NULL,
  job VARCHAR(100),
  status member_status NOT NULL DEFAULT 'calon',
  simpanan_pokok_paid BOOLEAN NOT NULL DEFAULT FALSE,
  simpanan_wajib_paid BOOLEAN NOT NULL DEFAULT FALSE,
  simpanan_pokok_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  simpanan_wajib_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  document_status VARCHAR(50) NOT NULL DEFAULT 'belum_unggah',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status) WHERE is_archived = FALSE;

-- 6. TABEL REGISTER ASET TETAP FISIK
CREATE TABLE IF NOT EXISTS public.fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  condition VARCHAR(50) NOT NULL DEFAULT 'baik',
  pic_name VARCHAR(150) NOT NULL,
  acquisition_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  purchase_doc_name VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABEL MITRA PEMASOK (DISTRIBUTOR GROSIR)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  supplied_category VARCHAR(100),
  po_history_count INT NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABEL MASTER PRODUK & KATALOG SEMBAKO
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.business_units(id),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  base_unit VARCHAR(30) NOT NULL DEFAULT 'Kg',
  conversion_unit VARCHAR(30),
  conversion_factor INT,
  barcode VARCHAR(50),
  cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- HPP modal komoditas (kolom sensitif)
  selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 10,
  has_expiry BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_non_negative_stock CHECK (current_stock >= 0)
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- 9. TABEL SURAT PESANAN PEMBELIAN (PURCHASE ORDER)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  status po_status NOT NULL DEFAULT 'diajukan',
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  ordered_qty INT NOT NULL CHECK (ordered_qty > 0),
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0.00),
  subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0.00),
  received_qty INT NOT NULL DEFAULT 0 CHECK (received_qty >= 0)
);

-- 10. TABEL PENERIMAAN BARANG FISIK DI GUDANG (GOODS RECEIPT)
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id),
  delivery_note_number VARCHAR(100) NOT NULL,
  received_date DATE NOT NULL,
  status receipt_status NOT NULL DEFAULT 'draft',
  received_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  ordered_qty INT NOT NULL,
  accepted_qty INT NOT NULL CHECK (accepted_qty >= 0),
  damaged_qty INT NOT NULL DEFAULT 0 CHECK (damaged_qty >= 0),
  notes TEXT
);

-- 11. TABEL KARTU MUTASI STOK FISIK (IMUTABEL)
CREATE TABLE IF NOT EXISTS public.stock_mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  mutation_type stock_mutation_type NOT NULL,
  qty INT NOT NULL, -- Positif untuk penambahan stok, negatif untuk pengurangan
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reference_type VARCHAR(50) NOT NULL,
  reference_id UUID,
  reference_number VARCHAR(50),
  actor_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_mutations_product ON public.stock_mutations(product_id, created_at DESC);

-- 12. TABEL USULAN OPNAME FISIK GUDANG
CREATE TABLE IF NOT EXISTS public.stock_opnames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_number VARCHAR(50) NOT NULL UNIQUE,
  opname_date DATE NOT NULL DEFAULT CURRENT_DATE,
  performed_by VARCHAR(150) NOT NULL,
  approved_by VARCHAR(150),
  status VARCHAR(30) NOT NULL DEFAULT 'diajukan',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.stock_opname_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID NOT NULL REFERENCES public.stock_opnames(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  system_qty INT NOT NULL,
  physical_qty INT NOT NULL,
  diff_qty INT NOT NULL,
  reason TEXT NOT NULL
);

-- 13. TABEL SHIFT KASIR POS
CREATE TABLE IF NOT EXISTS public.cashier_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_number VARCHAR(50) NOT NULL UNIQUE,
  cashier_id UUID NOT NULL REFERENCES auth.users(id),
  cashier_name VARCHAR(150) NOT NULL,
  register_number VARCHAR(30) NOT NULL DEFAULT 'REG-01',
  opening_cash NUMERIC(15, 2) NOT NULL CHECK (opening_cash >= 0.00),
  closing_cash_actual NUMERIC(15, 2),
  system_expected_cash NUMERIC(15, 2),
  discrepancy_amount NUMERIC(15, 2),
  discrepancy_reason TEXT,
  status shift_status NOT NULL DEFAULT 'aktif',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 14. TABEL TRANSAKSI PENJUALAN KASIR POS (IMUTABEL SETELAH SELESAI)
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) NOT NULL UNIQUE,
  shift_id UUID NOT NULL REFERENCES public.cashier_shifts(id),
  customer_type VARCHAR(20) NOT NULL DEFAULT 'umum',
  member_id UUID REFERENCES public.members(id),
  payment_method payment_method_type NOT NULL DEFAULT 'tunai',
  subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0.00),
  grand_total NUMERIC(15, 2) NOT NULL CHECK (grand_total >= 0.00),
  cash_received NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  cash_change NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  reference_number VARCHAR(100),
  cashier_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_sku VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0.00),
  cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0.00)
);

-- 15. TABEL BAGAN AKUN AKUNTANSI (CHART OF ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(30) NOT NULL UNIQUE,
  account_name VARCHAR(150) NOT NULL,
  account_type account_type NOT NULL,
  normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'kredit')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. TABEL JURNAL PEMBUKUAN & BARIS JURNAL (IMUTABEL SETELAH POSTED)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_number VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT NOT NULL,
  total_debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  status journal_status NOT NULL DEFAULT 'posted',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_balanced_journal CHECK (total_debit = total_credit)
);

CREATE TABLE IF NOT EXISTS public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_code VARCHAR(30) NOT NULL REFERENCES public.chart_of_accounts(account_code),
  debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (debit >= 0.00),
  credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (credit >= 0.00),
  memo TEXT,
  CONSTRAINT check_debit_or_credit CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- 17. TABEL AUDIT LOG SISTEM (RECORD PERMANEN AKTIVITAS SENSITIF)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  payload JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
