import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat Supabase Client untuk lingkungan Browser (Client Component).
 * Beroperasi menggunakan token sesi pengguna yang tersimpan di cookie aman.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return dummy client or throw warning in development
    return createBrowserClient(
      supabaseUrl || "https://placeholder-kopdes.supabase.co",
      supabaseAnonKey || "placeholder-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const isSupabaseConfigured = (): boolean => {
  return !!(
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};
