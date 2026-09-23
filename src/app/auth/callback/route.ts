import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectUrl } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const safeNext = sanitizeRedirectUrl(rawNext, "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  // Jika kode gagal ditukar atau kedaluwarsa, alihkan ke login dengan status galat
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent("Tautan verifikasi telah kedaluwarsa atau tidak valid.")}`, request.url)
  );
}
