"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Delete, MessageSquare, AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function PinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ambil data WhatsApp pemulihan saat halaman dimuat
  useEffect(() => {
    fetch("/api/auth/pin")
      .then((res) => res.json())
      .then((data) => {
        if (data.recoveryPhone) setRecoveryPhone(data.recoveryPhone);
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
      })
      .catch(() => {});

    // Fokuskan input keyboard tersembunyi
    inputRef.current?.focus();
  }, []);

  // Otomatis submit jika PIN mencapai 4 digit
  useEffect(() => {
    if (pin.length === 4 && !loading) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (pinToVerify: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", pin: pinToVerify }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "PIN tidak sesuai. Silakan coba lagi.");
        setPin("");
        setLoading(false);
        inputRef.current?.focus();
        return;
      }

      // Berhasil, arahkan ke dashboard
      router.push("/dashboard");
    } catch {
      setErrorMsg("Gagal menghubungi server. Periksa koneksi internet Anda.");
      setPin("");
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (loading) return;
    if (pin.length < 4) {
      setErrorMsg(null);
      setPin((prev) => prev + num);
    }
  };

  const handleClear = () => {
    if (loading) return;
    setPin("");
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (loading) return;
    if (e.key === "Enter" && pin.length >= 4) {
      handleVerify(pin);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4 text-slate-900 dark:bg-[#1D2533] dark:text-slate-100">
      {/* Hidden input agar pengguna PC/Laptop bisa mengetik langsung dengan keyboard fisik */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          if (val.length <= 4) {
            setPin(val);
            setErrorMsg(null);
          }
        }}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-label="Input PIN Manajer"
        autoFocus
      />

      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#252F40] sm:p-8">
        {/* Header Identitas */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
            <Lock className="h-7 w-7" />
          </div>
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            Aplikasi Pribadi Manajer
          </span>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kopdes Merah Putih
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ladang Laweh, Kec. Banuhampu, Agam
          </p>
        </div>

        {/* Indikator Titik PIN */}
        <div className="my-6">
          <p className="mb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
            Masukkan 4 Digit PIN Akses:
          </p>
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`h-4 w-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? "scale-110 bg-rose-600 ring-4 ring-rose-100 dark:bg-rose-500 dark:ring-rose-900/60"
                      : "border-2 border-slate-300 bg-transparent dark:border-slate-600"
                  }`}
                />
              );
            })}
          </div>

          {/* Notifikasi Galat */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/80 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Keypad Angka Tablet & Mobile Friendly */}
        <div className="grid grid-cols-3 gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={loading}
              className="flex h-13 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-xl font-bold text-slate-800 transition active:scale-95 active:bg-rose-100 hover:bg-rose-50 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="flex h-13 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 transition active:scale-95 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Bersihkan
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading}
            className="flex h-13 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-xl font-bold text-slate-800 transition active:scale-95 active:bg-rose-100 hover:bg-rose-50 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            aria-label="Hapus digit terakhir"
            className="flex h-13 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 transition active:scale-95 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Bantuan Lupa PIN via WhatsApp */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          <a
            href={whatsappUrl || `https://wa.me/6281267890123`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Lupa PIN? Konfirmasi via WhatsApp
          </a>

          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            PIN Awal Default: <strong className="font-mono text-slate-600 dark:text-slate-300">1234</strong> (dapat diubah di Pengaturan)
          </p>
        </div>
      </div>
    </div>
  );
}
