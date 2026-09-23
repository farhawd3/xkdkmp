import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Cocokkan seluruh rute kecuali:
     * - _next/static (berkas statis Next.js)
     * - _next/image (berkas optimasi gambar)
     * - favicon.ico (ikon favicon)
     * - berkas berekstensi statis (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
