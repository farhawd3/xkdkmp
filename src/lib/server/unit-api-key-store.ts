/** Konfigurasi sementara untuk rencana sambungan gerai; belum dipakai mengambil data. */
type RuntimeStore = typeof globalThis & { __kopdesUnitApi?: { provider: string; key: string } };
const store = () => globalThis as RuntimeStore;

export function getUnitApiKeyStatus() {
  const environmentKey = process.env.UNIT_REPORT_API_KEY?.trim();
  return {
    configured: Boolean(environmentKey || store().__kopdesUnitApi?.key),
    source: environmentKey ? "environment" as const : store().__kopdesUnitApi ? "temporary" as const : "none" as const,
    provider: environmentKey ? process.env.UNIT_REPORT_API_PROVIDER?.trim() || null : store().__kopdesUnitApi?.provider || null,
    active: false as const,
  };
}

export function setTemporaryUnitApiKey(provider: string, key: string) {
  store().__kopdesUnitApi = { provider, key };
}

export function clearTemporaryUnitApiKey() {
  delete store().__kopdesUnitApi;
}
