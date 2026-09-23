-- ==============================================================================
-- MIGRASI TABEL PROFIL ORGANISASI & KELEMBAGAAN KOPERASI
-- Berkas: 20260923000008_organization_profile.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh
-- Tujuan: Menyimpan profil kelembagaan, nama koperasi, domisili wilayah, dan nama
--         pengelola/manajer secara permanen di database Supabase (Tabel ke-7).
-- ==============================================================================

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 1. STRUKTUR TABEL PROFIL ORGANISASI (organization_profile)
-- Hapus tabel lama yang skemanya belum sesuai / usang, lalu buat ulang bersih
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.organization_profile CASCADE;

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
-- 2. DATA AWAL (BARIS DEFAULT KOPERASI)
-- ------------------------------------------------------------------------------
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
-- 3. ROW LEVEL SECURITY (RLS) & HAK AKSES
-- ------------------------------------------------------------------------------
ALTER TABLE public.organization_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izin baca profil organisasi authenticated" ON public.organization_profile;
DROP POLICY IF EXISTS "Izin kelola profil organisasi authenticated" ON public.organization_profile;

CREATE POLICY "Izin baca profil organisasi authenticated" 
  ON public.organization_profile 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Izin kelola profil organisasi authenticated" 
  ON public.organization_profile 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_profile TO authenticated, service_role;
