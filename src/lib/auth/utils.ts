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

  return "Email atau kata sandi tidak sesuai. Silakan periksa kembali.";
}
