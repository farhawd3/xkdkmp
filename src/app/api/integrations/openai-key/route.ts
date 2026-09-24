import { NextResponse } from "next/server";
import { z } from "zod";
import { extractHost, isLoopbackHost, verifyPrivateApiAccess } from "@/lib/security/private-access";
import { clearTemporaryOpenAiKey, getOpenAiKeyStatus, setTemporaryOpenAiKey } from "@/lib/server/openai-key-store";

export const runtime = "nodejs";

const KeySchema = z.object({ apiKey: z.string().trim().min(20).max(512).regex(/^sk-[A-Za-z0-9_-]+$/, "Format API key OpenAI tidak sesuai.") });
const noStore = { "Cache-Control": "no-store" };

function rejectIfUnavailable(request: Request) {
  const access = verifyPrivateApiAccess(request);
  if (!access.allowed) return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403, headers: noStore });
  // Input rahasia lewat HTTP hanya disediakan pada komputer yang sama; hosting/LAN perlu TLS + secret manager.
  if (process.env.VERCEL || !isLoopbackHost(extractHost(request))) {
    return NextResponse.json({ error: "Input kunci di Pengaturan hanya tersedia di server lokal komputer ini." }, { status: 403, headers: noStore });
  }
  return null;
}

export async function GET(request: Request) {
  const rejected = rejectIfUnavailable(request);
  if (rejected) return rejected;
  return NextResponse.json(getOpenAiKeyStatus(), { headers: noStore });
}

export async function POST(request: Request) {
  const rejected = rejectIfUnavailable(request);
  if (rejected) return rejected;
  if (process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json({ error: "Kunci sudah dikelola melalui environment server. Ubah di sana bila ingin mengganti." }, { status: 409, headers: noStore });
  }
  if (Number(request.headers.get("content-length") || 0) > 1024) {
    return NextResponse.json({ error: "Ukuran input terlalu besar." }, { status: 413, headers: noStore });
  }
  try {
    const parsed = KeySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "API key tidak valid." }, { status: 400, headers: noStore });
    }
    setTemporaryOpenAiKey(parsed.data.apiKey);
    return NextResponse.json({ configured: true, source: "temporary" }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  const rejected = rejectIfUnavailable(request);
  if (rejected) return rejected;
  if (process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json({ error: "Kunci environment hanya dapat dihapus dari pengaturan server." }, { status: 409, headers: noStore });
  }
  clearTemporaryOpenAiKey();
  return NextResponse.json({ configured: false, source: "none" }, { headers: noStore });
}
