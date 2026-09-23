import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Validasi URL pengalihan (Open Redirect Protection).
 * Memastikan URL tujuan pengalihan adalah path lokal relatif yang sah.
 */
export function sanitizeRedirectUrl(url: string | null | undefined, defaultUrl = "/dashboard"): string {
  if (!url) return defaultUrl;
  
  // Tolak jika bukan string
  if (typeof url !== "string") return defaultUrl;

  const trimmed = url.trim();

  // Wajib diawali '/' dan dilarang diawali '//' (protokol independen) atau '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultUrl;
  }

  // Tolak jika mengandung skema URI seperti 'javascript:', 'data:', 'http:', 'https:'
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }

  return trimmed;
}

/**
 * Memperbarui sesi cookie Supabase dan melindungi rute privat.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/lupa-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/");

  // Jika Supabase belum dikonfigurasi, halaman privat tetap memerlukan login.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isAuthRoute && pathname !== "/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("status", "unconfigured");
      redirectUrl.searchParams.set("redirectTo", sanitizeRedirectUrl(pathname));
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validasi user resmi dari server Auth Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Pengguna belum login mencoba membuka rute terproteksi
  if (!user && !isAuthRoute && pathname !== "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", sanitizeRedirectUrl(pathname));
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Pengguna sudah login mencoba membuka halaman login/reset
  if (user && isAuthRoute && !pathname.startsWith("/auth/logout")) {
    const rawRedirect = request.nextUrl.searchParams.get("redirectTo");
    const safeTarget = sanitizeRedirectUrl(rawRedirect, "/dashboard");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = safeTarget;
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
