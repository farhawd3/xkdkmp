import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "./admin";

/**
 * Membuat Supabase Client untuk lingkungan Server (Server Components, Route Handlers).
 * Dalam aplikasi pribadi manajer, operasi server menggunakan koneksi server privat
 * terproteksi dengan Service Role Key tanpa mengekspos kunci ke browser.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika kredensial server lengkap, gunakan klien server privat
  if (supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // Fallback jika dipanggil di luar konteks request Next.js (misal dalam unit test)
    cookieStore = null;
  }

  return createServerClient(
    supabaseUrl || "https://placeholder-kopdes.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (!cookieStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Abaikan jika dipanggil dari Server Component murni
          }
        },
      },
    }
  );
}
