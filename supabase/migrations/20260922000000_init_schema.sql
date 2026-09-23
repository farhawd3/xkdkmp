-- Migration: 20260922000000_init_schema.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh
-- Dibuat untuk inisiasi skema database PostgreSQL Supabase
-- Aturan: Default Deny & Row Level Security (RLS) aktif pada seluruh tabel

-- 1. ENUM Peran & Status Bisnis
CREATE TYPE user_role AS ENUM ('admin', 'manajer', 'bendahara', 'pengurus', 'pengawas', 'operator');
CREATE TYPE business_status AS ENUM ('persiapan', 'siap_buka', 'aktif', 'ditutup_sementara');
CREATE TYPE unit_status AS ENUM ('rencana', 'persiapan', 'siap_buka', 'aktif', 'nonaktif');
CREATE TYPE member_status AS ENUM ('calon', 'terverifikasi', 'aktif', 'nonaktif', 'keluar');

-- 2. TABEL PROFIL PENGGUNA (Role tersimpan di DB, bukan di client metadata)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'operator',
  unit_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. TABEL UNIT USAHA
CREATE TABLE IF NOT EXISTS business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  unit_type VARCHAR(100) NOT NULL,
  status unit_status NOT NULL DEFAULT 'rencana',
  pic_name VARCHAR(150) NOT NULL,
  readiness_percentage INT NOT NULL DEFAULT 0,
  operational_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;

-- 4. TABEL CHECKLIST KESIAPAN
CREATE TABLE IF NOT EXISTS preparation_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pic_name VARCHAR(150) NOT NULL,
  target_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE preparation_checklists ENABLE ROW LEVEL SECURITY;

-- Catatan Keamanan: Kebijakan RLS terperinci dan trigger audit log diimplementasikan pada Tahap 04 & 08.
