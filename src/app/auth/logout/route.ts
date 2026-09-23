import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, {
    status: 303, // See Other
  });

  // Bersihkan cookie pratinjau lama dari versi aplikasi sebelumnya.
  response.cookies.delete("kopdes_preview_mode");

  return response;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  // Bersihkan cookie pratinjau lama dari versi aplikasi sebelumnya.
  response.cookies.delete("kopdes_preview_mode");

  return response;
}
