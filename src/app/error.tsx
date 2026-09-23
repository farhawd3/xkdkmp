"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="Halaman belum dapat ditampilkan" message="Terjadi kendala saat membuka halaman ini. Coba lagi untuk memuat tampilannya." onRetry={reset} />;
}
