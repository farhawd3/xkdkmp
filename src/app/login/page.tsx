"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { sanitizeAuthError, withAuthTimeout } from "@/lib/auth/utils";
import { sanitizeRedirectUrl } from "@/lib/supabase/middleware";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Alamat email wajib diisi")
    .email("Format alamat email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo");
  const urlError = searchParams.get("error");
  const isUnconfigured = searchParams.get("status") === "unconfigured" || !isSupabaseConfigured();

  const [authError, setAuthError] = useState<string | null>(urlError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured()) {
        setAuthError(
          "Koneksi Supabase belum dikonfigurasi. Lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di berkas .env.local untuk mengaktifkan login produksi."
        );
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { data: authData, error } = await withAuthTimeout(supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      }));

      if (error) {
        setAuthError(sanitizeAuthError(error.message));
        setIsSubmitting(false);
        return;
      }

      if (authData?.user) {
        const safeTarget = sanitizeRedirectUrl(rawRedirect, "/dashboard");
        window.location.assign(safeTarget);
        return;
      }
      setAuthError("Supabase belum mengembalikan sesi akun. Silakan coba masuk kembali.");
      setIsSubmitting(false);
    } catch (error) {
      setAuthError(error instanceof Error && error.message === "AUTH_TIMEOUT"
        ? "Verifikasi terlalu lama. Periksa koneksi internet, lalu coba kembali."
        : "Gagal menghubungi server autentikasi. Silakan periksa koneksi jaringan Anda.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Kartu Formulir Login */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-colors duration-200 dark:border-slate-800/90 dark:bg-slate-900 md:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-primary-container dark:bg-slate-800 dark:text-rose-300">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
            Masuk ke Sistem
          </h1>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 md:text-sm">
            Gunakan akun staf atau pengurus resmi Koperasi Desa Ladang Laweh.
          </p>
        </div>

        {/* Pemberitahuan Status Konfigurasi */}
        {isUnconfigured && (
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="block font-semibold">Mode Persiapan (Database Belum Terhubung)</strong>
                <span>
                  Variabel Supabase Auth belum diisi di lingkungan ini. Hubungkan kredensial produksi pada berkas <code className="font-mono font-semibold">.env.local</code> untuk aktivasi login riil.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notifikasi Galat Autentikasi */}
        {authError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <span>{authError}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Masuk */}
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Kata Sandi
              </label>
              <Link
                href="/lupa-password"
                className="text-xs font-semibold text-primary-container transition-colors hover:text-rose-700 hover:underline dark:text-rose-400"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Memverifikasi akun...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pendaftaran akun staf dilakukan via undangan Administrator resmi.
          </p>
        </div>
      </div>

      {/* Info Keamanan & Privasi */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Masuk menggunakan akun Supabase yang disiapkan pengelola.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Logo & Identitas Kopdes */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-3 py-1 text-xs font-bold text-primary-container dark:border-slate-800 dark:bg-slate-900 dark:text-rose-300">
          Mode Persiapan Menuju 2027
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Kopdes Merah Putih
        </h2>
        <p className="text-sm font-semibold text-primary-container dark:text-rose-400">
          Ladang Laweh, Sumatera Barat
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex min-h-[300px] w-full max-w-md items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
