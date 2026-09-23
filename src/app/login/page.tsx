import { redirect } from "next/navigation";

/**
 * Rute login warisan dialihkan langsung ke dashboard karena aplikasi
 * kini beroperasi sebagai aplikasi pribadi manajer tanpa akun login.
 */
export default function LoginPage() {
  redirect("/dashboard");
}
