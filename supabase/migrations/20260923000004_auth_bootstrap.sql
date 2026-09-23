-- Migration: 20260923000004_auth_bootstrap.sql
-- Proyek: Kopdes Merah Putih di Ladang Laweh (Tahap 10)
-- Deskripsi: Prosedur bootstrap admin pertama, penautan akun Abdul Halim, dan undangan staf aman.

-- ============================================================================
-- 1. FUNGSI BOOTSTRAP ADMINISTRATOR PERTAMA SECARA SATU KALI (ONE-TIME BOOTSTRAP)
-- ============================================================================
-- Prosedur ini dijalankan via SQL Editor Supabase atau Service Role Script
-- setelah admin mendaftar/diundang pertama kali melalui dashboard Supabase Auth.
CREATE OR REPLACE FUNCTION public.bootstrap_initial_admin(p_admin_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_existing_admin_count INT;
BEGIN
  -- 1. Periksa apakah sudah ada admin aktif di sistem
  SELECT COUNT(*) INTO v_existing_admin_count 
  FROM public.user_roles 
  WHERE role = 'admin' AND is_active = TRUE;

  IF v_existing_admin_count > 0 THEN
    RAISE EXCEPTION 'Prosedur bootstrap ditolak: Sistem sudah memiliki Administrator terdaftar.';
  END IF;

  -- 2. Cari UID pengguna dari tabel auth.users
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = LOWER(TRIM(p_admin_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna dengan email "%" belum terdaftar di Supabase Auth. Buat akun auth terlebih dahulu.', p_admin_email;
  END IF;

  -- 3. Berikan Peran Admin di public.user_roles
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (v_user_id, 'admin', TRUE)
  ON CONFLICT (user_id, role, unit_id) DO UPDATE 
  SET is_active = TRUE;

  -- 4. Catat Audit Log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload)
  VALUES (
    v_user_id, 'BOOTSTRAP_INITIAL_ADMIN', 'user_roles', v_user_id,
    jsonb_build_object('email', p_admin_email, 'assigned_role', 'admin', 'timestamp', NOW())
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Administrator pertama berhasil ditetapkan.',
    'user_id', v_user_id,
    'email', p_admin_email
  );
END;
$$;

-- Bootstrap tidak boleh dapat dipanggil lewat API publik, termasuk oleh pengguna login.
REVOKE ALL ON FUNCTION public.bootstrap_initial_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_initial_admin(TEXT) TO service_role;


-- ============================================================================
-- 2. FUNGSI PENAUTAN AKUN RESMI ABDUL HALIM (MANAJER PERSIAPAN)
-- ============================================================================
-- Menautkan email terverifikasi Abdul Halim dengan hak manajer persiapan.
CREATE OR REPLACE FUNCTION public.link_abdul_halim_profile(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Cari UID pengguna auth
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = LOWER(TRIM(p_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Akun auth untuk email "%" belum ditemukan. Kirim undangan staf terlebih dahulu.', p_email;
  END IF;

  -- Berikan peran 'manajer' persiapan
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (v_user_id, 'manajer', TRUE)
  ON CONFLICT (user_id, role, unit_id) DO UPDATE
  SET is_active = TRUE;

  -- Catat audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload)
  VALUES (
    v_user_id, 'LINK_MANAGER_PROFILE', 'user_roles', v_user_id,
    jsonb_build_object('name', 'Abdul Halim', 'email', p_email, 'role', 'manajer')
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Akun resmi Abdul Halim berhasil ditautkan sebagai Manajer Persiapan.',
    'user_id', v_user_id
  );
END;
$$;

-- Penautan profil resmi hanya boleh dipanggil oleh proses server berwenang.
REVOKE ALL ON FUNCTION public.link_abdul_halim_profile(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_abdul_halim_profile(TEXT) TO service_role;


-- ============================================================================
-- 3. PROSEDUR PEMBERIAN PERAN STAF OLEH ADMINISTRATOR BERWENANG
-- ============================================================================
CREATE OR REPLACE FUNCTION public.rpc_assign_user_role(
  p_target_user_id UUID,
  p_role user_role,
  p_unit_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hanya admin berwenang yang dapat memberikan peran
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Administrator Sistem yang dapat menetapkan peran pengguna.';
  END IF;

  -- Admin teknis tidak otomatis menjadi bendahara tanpa otorisasi terpisah
  IF p_role = 'bendahara' AND NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Penetapan bendahara memerlukan otorisasi administrator penuh.';
  END IF;

  INSERT INTO public.user_roles (user_id, role, unit_id, is_active, created_by)
  VALUES (p_target_user_id, p_role, p_unit_id, TRUE, auth.uid())
  ON CONFLICT (user_id, role, unit_id) DO UPDATE 
  SET is_active = TRUE;

  -- Catat audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload)
  VALUES (
    auth.uid(), 'ASSIGN_USER_ROLE', 'user_roles', p_target_user_id,
    jsonb_build_object('role', p_role, 'unit_id', p_unit_id)
  );

  RETURN jsonb_build_object('status', 'success', 'user_id', p_target_user_id, 'role', p_role);
END;
$$;
