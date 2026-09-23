-- ==============================================================================
-- PENYELARASAN SKEMA TABEL ANGGOTA & PRODUK STOK
-- Berkas: 20260923000009_align_members_products.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh
-- Tujuan: Menyelaraskan nama kolom dan tipe data pada tabel members dan products
--         agar kompatibel 100% dengan Route Handlers /api/members dan /api/stock-simple.
-- Aman: Tidak menghapus data lama, membungkus dalam transaksi atomik BEGIN ... COMMIT.
-- ==============================================================================

RESET ROLE;

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

LOCK TABLE public.members, public.products IN ACCESS EXCLUSIVE MODE;

-- 1. PENYESUAIAN TABEL PRODUK & STOK (products)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.business_units(id) ON DELETE SET NULL;
ALTER TABLE public.products ALTER COLUMN current_stock TYPE NUMERIC(12,2)
  USING current_stock::NUMERIC(12,2);
ALTER TABLE public.products ALTER COLUMN min_stock TYPE NUMERIC(12,2)
  USING min_stock::NUMERIC(12,2);

-- 2. PENYESUAIAN TABEL ANGGOTA (members)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_number VARCHAR(50);
-- Kolom lama member_no dipertahankan untuk kompatibilitas riwayat/backup
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_no VARCHAR(50);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS domicile VARCHAR(100);

-- Sinkronkan nilai nomor anggota jika salah satu kolom masih kosong
UPDATE public.members SET member_number = member_no WHERE member_number IS NULL AND member_no IS NOT NULL;
UPDATE public.members SET member_no = member_number WHERE member_no IS NULL AND member_number IS NOT NULL;

-- Atur member_number sebagai kolom wajib dan unik
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.members WHERE member_number IS NULL
  ) THEN
    ALTER TABLE public.members ALTER COLUMN member_number SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS members_member_number_unique_v29
  ON public.members(member_number);

-- Lepas batasan NOT NULL pada telepon dan domisili agar pendaftaran warga fleksibel
ALTER TABLE public.members ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.members ALTER COLUMN domicile DROP NOT NULL;

-- 3. PEMBUATAN TRIGGER SINKRONISASI DUA ARAH (member_number <-> member_no)
CREATE OR REPLACE FUNCTION public.sync_member_number_v29()
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

REVOKE ALL ON FUNCTION public.sync_member_number_v29() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.members'::regclass AND tgname = 'sync_member_number_v29'
      AND NOT tgisinternal
  ) THEN
    CREATE TRIGGER sync_member_number_v29
    BEFORE INSERT OR UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.sync_member_number_v29();
  END IF;
END $$;

-- 4. REFRESH SCHEMA CACHE SUPABASE
NOTIFY pgrst, 'reload schema';

COMMIT;
