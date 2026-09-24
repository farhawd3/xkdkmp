import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.KOPDES_PRIVATE_ACCESS_KEY;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Kunci akses privat belum dikonfigurasi di Vercel." },
      { status: 403 }
    );
  }

  let key = "";
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    key = body.key || "";
  } else {
    const formData = await request.formData().catch(() => null);
    key = (formData?.get("key") as string) || "";
  }

  const cleanKey = key.trim();
  const cleanSecret = configuredSecret.trim();

  if (cleanKey && cleanKey === cleanSecret) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set("kopdes_private_access", cleanSecret, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // Berlaku 30 hari
      sameSite: "lax",
      httpOnly: false,
    });
    return response;
  }

  // Jika kunci salah, kembali dengan pesan error
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.searchParams.set("auth_error", "Kunci akses salah. Silakan coba lagi.");
  return NextResponse.redirect(redirectUrl, 303);
}

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.KOPDES_PRIVATE_ACCESS_KEY;
  const key = request.nextUrl.searchParams.get("key") || "";

  if (configuredSecret && key.trim() === configuredSecret.trim()) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set("kopdes_private_access", configuredSecret.trim(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      httpOnly: false,
    });
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.searchParams.set("auth_error", "Kunci akses tidak valid.");
  return NextResponse.redirect(redirectUrl, 303);
}
