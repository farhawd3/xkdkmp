-- DRAF UNTUK DITINJAU BAPAK ABDUL HALIM. JANGAN DIJALANKAN OTOMATIS.
-- Fondasi pembukuan berpasangan + antrean impor gerai. Tidak mengubah 7 tabel lama.
-- Kunci API TIDAK disimpan di tabel ini; rahasia tetap di server.
-- Sebelum penerapan: backup, uji pada salinan DB, pilih standar akuntansi bersama akuntan,
-- setujui bagan akun/saldo awal, lalu minta konfirmasi pengguna atas SQL final.

BEGIN;

CREATE TABLE IF NOT EXISTS public.accounting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(30) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT accounting_period_dates CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(16) NOT NULL CHECK (category IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  normal_side VARCHAR(6) NOT NULL CHECK (normal_side IN ('debit', 'credit')),
  parent_id UUID REFERENCES public.accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES public.accounting_periods(id),
  entry_date DATE NOT NULL,
  reference VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  source_kind VARCHAR(30) NOT NULL DEFAULT 'manual',
  source_id UUID,
  reversal_of UUID UNIQUE REFERENCES public.journal_entries(id),
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT journal_posted_timestamp CHECK ((status = 'draft' AND posted_at IS NULL) OR (status = 'posted' AND posted_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  line_no INT NOT NULL CHECK (line_no > 0),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  memo TEXT,
  debit NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit NUMERIC(15,2) NOT NULL DEFAULT 0,
  CONSTRAINT journal_one_side CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)),
  CONSTRAINT journal_line_unique UNIQUE (entry_id, line_no)
);

CREATE OR REPLACE FUNCTION public.kopdes_validate_journal_posting()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE line_count INT; total_debit NUMERIC(15,2); total_credit NUMERIC(15,2); period_state TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'draft' THEN RAISE EXCEPTION 'Jurnal baru harus berstatus draf'; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'posted' THEN RAISE EXCEPTION 'Jurnal dibukukan tidak boleh dihapus; buat jurnal pembalik'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.status = 'posted' THEN RAISE EXCEPTION 'Jurnal dibukukan tidak boleh diubah; buat jurnal pembalik'; END IF;
  IF NEW.status = 'posted' THEN
    SELECT status INTO period_state FROM public.accounting_periods WHERE id = NEW.period_id FOR UPDATE;
    IF period_state IS DISTINCT FROM 'open' THEN RAISE EXCEPTION 'Periode buku tidak terbuka'; END IF;
    IF NEW.entry_date < (SELECT start_date FROM public.accounting_periods WHERE id = NEW.period_id)
       OR NEW.entry_date > (SELECT end_date FROM public.accounting_periods WHERE id = NEW.period_id)
    THEN RAISE EXCEPTION 'Tanggal jurnal di luar periode buku'; END IF;
    SELECT count(*), coalesce(sum(debit),0), coalesce(sum(credit),0)
      INTO line_count, total_debit, total_credit FROM public.journal_lines WHERE entry_id = NEW.id;
    IF line_count < 2 OR total_debit <= 0 OR total_debit <> total_credit
    THEN RAISE EXCEPTION 'Jurnal harus memiliki minimal dua baris dengan debit dan kredit seimbang'; END IF;
    NEW.posted_at := now();
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.kopdes_guard_posted_lines()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE parent_status TEXT;
BEGIN
  SELECT status INTO parent_status FROM public.journal_entries
    WHERE id = CASE WHEN TG_OP = 'INSERT' THEN NEW.entry_id ELSE OLD.entry_id END FOR UPDATE;
  IF parent_status = 'posted' THEN RAISE EXCEPTION 'Baris jurnal dibukukan tidak boleh diubah'; END IF;
  IF TG_OP = 'UPDATE' AND NEW.entry_id <> OLD.entry_id THEN
    RAISE EXCEPTION 'Memindah baris antarjurnal tidak diizinkan';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_kopdes_post_journal ON public.journal_entries;
CREATE TRIGGER trg_kopdes_post_journal BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.kopdes_validate_journal_posting();

DROP TRIGGER IF EXISTS trg_kopdes_guard_lines ON public.journal_lines;
CREATE TRIGGER trg_kopdes_guard_lines BEFORE INSERT OR UPDATE OR DELETE ON public.journal_lines
FOR EACH ROW EXECUTE FUNCTION public.kopdes_guard_posted_lines();

CREATE TABLE IF NOT EXISTS public.unit_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(80) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by_name VARCHAR(150),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.unit_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.unit_import_batches(id) ON DELETE CASCADE,
  external_id VARCHAR(160) NOT NULL,
  unit_id UUID NOT NULL REFERENCES public.business_units(id),
  report_date DATE NOT NULL,
  gross_revenue NUMERIC(15,2) NOT NULL CHECK (gross_revenue >= 0),
  operational_expenses NUMERIC(15,2) NOT NULL CHECK (operational_expenses >= 0),
  cash_reported NUMERIC(15,2) CHECK (cash_reported >= 0),
  status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_report_id UUID REFERENCES public.unit_daily_reports(id),
  CONSTRAINT unit_import_external_unique UNIQUE (batch_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date, id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON public.journal_lines(account_id, entry_id);
CREATE INDEX IF NOT EXISTS idx_unit_import_rows_batch ON public.unit_import_rows(batch_id, status);

ALTER TABLE public.accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_import_rows ENABLE ROW LEVEL SECURITY;

-- Aplikasi pribadi memakai service_role hanya di server. Tidak ada kebijakan untuk anon/authenticated.
REVOKE ALL ON public.accounting_periods, public.accounts, public.journal_entries,
  public.journal_lines, public.unit_import_batches, public.unit_import_rows FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_periods, public.accounts,
  public.journal_entries, public.journal_lines, public.unit_import_batches,
  public.unit_import_rows TO service_role;

COMMIT;
