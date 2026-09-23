"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Alamat email wajib diisi")
    .email("Format alamat email tidak valid"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function LupaPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured()) {
        setErrorMessage(
          "Layanan pengiriman email belum dikonfigurasi. Hubungkan kredensial Supabase produksi pada .env.local untuk mengaktifkan pemulihan kata sandi."
        );
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      // Pesan sukses selalu tampil untuk mencegah enumerasi akun
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch {
      setErrorMessage("Gagal mengirim permohonan. Silakan coba kembali nanti.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Identitas */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-3 py-1 text-xs font-bold text-primary-container dark:border-slate-800 dark:bg-slate-900 dark:text-rose-300">
          Pemulihan Akun
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Lupa Kata Sandi
        </h2>
        <p className="text-sm font-semibold text-primary-container dark:text-rose-400">
          Kopdes Merah Putih — Ladang Laweh
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-colors duration-200 dark:border-slate-800/90 dark:bg-slate-900 md:p-8">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Tautan Pemulihan Dikirim
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 md:text-sm">
                Jika alamat email Anda terdaftar di sistem, tautan atur ulang kata sandi telah dikirimkan ke kotak masuk email Anda.
              </p>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <p>Silakan periksa folder Spam atau Promosi jika tidak ditemukan dalam 2 menit.</p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 md:text-sm">
                  Masukkan alamat email resmi Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </p>
              </div>

              {!isSupabaseConfigured() && (
                <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong className="block font-semibold">Layanan Email Belum Dikonfigurasi</strong>
                      <span>Kredensial SMTP produksi belum aktif. Fitur pemulihan akan berfungsi saat akun Supabase dihubungkan.</span>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="flex-1">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Alamat Email Resmi
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@kopdes-ladanglaweh.id"
                      disabled={isSubmitting}
                      {...register("email")}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Mengirimkan permohonan...</span>
                  ) : (
                    <>
                      <span>Kirim Tautan Pemulihan</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-container transition-colors hover:text-rose-700 hover:underline dark:text-rose-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
