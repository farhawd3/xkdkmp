-- DRAFT / BELUM DISETUJUI / BELUM DIEKSEKUSI.
-- Jangan masukkan ke migrations atau jalankan db push sebelum konfirmasi pengguna.
-- Tujuan: menyelaraskan skema lama yang teramati melalui OpenAPI dengan API sederhana.
-- Tidak menghapus tabel, baris, nomor anggota lama, atau mengubah RLS/GRANT tabel.
-- Buat backup terverifikasi dahulu. Uji di database staging sebelum cloud operasional.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

LOCK TABLE public.members, public.products IN ACCESS EXCLUSIVE MODE;

-- Hentikan jika tipe stok bukan integer (skema lama) atau numeric(12,2) (target).
-- Jangan diam-diam membulatkan data desimal dari skema lain.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
      AND column_name IN ('current_stock', 'min_stock')
      AND NOT (data_type = 'integer' OR
        (data_type = 'numeric' AND numeric_precision = 12 AND numeric_scale = 2))
  ) THEN
    RAISE EXCEPTION 'Tipe stok berbeda dari hasil audit. Tinjau ulang sebelum migrasi.';
  END IF;
END $$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.products ALTER COLUMN current_stock TYPE NUMERIC(12,2)
  USING current_stock::NUMERIC(12,2);
ALTER TABLE public.products ALTER COLUMN min_stock TYPE NUMERIC(12,2)
  USING min_stock::NUMERIC(12,2);

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_number VARCHAR(50);
-- Kolom lama dipertahankan untuk backup/referensi lama, bukan di-rename atau dihapus.
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_no VARCHAR(50);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS domicile VARCHAR(100);

-- Nomor anggota tidak dibuat-buat. Konflik atau nomor hilang membatalkan transaksi.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.members
    WHERE (member_number IS NOT NULL AND member_no IS NOT NULL AND member_number <> member_no)
      OR COALESCE(NULLIF(BTRIM(member_number), ''), NULLIF(BTRIM(member_no), '')) IS NULL
  ) THEN
    RAISE EXCEPTION 'Nomor anggota kosong atau bertentangan. Periksa data; migrasi dibatalkan.';
  END IF;
END $$;

UPDATE public.members SET member_number = member_no WHERE member_number IS NULL;
UPDATE public.members SET member_no = member_number WHERE member_no IS NULL;
ALTER TABLE public.members ALTER COLUMN member_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS members_member_number_unique_v29
  ON public.members(member_number);

-- API sederhana mengizinkan telepon kosong dan tidak meminta domisili.
-- Melepas kewajiban isi, BUKAN menghapus isi telepon/domisiIi yang sudah ada.
ALTER TABLE public.members ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.members ALTER COLUMN domicile DROP NOT NULL;

-- Sinkronkan nama kolom baru/lama. SECURITY INVOKER: tidak menaikkan hak akses.
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
  IF NEW.member_number IS DISTINCT FROM NEW.member_no
     OR NULLIF(BTRIM(NEW.member_number), '') IS NULL THEN
    RAISE EXCEPTION 'Nomor anggota baru dan lama harus sama dan tidak kosong.';
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.sync_member_number_v29() FROM PUBLIC;
-- Jangan menimpa trigger lain: gunakan nama khusus, buat hanya jika belum ada.
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

-- Minta PostgREST membaca ulang daftar kolom setelah transaksi berhasil.
NOTIFY pgrst, 'reload schema';
COMMIT;
