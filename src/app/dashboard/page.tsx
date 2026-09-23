"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCheck, ClipboardList, Store, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardMetric } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { preparationRepository } from "@/lib/repository";
import { CATEGORY_LABELS } from "@/lib/checklist";
import { useResource } from "@/lib/useResource";
import { formatTanggal } from "@/lib/utils";

async function loadDashboard() {
  const [checklist, units, agendas, tasks, members] = await Promise.all([
    preparationRepository.getChecklistItems(), preparationRepository.getBusinessUnits(),
    preparationRepository.getAgendas(), preparationRepository.getTasks(), preparationRepository.getMembers(),
  ]);
  return { checklist, units, agendas, tasks, members };
}

const SHORTCUTS = [
  { href: "/anggota", title: "Data anggota", description: "Daftar dan lengkapi data", icon: Users, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  { href: "/pekerjaan", title: "Tugas & agenda", description: "Atur pekerjaan dan jadwal", icon: CalendarDays, tone: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" },
  { href: "/stok", title: "Barang & stok", description: "Tinjau katalog dan persediaan", icon: Store, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { href: "/keuangan", title: "Kas & simpanan", description: "Tinjau catatan keuangan", icon: Wallet, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
];

export default function DashboardPage() {
  const { data, loading, error, reload } = useResource(loadDashboard);
  if (error) return <ErrorState message="Ringkasan belum dapat dimuat. Coba lagi untuk mengambil data sesi." onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Menyiapkan ringkasan koperasi…" />;
  const { checklist, units, tasks, agendas, members } = data;
  const completed = checklist.filter((item) => item.status === "selesai").length;
  const percent = checklist.length ? Math.round(completed / checklist.length * 100) : 0;
  const priorities = checklist.filter((item) => item.isRequired && item.status !== "selesai")
    .sort((a, b) => (a.targetDate || "9999").localeCompare(b.targetDate || "9999"));
  const activeTasks = tasks.filter((item) => item.status !== "selesai" && item.status !== "dibatalkan");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const upcoming = agendas.filter((item) => item.status === "terjadwal" && item.date >= today)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader title="Selamat datang, Pak Halim" badgeText="Ruang kerja persiapan"
        description="Lihat kesiapan koperasi, tentukan prioritas, dan lanjutkan pekerjaan dari sini."
        actions={<Link href="/persiapan" className={buttonVariants({ className: "gap-2" })}>Buka checklist <ArrowRight className="h-4 w-4" /></Link>} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardMetric title="Kesiapan pembukaan" value={`${percent}%`} progress={percent} icon={<CheckCheck className="h-4 w-4" />} subtitle={`${completed} dari ${checklist.length} checklist selesai dalam sesi ini.`} action={{ label: "Tinjau kesiapan", href: "/persiapan" }} />
        <CardMetric title="Perlu tindak lanjut" value={priorities.length} icon={<ClipboardList className="h-4 w-4" />} accent="amber" subtitle="Checklist wajib yang belum selesai." action={{ label: "Lihat checklist wajib", href: "/persiapan" }} />
        <CardMetric title="Anggota tercatat" value={members.total} icon={<Users className="h-4 w-4" />} accent="sky" subtitle="Data anggota pada sesi prototipe ini." action={{ label: "Kelola anggota", href: "/anggota" }} />
        <CardMetric title="Pekerjaan terbuka" value={activeTasks.length} icon={<CalendarDays className="h-4 w-4" />} accent="indigo" subtitle="Tugas rencana dan tugas dalam proses." action={{ label: "Buka daftar tugas", href: "/pekerjaan" }} />
      </div>
      <section aria-label="Akses cepat" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map(({ href, title, description, icon: Icon, tone }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-700">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{description}</span></span>
          </Link>
        ))}
      </section>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Prioritas persiapan</CardTitle><CardDescription>Checklist wajib dengan target paling dekat. Tanggal mengikuti catatan sesi.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {priorities.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada checklist wajib yang tertunda. Tinjau kembali bukti bersama pengurus.</p>}
            {priorities.slice(0, 4).map((item, index) => (
              <Link key={item.id} href={`/persiapan?kategori=${item.category}`} className="flex items-start gap-3 rounded-xl border border-slate-200/80 p-4 hover:bg-rose-50/60 dark:border-slate-800 dark:hover:bg-slate-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-sm font-semibold text-primary-container dark:bg-slate-800">{index + 1}</span>
                <span className="min-w-0 flex-1"><strong className="block text-sm leading-relaxed">{item.title}</strong><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.picName || "Penanggung jawab belum ditetapkan"} · {item.targetDate ? formatTanggal(item.targetDate) : "Target belum ditetapkan"}</span></span>
                <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
            <Link href="/persiapan" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-container">Lihat seluruh checklist <ArrowRight className="h-4 w-4" /></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agenda berikutnya</CardTitle><CardDescription>Jadwal hari ini dan setelahnya, dalam WIB.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {upcoming.length === 0 && <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Belum ada agenda mendatang. Tambahkan jadwal rapat atau kegiatan persiapan.</p>}
            {upcoming.map((agenda) => (
              <Link key={agenda.id} href="/pekerjaan?tab=agenda" className="block rounded-xl bg-slate-50 p-4 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="text-xs font-semibold text-primary-container">{formatTanggal(agenda.date)}</span>
                <strong className="my-1 block text-sm">{agenda.title}</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">{agenda.isAllDay ? "Sepanjang hari" : `${agenda.startTime}–${agenda.endTime} WIB`}</span>
              </Link>
            ))}
            <Link href="/pekerjaan?tab=agenda" className={buttonVariants({ variant: "outline", className: "w-full" })}>Kelola agenda</Link>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Kesiapan per bidang</CardTitle><CardDescription>Ringkasan checklist, bukan pengesahan dokumen resmi.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {Array.from(new Set(checklist.map((item) => item.category))).map((category) => {
              const items = checklist.filter((item) => item.category === category);
              const done = items.filter((item) => item.status === "selesai").length;
              return (
                <div key={category}>
                  <div className="mb-2 flex justify-between gap-3 text-sm"><span>{CATEGORY_LABELS[category]}</span><span className="tabular-nums text-slate-500 dark:text-slate-400">{done}/{items.length}</span></div>
                  <div role="progressbar" aria-label={CATEGORY_LABELS[category]} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-primary-container" style={{ width: `${done / items.length * 100}%` }} /></div>
                </div>
              );
            })}
            {checklist.length === 0 && <p className="text-sm text-slate-500">Belum ada checklist.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rencana unit usaha</CardTitle><CardDescription>Aktivasi menunggu kesiapan dan keputusan pengurus.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {units.map((unit) => (
              <Link key={unit.id} href={`/unit-usaha/${unit.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:bg-slate-800">
                <span><strong className="block text-sm">{unit.name}</strong><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Tanggal mulai: {unit.operationalStartDate ? formatTanggal(unit.operationalStartDate) : "belum ditetapkan"}</span></span>
                <Badge variant="neutral">{unit.status.replaceAll("_", " ")}</Badge>
              </Link>
            ))}
            <div className="rounded-xl bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Saldo pembukaan belum diverifikasi. Unit Simpan Pinjam belum diaktifkan.</div>
            <Link href="/unit-usaha" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-container">Kelola unit usaha <ArrowRight className="h-4 w-4" /></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
