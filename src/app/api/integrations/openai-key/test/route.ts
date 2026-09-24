import { NextResponse } from "next/server";
import { extractHost, isLoopbackHost, verifyPrivateApiAccess } from "@/lib/security/private-access";
import { getOpenAiKey } from "@/lib/server/openai-key-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = verifyPrivateApiAccess(request);
  if (!access.allowed) return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
  if (process.env.VERCEL || !isLoopbackHost(extractHost(request))) {
    return NextResponse.json({ error: "Uji kunci hanya tersedia dari komputer server lokal." }, { status: 403 });
  }
  const key = getOpenAiKey();
  if (!key) return NextResponse.json({ error: "Masukkan API key terlebih dahulu." }, { status: 409 });
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (response.ok) return NextResponse.json({ connected: true }, { headers: { "Cache-Control": "no-store" } });
    const error = response.status === 401 || response.status === 403
      ? "Kunci tidak diterima oleh OpenAI. Periksa kembali kuncinya."
      : response.status === 429
        ? "Batas permintaan OpenAI tercapai. Coba lagi nanti."
        : "OpenAI belum dapat dihubungi. Coba lagi nanti.";
    return NextResponse.json({ connected: false, error }, { status: 502, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ connected: false, error: "Sambungan ke OpenAI gagal atau terlalu lama." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
