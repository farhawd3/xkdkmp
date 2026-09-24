// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "@/app/api/integrations/openai-key/route";
import { POST as testConnection } from "@/app/api/integrations/openai-key/test/route";
import { clearTemporaryOpenAiKey } from "@/lib/server/openai-key-store";

const url = "http://localhost:3000/api/integrations/openai-key";
const fakeKey = "sk-test-only-not-a-real-secret-123456789";

afterEach(() => {
  clearTemporaryOpenAiKey();
  vi.restoreAllMocks();
});

describe("API key OpenAI di Pengaturan", () => {
  it("menyimpan sementara pada server tanpa pernah mengembalikan isi kunci", async () => {
    const saved = await POST(new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: fakeKey }) }));
    expect(saved.status).toBe(200);
    expect(await saved.text()).not.toContain(fakeKey);
    const status = await GET(new Request(url));
    expect(await status.json()).toEqual({ configured: true, source: "temporary" });
    const removed = await DELETE(new Request(url, { method: "DELETE" }));
    expect(await removed.json()).toEqual({ configured: false, source: "none" });
  });

  it("menolak format tidak sah dan permintaan lintas-origin", async () => {
    const invalid = await POST(new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: "abc" }) }));
    expect(invalid.status).toBe(400);
    const crossOrigin = await POST(new Request(url, { method: "POST", headers: { "Origin": "https://situs-lain.invalid", "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: fakeKey }) }));
    expect(crossOrigin.status).toBe(403);
  });

  it("uji koneksi hanya mengembalikan status, bukan daftar model atau kunci", async () => {
    await POST(new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: fakeKey }) }));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const tested = await testConnection(new Request(`${url}/test`, { method: "POST" }));
    expect(tested.status).toBe(200);
    expect(await tested.json()).toEqual({ connected: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/models", expect.objectContaining({ headers: { Authorization: `Bearer ${fakeKey}` } }));
  });
});
