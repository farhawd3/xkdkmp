export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div aria-hidden="true" className="space-y-3 animate-pulse">
        <div className="h-5 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
