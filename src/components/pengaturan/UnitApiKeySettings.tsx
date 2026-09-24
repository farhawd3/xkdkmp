"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Status = { configured: boolean; source: "none" | "temporary" | "environment"; provider: string | null; active: false };

export function UnitApiKeySettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [provider, setProvider] = useState("");
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/integrations/unit-key", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Status kunci gerai belum terbaca.");
      if (active) setStatus(body);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Status kunci gerai belum terbaca."); });
    return () => { active = false; };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/integrations/unit-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, apiKey: key }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Kunci gerai belum tersimpan.");
      setStatus(body); setKey(""); setVisible(false);
      setMessage("Kunci tersimpan sementara. Input manual tetap aktif sampai konektor gerai dan alur persetujuan siap.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunci gerai belum tersimpan."); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/integrations/unit-key", { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Kunci gerai belum dihapus.");
      setStatus(body); setKey(""); setProvider(""); setMessage("Kunci sementara dihapus.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kunci gerai belum dihapus."); }
    finally { setBusy(false); }
  }

  return <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/30">
    <div className="flex flex-wrap items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /><h3 className="font-semibold">API key sistem gerai</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{status?.configured ? `Kunci tersimpan · ${status.provider || "gerai"}` : "Belum ada kunci"}</span></div>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Hanya untuk komputer lokal. Kunci dari form hilang saat server direstart. Menyimpan kunci <strong>tidak mengaktifkan API</strong> dan tidak menghentikan input manual, karena format dan alamat layanan gerai belum diketahui.</p>
    {status?.source !== "environment" && <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
      <Input label="Nama sistem gerai" value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="Contoh: aplikasi rekap gerai" maxLength={80} />
      <Input label="API key gerai" type={visible ? "text" : "password"} value={key} onChange={(event) => setKey(event.target.value)} placeholder="Tempel kunci dari penyedia gerai" autoComplete="new-password" maxLength={512} endAction={<Button type="button" variant="ghost" size="icon" aria-label={visible ? "Sembunyikan API key gerai" : "Tampilkan API key gerai"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</Button>} />
      <div className="flex flex-wrap gap-2 sm:col-span-2"><Button type="submit" disabled={busy || provider.trim().length < 2 || key.trim().length < 8}>Simpan sementara</Button>{status?.source === "temporary" && <Button type="button" variant="outline" disabled={busy} onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Hapus kunci</Button>}</div>
    </form>}
    {message && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
  </div>;
}
