"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter")
      .regex(/[A-Z]/, "Harus mengandung setidaknya 1 huruf besar")
      .regex(/[0-9]/, "Harus mengandung setidaknya 1 angka"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured()) {
        setErrorMessage(
          "Koneksi Supabase belum aktif. Pastikan kredensial produksi terpasang pada .env.local."
        );
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch {
      setErrorMessage("Gagal memperbarui kata sandi. Silakan periksa kembali tautan email Anda.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Identitas */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-3 py-1 text-xs font-bold text-primary-container dark:border-slate-800 dark:bg-slate-900 dark:text-rose-300">
          Atur Ulang Kredensial
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Kata Sandi Baru
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
                Kata Sandi Berhasil Diperbarui
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 md:text-sm">
                Kata sandi baru Anda telah aktif. Sistem sedang mengalihkan Anda ke halaman dashboard...
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
                >
                  <span>Buka Dashboard Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 md:text-sm">
                  Tetapkan kata sandi baru yang kuat untuk akun Koperasi Desa Anda.
                </p>
              </div>

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
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter (huruf besar & angka)"
                      disabled={isSubmitting}
                      {...register("password")}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Ketik ulang kata sandi baru"
                      disabled={isSubmitting}
                      {...register("confirmPassword")}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Memperbarui kata sandi...</span>
                  ) : (
                    <span>Simpan Kata Sandi Baru</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
