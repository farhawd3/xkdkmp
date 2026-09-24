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

  // 2. Rute pembuka kunci akses publik diizinkan tanpa verifikasi awal
  if (pathname.startsWith("/api/unlock")) {
    return NextResponse.next({ request });
  }

  // 3. Verifikasi batas akses privat (loopback, mode public, atau kunci akses sah)
  const access = verifyPrivateAccess(request);
  if (!access.allowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: access.reason || "Akses privat ditolak." },
        { status: access.status || 403 }
      );
    }

    const configuredSecret = process.env.KOPDES_PRIVATE_ACCESS_KEY;
    const authError = request.nextUrl.searchParams.get("auth_error");

    // Jika kunci sudah diatur di Vercel, tampilkan formulir input kunci akses manajer yang elegan
    if (configuredSecret) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Buka Akses Manajer — Kopdes Ladang Laweh</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F7F8FC; color: #1E293B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: white; border-radius: 1.25rem; padding: 2.25rem 2rem; max-width: 440px; width: 100%; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; text-align: center; }
    h1 { font-size: 1.35rem; color: #881337; margin: 0 0 0.5rem 0; font-weight: 700; }
    p { font-size: 0.875rem; line-height: 1.5; color: #475569; margin: 0 0 1.25rem 0; }
    .badge { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.85rem; border-radius: 9999px; background: #FFE4E6; color: #9F1239; margin-bottom: 1rem; }
    .err-box { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; border-radius: 0.75rem; padding: 0.75rem; font-size: 0.8125rem; font-weight: 600; margin-bottom: 1.25rem; }
    .input-group { text-align: left; margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.375rem; color: #334155; }
    input { width: 100%; box-sizing: border-box; height: 48px; border-radius: 0.75rem; border: 1px solid #CBD5E1; padding: 0 1rem; font-size: 0.9375rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    input:focus { border-color: #9F1239; box-shadow: 0 0 0 3px rgba(159, 18, 57, 0.15); }
    button { width: 100%; height: 48px; border-radius: 0.75rem; background: #9F1239; color: white; border: none; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    button:hover { background: #881337; }
    .footer-text { font-size: 0.75rem; color: #94A3B8; margin-top: 1.5rem; margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Aplikasi Pribadi Manajer</div>
    <h1>Buka Akses Aplikasi</h1>
    <p>Masukkan Kunci Akses Manajer untuk mengakses dasbor pemantauan koperasi di perangkat ini.</p>
    ${authError ? `<div class="err-box">${authError}</div>` : ""}
    <form method="POST" action="/api/unlock">
      <div class="input-group">
        <label for="key">Kunci Akses Manajer</label>
        <input id="key" type="password" name="key" required autofocus placeholder="Masukkan kata sandi akses..." autocomplete="current-password" />
      </div>
      <button type="submit">Buka Akses</button>
    </form>
    <p class="footer-text">Kopdes Merah Putih — Ladang Laweh · Akses Privat Manajer</p>
  </div>
</body>
</html>`,
        {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Jika kunci belum diatur di Vercel, berikan instruksi konfigurasi yang jelas
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Konfigurasi Akses — Kopdes Ladang Laweh</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F7F8FC; color: #1E293B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: white; border-radius: 1.25rem; padding: 2.25rem 2rem; max-width: 480px; width: 100%; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; text-align: left; }
    h1 { font-size: 1.25rem; color: #881337; margin: 0 0 0.5rem 0; font-weight: 700; text-align: center; }
    .desc { font-size: 0.875rem; line-height: 1.5; color: #475569; margin: 0 0 1.25rem 0; text-align: center; }
    .badge { display: block; width: fit-content; margin: 0 auto 1rem auto; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.85rem; border-radius: 9999px; background: #FFE4E6; color: #9F1239; }
    .info-box { background: #F1F5F9; border-radius: 0.75rem; padding: 1rem; font-size: 0.8125rem; line-height: 1.6; color: #334155; margin-bottom: 1.25rem; border-left: 4px solid #9F1239; }
    code { background: #E2E8F0; padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.8125rem; }
    .footer-text { font-size: 0.75rem; color: #94A3B8; text-align: center; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Aplikasi Pribadi Manajer</div>
    <h1>Kunci Akses Belum Diatur di Vercel</h1>
    <p class="desc">Aplikasi ini memerlukan kunci akses agar dapat dibuka di server publik.</p>
    <div class="info-box">
      <strong>Cara Membuka Akses di Vercel Dashboard:</strong><br>
      1. Buka <strong>Vercel &rarr; Proyek Anda &rarr; Settings &rarr; Environment Variables</strong>.<br>
      2. Tambahkan variabel baru:<br>
      &bull; <strong>Key:</strong> <code>KOPDES_PRIVATE_ACCESS_KEY</code><br>
      &bull; <strong>Value:</strong> Isi <code>public</code> (jika ingin bisa dibuka langsung dari HP/Tablet/Laptop tanpa password) ATAU isi kata sandi manajer pilihan Anda.<br>
      3. Lakukan <strong>Redeploy</strong> di Vercel.
    </div>
    <p class="footer-text">Kopdes Merah Putih — Ladang Laweh · Menuju Operasional Awal 2027</p>
  </div>
</body>
</html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return NextResponse.next({ request });
}
