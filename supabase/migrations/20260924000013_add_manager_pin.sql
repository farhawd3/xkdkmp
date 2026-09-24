-- ==============================================================================
-- PENAMBAHAN FITUR PIN MANAJER & PEMULIHAN WHATSAPP
-- Berkas: supabase/migrations/20260924000013_add_manager_pin.sql
-- ==============================================================================

RESET ROLE;

BEGIN;

ALTER TABLE public.organization_profile 
  ADD COLUMN IF NOT EXISTS manager_pin VARCHAR(20) NOT NULL DEFAULT '1234';

ALTER TABLE public.organization_profile 
  ADD COLUMN IF NOT EXISTS recovery_phone VARCHAR(50) DEFAULT '081267890123';

UPDATE public.organization_profile 
SET manager_pin = '1234' 
WHERE manager_pin IS NULL;

NOTIFY pgrst, 'reload schema';

COMMIT;
