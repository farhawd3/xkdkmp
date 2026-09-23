import { NextResponse, type NextRequest } from "next/server";
import { verifyPrivateAccess } from "@/lib/security/private-access";

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
 * Melindungi batas akses privat, menolak mutasi CSRF, dan mengalihkan seluruh rute
 * autentikasi warisan ke /dashboard tanpa memerlukan login.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rute autentikasi lama dialihkan langsung ke dashboard agar bookmark lama tidak buntu
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/lupa-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forbidden") ||
    pathname.startsWith("/auth/");

  if (isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Tidak menerima rahasia lewat query URL: dapat bocor melalui history dan log.
  // Akses jarak jauh memerlukan gateway privat yang menyertakan header sah.
  // 2. Verifikasi batas akses privat (loopback atau kunci akses sah)
  const access = verifyPrivateAccess(request);
  if (!access.allowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: access.reason || "Akses privat ditolak." },
        { status: access.status || 403 }
      );
    }

    // Tampilan HTML yang jelas dan informatif untuk akses luar yang ditolak
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Akses Privat Dibatasi — Kopdes Ladang Laweh</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F7F8FC; color: #1E293B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: white; border-radius: 1rem; padding: 2rem; max-width: 480px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; text-align: center; }
    h1 { font-size: 1.25rem; color: #9F1239; margin-bottom: 0.75rem; }
    p { font-size: 0.875rem; line-height: 1.5; color: #475569; margin-bottom: 1.25rem; }
    .badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #FFE4E6; color: #9F1239; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Aplikasi Pribadi Manajer</div>
    <h1>Akses Lingkungan Terbatas</h1>
    <p>${access.reason || "Aplikasi ini beroperasi dalam mode pribadi dan hanya dapat diakses melalui komputer lokal atau jaringan privat resmi koperasi."}</p>
    <p style="font-size: 0.75rem; color: #94A3B8;">Kopdes Merah Putih — Ladang Laweh · Menuju Operasional Awal 2027</p>
  </div>
</body>
</html>`,
      {
        status: access.status || 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return NextResponse.next({ request });
}
