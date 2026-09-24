import { NextResponse, type NextRequest } from "next/server";
import {
  PIN_COOKIE_NAME,
  generateSessionToken,
  getManagerPinData,
  verifyManagerPin,
  updateManagerPin,
  buildWhatsAppResetUrl,
} from "@/lib/security/pin-service";

export async function GET() {
  try {
    const { recoveryPhone } = await getManagerPinData();
    const whatsappUrl = buildWhatsAppResetUrl(recoveryPhone);

    return NextResponse.json({
      hasPin: true,
      recoveryPhone,
      whatsappUrl,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kesalahan sistem.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "verify";

    // 1. Aksi Verifikasi PIN
    if (action === "verify") {
      const pin = String(body.pin || "");
      if (!pin) {
        return NextResponse.json({ error: "PIN wajib diisi." }, { status: 400 });
      }

      const isValid = await verifyManagerPin(pin);
      if (!isValid) {
        return NextResponse.json(
          { error: "PIN salah. Silakan periksa kembali atau konfirmasi via WhatsApp jika lupa." },
          { status: 401 }
        );
      }

      const token = generateSessionToken(pin);
      const response = NextResponse.json({
        success: true,
        message: "PIN berhasil diverifikasi.",
      });

      // Tetapkan cookie sesi berlaku 30 hari
      response.cookies.set(PIN_COOKIE_NAME, token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 hari
        sameSite: "lax",
        httpOnly: false, // dapat diperiksa oleh antarmuka jika diperlukan
      });

      return response;
    }

    // 2. Aksi Ganti PIN
    if (action === "change") {
      const currentPin = String(body.currentPin || "");
      const newPin = String(body.newPin || "");
      const recoveryPhone = body.recoveryPhone ? String(body.recoveryPhone) : undefined;

      if (!currentPin || !newPin) {
        return NextResponse.json(
          { error: "PIN saat ini dan PIN baru wajib diisi." },
          { status: 400 }
        );
      }

      const result = await updateManagerPin(currentPin, newPin, recoveryPhone);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      const token = generateSessionToken(newPin);
      const response = NextResponse.json({
        success: true,
        message: "PIN manajer berhasil diperbarui.",
      });

      response.cookies.set(PIN_COOKIE_NAME, token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: false,
      });

      return response;
    }

    // 3. Aksi Kunci Layar / Logout PIN
    if (action === "lock") {
      const response = NextResponse.json({
        success: true,
        message: "Sesi PIN telah dikunci.",
      });

      response.cookies.delete(PIN_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kesalahan internal server.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
