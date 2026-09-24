// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { DELETE, GET, POST } from "@/app/api/integrations/unit-key/route";
import { clearTemporaryUnitApiKey } from "@/lib/server/unit-api-key-store";

const url = "http://localhost:3000/api/integrations/unit-key";
const fakeKey = "contoh-kunci-tidak-nyata-123456";
afterEach(clearTemporaryUnitApiKey);

describe("Kunci API gerai sementara", () => {
  it("tidak mengembalikan rahasia dan tidak mengaktifkan konektor", async () => {
    const saved = await POST(new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "Sistem Gerai Uji", apiKey: fakeKey }) }));
    expect(saved.status).toBe(200);
    expect(await saved.text()).not.toContain(fakeKey);
    expect(await (await GET(new Request(url))).json()).toMatchObject({ configured: true, active: false, source: "temporary" });
    expect(await (await DELETE(new Request(url, { method: "DELETE" }))).json()).toMatchObject({ configured: false, active: false });
  });

  it("menolak origin lain", async () => {
    const response = await POST(new Request(url, { method: "POST", headers: { Origin: "https://lain.invalid", "Content-Type": "application/json" }, body: JSON.stringify({ provider: "Gerai", apiKey: fakeKey }) }));
    expect(response.status).toBe(403);
  });
});
