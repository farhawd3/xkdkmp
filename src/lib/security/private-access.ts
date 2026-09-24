import { type NextRequest } from "next/server";
import { PIN_COOKIE_NAME } from "@/lib/security/pin-service";

/**
 * Modul Perlindungan Akses Privat — Kopdes Merah Putih Ladang Laweh.
 * 
 * Memastikan aplikasi pribadi manajer (Abdul Halim) hanya dapat diakses dari
 * lingkungan privat sah (komputer lokal, jaringan LAN Wi-Fi nagari, atau
 * hosting dengan kunci pengaman privat).
 */

const PRIVATE_KEY_ENV = "KOPDES_PRIVATE_ACCESS_KEY";
const ACCESS_COOKIE_NAME = "kopdes_private_access";
const ACCESS_HEADER_NAME = "x-kopdes-access-key";

/**
 * Mengekstrak Host dari header atau URL request secara andal.
 */
export function extractHost(request: Request | NextRequest): string {
  const headerHost =
    request.headers.get("host") || request.headers.get("x-forwarded-host");
  if (headerHost) return headerHost;

  if ("nextUrl" in request && (request as NextRequest).nextUrl?.host) {
    return (request as NextRequest).nextUrl.host;
  }

  try {
    return new URL(request.url).host;
  } catch {
    return "";
  }
}

/**
 * Memeriksa apakah sebuah IP adalah alamat privat (RFC 1918) atau loopback.
 */
export function isPrivateIp(ip: string | null | undefined): boolean {
  if (!ip) return false;

  const cleanIp = ip.trim().replace(/^::ffff:/, ""); // tangani IPv4-mapped IPv6

  // Loopback
  if (
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp === "localhost" ||
    cleanIp === "0.0.0.0"
  ) {
    return true;
  }

  // RFC 1918 IPv4 Private Ranges
  // 10.0.0.0 – 10.255.255.255
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) return true;

  // 172.16.0.0 – 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) return true;

  // 192.168.0.0 – 192.168.255.255 (standar router Wi-Fi lokal)
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) return true;

  // Link-local
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) return true;
  if (/^fe80:/i.test(cleanIp)) return true;

  return false;
}

/**
 * Memeriksa apakah host merupakan loopback lokal komputer.
 */
export function isLoopbackHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const cleanHost = host.trim().toLowerCase().replace(/:\d+$/, "");
  return (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "[::1]"
  );
}

/**
 * Mengekstrak Client IP dari header proxy standar (x-forwarded-for, x-real-ip).
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || null;
}

/**
 * Memeriksa perlindungan Cross-Origin (anti-CSRF) untuk metode mutasi.
 */
export function isSameOriginMutation(request: Request | NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true; // Baca aman, tidak mengubah status
  }

  const host = extractHost(request);
  if (!host) return false;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host.toLowerCase() === host.toLowerCase() && originUrl.protocol === new URL(request.url).protocol;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      return refererHost === host.toLowerCase();
    } catch {
      return false;
    }
  }

  // Jika tidak ada origin dan tidak ada referer pada permintaan API non-GET,
  // tetap izinkan jika client ip / host adalah loopback lokal (misal pengujian / curl)
  return isLoopbackHost(host);
}

export interface AccessVerificationResult {
  allowed: boolean;
  status: number;
  reason?: string;
}

/**
 * Verifikasi batas akses privat untuk Middleware Next.js.
 */
export function verifyPrivateAccess(request: NextRequest): AccessVerificationResult {
  const host = extractHost(request);

  // 1. Loopback lokal (komputer manajer): selalu diizinkan
  if (!process.env.VERCEL && isLoopbackHost(host)) {
    // Validasi CSRF untuk mutasi
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        reason: "Permintaan lintas-origin (CSRF) ditolak demi keamanan data koperasi.",
      };
    }
    return { allowed: true, status: 200 };
  }

  // 2. Sesi PIN Manajer yang Sah
  if (request.cookies.has(PIN_COOKIE_NAME)) {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        reason: "Permintaan lintas-origin (CSRF) ditolak demi keamanan data koperasi.",
      };
    }
    return { allowed: true, status: 200 };
  }

  // 3. Akses publik / remote: periksa kunci akses privat
  const configuredSecret = process.env[PRIVATE_KEY_ENV];
  if (!configuredSecret) {
    return {
      allowed: false,
      status: 403,
      reason:
        "Aplikasi pribadi ini belum dikonfigurasi dengan kunci akses privat di server publik. " +
        "Akses ditolak demi perlindungan integritas data koperasi.",
    };
  }

  // 4. Mode Akses Publik Terbuka: jika diatur ke 'public' atau 'allow-all'
  if (configuredSecret === "public" || configuredSecret === "allow-all") {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        reason: "Permintaan lintas-origin (CSRF) ditolak demi keamanan data koperasi.",
      };
    }
    return { allowed: true, status: 200 };
  }

  // Rahasia tidak diterima melalui URL (riwayat browser/log dapat membocorkannya).
  const providedKey =
    request.headers.get(ACCESS_HEADER_NAME) ||
    request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (providedKey && providedKey === configuredSecret) {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        reason: "Permintaan lintas-origin (CSRF) ditolak demi keamanan data koperasi.",
      };
    }
    return { allowed: true, status: 200 };
  }

  return {
    allowed: false,
    status: 403,
    reason: "Kunci akses privat tidak valid atau belum disertakan.",
  };
}

/**
 * Verifikasi batas akses privat untuk Route Handlers API (/api/*).
 */
export function verifyPrivateApiAccess(request: Request): {
  allowed: boolean;
  error?: string;
  status?: number;
} {
  const host = extractHost(request);

  // 1. Validasi Loopback / LAN privat
  // Header proxy dari klien bukan bukti asal jaringan yang dapat dipercaya.
  const isLocal = !process.env.VERCEL && isLoopbackHost(host);

  if (isLocal) {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        error: "Permintaan mutasi API lintas-domain (CSRF) ditolak.",
      };
    }
    return { allowed: true };
  }

  // 2. Sesi PIN Manajer yang Sah (melalui Cookie header)
  const cookieHeader = request.headers.get("cookie") || "";
  const hasPinSession = Boolean(
    cookieHeader.match(new RegExp(`(?:^|;\\s*)${PIN_COOKIE_NAME}=([^;]*)`))
  );

  if (hasPinSession) {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        error: "Permintaan mutasi API lintas-domain (CSRF) ditolak.",
      };
    }
    return { allowed: true };
  }

  // 3. Akses Publik
  const configuredSecret = process.env[PRIVATE_KEY_ENV];
  if (!configuredSecret) {
    return {
      allowed: false,
      status: 403,
      error:
        "Sesi PIN manajer diperlukan. Silakan masukkan PIN di layar awal.",
    };
  }

  // 4. Mode Akses Publik Terbuka
  if (configuredSecret === "public" || configuredSecret === "allow-all") {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        error: "Permintaan mutasi API lintas-domain (CSRF) ditolak.",
      };
    }
    return { allowed: true };
  }

  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE_NAME}=([^;]*)`)
  );
  let cookieVal: string | null = null;
  try { cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null; } catch { /* Cookie rusak: tolak, bukan error 500. */ }
  const headerVal = request.headers.get(ACCESS_HEADER_NAME);

  if (headerVal === configuredSecret || cookieVal === configuredSecret) {
    if (!isSameOriginMutation(request)) {
      return {
        allowed: false,
        status: 403,
        error: "Permintaan mutasi API lintas-domain (CSRF) ditolak.",
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    status: 403,
    error: "Akses API ditolak: Kunci akses privat tidak valid.",
  };
}
