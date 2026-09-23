import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Membuat Supabase Admin Client dengan Service Role Key.
 * HANYA DIGUNAKAN DI SISI SERVER PRIVAT UNTUK TUGAS ADMINISTRATIF TERBATAS (Bootstrap, Invite Staff).
 * DILARANG DIJALANKAN DARI PERAMBAN ATAU DIEKSPOSE KE NEXT_PUBLIC.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient dilarang dijalankan di lingkungan peramban/klien!");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Kredensial administrasi Supabase belum lengkap. " +
      "Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY terpasang di lingkungan server privat."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
