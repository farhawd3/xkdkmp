"use client";

import React, { useState, useEffect } from "react";
import { Lock, KeyRound, MessageSquare, CheckCircle2, AlertCircle, Save, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function ManagerPinSettings() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/auth/pin")
      .then((res) => res.json())
      .then((data) => {
        if (data.recoveryPhone) setRecoveryPhone(data.recoveryPhone);
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
      })
      .catch(() => {});
  }, []);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPin.trim()) {
      setErrorMsg("PIN saat ini wajib dimasukkan.");
      return;
    }

    if (!/^\d{4,8}$/.test(newPin.trim())) {
      setErrorMsg("PIN baru harus terdiri dari 4 sampai 8 digit angka.");
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg("Konfirmasi PIN baru tidak cocok dengan PIN baru.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          currentPin: currentPin.trim(),
          newPin: newPin.trim(),
          recoveryPhone: recoveryPhone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui PIN.");
      }

      setSuccessMsg("PIN manajer berhasil diperbarui dan tersimpan permanen di database.");
      showToast("success", "PIN Diperbarui", "PIN manajer berhasil disimpan.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      // Muat ulang info whatsapp
      const infoRes = await fetch("/api/auth/pin");
      const infoData = await infoRes.json();
      if (infoData.whatsappUrl) setWhatsappUrl(infoData.whatsappUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
      showToast("error", "Gagal", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-rose-100/90 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Keamanan &amp; PIN Akses Manajer
          </CardTitle>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            PIN Aktif (1234 Default)
          </span>
        </div>
        <CardDescription>
          Kelola PIN 4 digit untuk membuka aplikasi dari HP, tablet, maupun komputer. Jika lupa PIN, konfirmasi pemulihan dikirim ke WhatsApp pengurus/manajer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/70 dark:text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePin} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="currentPin" className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                PIN Saat Ini *
              </label>
              <Input
                id="currentPin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="PIN lama (awal: 1234)"
                required
              />
            </div>

            <div>
              <label htmlFor="newPin" className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                PIN Baru (4-8 Digit) *
              </label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Contoh: 5678"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPin" className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Konfirmasi PIN Baru *
              </label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Ulangi PIN baru"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="recoveryPhone" className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nomor WhatsApp Pemulihan (Jika Lupa PIN)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="recoveryPhone"
                type="tel"
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="flex-1"
              />
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <MessageSquare className="h-4 w-4" />
                  Uji Tautan WhatsApp
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Saat tombol &quot;Lupa PIN&quot; ditekan di layar awal, pesan bantuan konfirmasi akan otomatis ditujukan ke nomor ini.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="default"
              isLoading={isSubmitting}
              className="gap-2 font-bold"
            >
              <KeyRound className="h-4 w-4" />
              Perbarui PIN Manajer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
