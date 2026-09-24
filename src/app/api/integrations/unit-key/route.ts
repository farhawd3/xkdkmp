import { NextResponse } from "next/server";
import { z } from "zod";
import { extractHost, isLoopbackHost, verifyPrivateApiAccess } from "@/lib/security/private-access";
import { clearTemporaryUnitApiKey, getUnitApiKeyStatus, setTemporaryUnitApiKey } from "@/lib/server/unit-api-key-store";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };
const KeySchema = z.object({ provider: z.string().trim().min(2).max(80), apiKey: z.string().trim().min(8).max(512) });

function reject(request: Request) {
  const access = verifyPrivateApiAccess(request);
  if (!access.allowed) return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403, headers: noStore });
  if (process.env.VERCEL || !isLoopbackHost(extractHost(request))) return NextResponse.json({ error: "Input rahasia hanya tersedia di komputer server lokal." }, { status: 403, headers: noStore });
  return null;
}

export async function GET(request: Request) {
  const denied = reject(request);
  if (denied) return denied;
  return NextResponse.json(getUnitApiKeyStatus(), { headers: noStore });
}

export async function POST(request: Request) {
  const denied = reject(request);
  if (denied) return denied;
  if (process.env.UNIT_REPORT_API_KEY?.trim()) return NextResponse.json({ error: "Kunci gerai dikelola lewat environment server." }, { status: 409, headers: noStore });
  if (Number(request.headers.get("content-length") || 0) > 1024) return NextResponse.json({ error: "Input terlalu besar." }, { status: 413, headers: noStore });
  try {
    const parsed = KeySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Nama sistem gerai atau format kunci belum valid." }, { status: 400, headers: noStore });
    setTemporaryUnitApiKey(parsed.data.provider, parsed.data.apiKey);
    return NextResponse.json(getUnitApiKeyStatus(), { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  const denied = reject(request);
  if (denied) return denied;
  if (process.env.UNIT_REPORT_API_KEY?.trim()) return NextResponse.json({ error: "Kunci environment hanya dapat dihapus dari server." }, { status: 409, headers: noStore });
  clearTemporaryUnitApiKey();
  return NextResponse.json(getUnitApiKeyStatus(), { headers: noStore });
}
