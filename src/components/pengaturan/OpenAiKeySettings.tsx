"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type KeyStatus = { configured: boolean; source: "none" | "temporary" | "environment" };

export function OpenAiKeySettings() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/integrations/openai-key", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Status API key belum dapat dibaca.");
        if (active) setStatus(body);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Status API key belum dapat dibaca."); });
    return () => { active = false; };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/integrations/openai-key", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "API key belum dapat disimpan.");
      setStatus(body); setKey(""); setVisible(false);
      setMessage("Kunci terpasang sementara di server lokal. Kunci tidak ditampilkan kembali.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "API key belum dapat disimpan."); }
    finally { setBusy(false); }
  }

  async function testConnection() {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/integrations/openai-key/test", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Koneksi belum berhasil.");
      setMessage("Kunci diterima OpenAI. Analisis tugas belum berjalan otomatis; fitur tersebut disiapkan terpisah.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Koneksi belum berhasil."); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/integrations/openai-key", { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Kunci belum dapat dihapus.");
      setStatus(body); setKey(""); setMessage("Kunci sementara di server telah dihapus.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunci belum dapat dihapus."); }
    finally { setBusy(false); }
  }

  return <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/30 md:col-span-2">
    <div className="flex flex-wrap items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /><h3 className="font-semibold">API key OpenAI untuk analisis AI</h3>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status?.configured ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{status?.configured ? "Terpasang" : status ? "Belum terpasang" : "Memeriksa…"}</span>
    </div>
    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Aplikasi mengirim kunci hanya ke server lokal dan tidak menyimpannya di browser, Git, atau Supabase. {status?.source === "environment" ? "Kunci dikelola lewat environment server." : "Kunci yang dimasukkan di sini hilang saat server direstart; masukkan lagi bila diperlukan."}</p>
    {status?.source !== "environment" && <form onSubmit={save} className="mt-4 space-y-3" autoComplete="off">
      <Input type={visible ? "text" : "password"} label="API key OpenAI" value={key} onChange={(event) => setKey(event.target.value)} placeholder="sk-…" autoComplete="new-password" autoCapitalize="none" spellCheck={false} maxLength={512} helperText="Jangan kirim API key melalui chat. Tempel langsung di sini pada komputer pribadi." endAction={
        <Button type="button" variant="ghost" size="icon" className="rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-200" aria-label={visible ? "Sembunyikan API key" : "Tampilkan API key"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button>
      } />
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || !key.trim()}>Simpan sementara di server</Button>
        <Button type="button" variant="outline" disabled={busy || !status?.configured} onClick={testConnection}><RefreshCw className="mr-2 h-4 w-4" />Uji koneksi</Button>
        {status?.source === "temporary" && <Button type="button" variant="ghost" disabled={busy} onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Hapus kunci</Button>}
      </div>
    </form>}
    {status?.source === "environment" && <Button type="button" variant="outline" className="mt-4" disabled={busy} onClick={testConnection}><RefreshCw className="mr-2 h-4 w-4" />Uji koneksi</Button>}
    {message && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
  </div>;
}
