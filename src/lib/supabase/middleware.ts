import { NextResponse, type NextRequest } from "next/server";
import {
  extractHost,
  isLoopbackHost,
  isSameOriginMutation,
} from "@/lib/security/private-access";
import { PIN_COOKIE_NAME } from "@/lib/security/pin-service";

/**
 * Validasi URL pengalihan (Open Redirect Protection).
 * Memastikan URL tujuan pengalihan adalah path lokal relatif yang sah.
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  defaultUrl = "/dashboard"
): string {
  if (!url) return defaultUrl;

  // Tolak jika bukan string
  if (typeof url !== "string") return defaultUrl;

  const trimmed = url.trim();

  // Wajib diawali '/' dan dilarang diawali '//' (protokol independen) atau '/\'
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return defaultUrl;
  }

  // Tolak jika mengandung skema URI seperti 'javascript:', 'data:', 'http:', 'https:'
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }

  return trimmed;
}

/**
 * Middleware Aplikasi Pribadi Manajer — Kopdes Merah Putih Ladang Laweh.
 *
 * Gerbang keamanan PIN Manajer:
 * - Mengarahkan seluruh pengunjung tanpa sesi PIN ke halaman awal /pin.
 * - Mengizinkan akses dashboard dan seluruh fitur operasional setelah PIN diverifikasi.
 * - Menjaga perlindungan mutasi anti-CSRF pada seluruh endpoint API.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rute autentikasi lama dialihkan ke pintu gerbang PIN (/pin)
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/lupa-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forbidden") ||
    pathname.startsWith("/auth/");

  if (isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/pin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Rute pembuka PIN: halaman /pin dan API /api/auth/pin diizinkan langsung
  if (pathname === "/pin" || pathname.startsWith("/api/auth/pin")) {
    const hasPinSession = request.cookies.has(PIN_COOKIE_NAME);
    // Jika sudah memiliki sesi PIN aktif dan membuka /pin, arahkan ke dashboard
    if (pathname === "/pin" && hasPinSession) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next({ request });
  }

  // 3. Pemeriksaan Sesi PIN Akses Manajer
  const hasPinSession = request.cookies.has(PIN_COOKIE_NAME);
  const host = extractHost(request);
  const isLocalDev = !process.env.VERCEL && isLoopbackHost(host);
  const isLegacyKeyAuth = Boolean(
    request.headers.get("x-kopdes-access-key") ||
    request.cookies.get("kopdes_private_access") ||
    process.env.KOPDES_PRIVATE_ACCESS_KEY === "public"
  );

  const isAuthorized = hasPinSession || isLocalDev || isLegacyKeyAuth;

  if (!isAuthorized) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sesi PIN manajer diperlukan. Silakan buka /pin untuk memasukkan PIN." },
        { status: 401 }
      );
    }

    // Untuk kunjungan browser ke halaman mana pun: arahkan ke halaman input PIN!
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/pin";
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Validasi Anti-CSRF untuk permintaan mutasi (POST, PUT, PATCH, DELETE)
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { error: "Permintaan mutasi lintas-domain (CSRF) ditolak demi keamanan data koperasi." },
      { status: 403 }
    );
  }

  return NextResponse.next({ request });
}
