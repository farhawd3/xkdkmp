/** Rahasia hanya hidup di proses Node lokal. Tidak persisten, tidak boleh diimpor oleh komponen browser. */
type RuntimeKeyStore = typeof globalThis & { __kopdesTemporaryOpenAiKey?: string };

function runtimeStore(): RuntimeKeyStore {
  return globalThis as RuntimeKeyStore;
}

export function getOpenAiKey(): string | null {
  const environmentKey = process.env.OPENAI_API_KEY?.trim();
  return environmentKey || runtimeStore().__kopdesTemporaryOpenAiKey || null;
}

export function getOpenAiKeyStatus() {
  const fromEnvironment = Boolean(process.env.OPENAI_API_KEY?.trim());
  return {
    configured: fromEnvironment || Boolean(runtimeStore().__kopdesTemporaryOpenAiKey),
    source: fromEnvironment ? "environment" as const : runtimeStore().__kopdesTemporaryOpenAiKey ? "temporary" as const : "none" as const,
  };
}

export function setTemporaryOpenAiKey(key: string): void {
  runtimeStore().__kopdesTemporaryOpenAiKey = key;
}

export function clearTemporaryOpenAiKey(): void {
  delete runtimeStore().__kopdesTemporaryOpenAiKey;
}
