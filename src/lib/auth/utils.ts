/**
 * Utilitas murni autentikasi yang aman untuk Client Component dan Server Component.
 * Tidak mengimpor next/headers atau modul server-only.
 */

/**
 * Sanitasi pesan kesalahan autentikasi untuk mencegah enumerasi akun (User Enumeration Attack).
 */
export function sanitizeAuthError(errorMessage?: string | null): string {
  if (!errorMessage) {
    return "Terjadi kendala saat memproses permohonan. Silakan coba kembali.";
  }

  const lower = errorMessage.toLowerCase();

  // Pesan Supabase standar yang mengungkap akun
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_grant") ||
    lower.includes("email not found") ||
    lower.includes("user not found") ||
    lower.includes("invalid email or password")
  ) {
    return "Email atau kata sandi tidak sesuai. Silakan periksa kembali.";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Terlalu banyak percobaan masuk. Mohon tunggu beberapa saat sebelum mencoba kembali.";
  }

  if (lower.includes("email not confirmed")) {
    return "Alamat email belum dikonfirmasi. Silakan periksa kotak masuk atau folder spam email Anda.";
  }

  return "Login belum berhasil. Periksa koneksi Supabase dan coba kembali.";
}

/** Hentikan penantian UI jika layanan Auth tidak menyelesaikan permintaan. */
export async function withAuthTimeout<T>(operation: Promise<T>, timeoutMs = 20_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("AUTH_TIMEOUT")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
