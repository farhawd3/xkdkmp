export interface DashboardTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  pic_name: string;
  business_units?: { name: string } | null;
}

export interface DashboardSummary {
  generatedAt?: string;
  businessDate?: string;
  totalUnits: number;
  activeUnits: number;
  totalMembers: number;
  activeTasks: number;
  urgentTasks: number;
  urgentTaskList: DashboardTask[];
  todayReports: number;
  activeReportedUnits?: number;
  monthRevenue: number;
  monthExpenses: number;
  monthProfit: number;
  dailyTrend: { date: string; revenue: number; expenses: number; profit: number }[];
  reportingTrend?: { date: string; reported: number; total: number; percent: number | null }[];
  unreportedUnits: { id: string; name: string }[];
  businessStatus: string;
  lowStockCount?: number;
  lowStockItems?: { id: string; name: string; current_stock: number; min_stock: number; base_unit: string }[];
  overdueTaskCount?: number;
  todayDueTaskCount?: number;
  overdueTaskList?: DashboardTask[];
  todayDueTaskList?: DashboardTask[];
}

export type FocusCategory = "semua" | "tugas" | "gerai" | "stok";
export interface ManagerAction {
  id: string;
  category: Exclude<FocusCategory, "semua">;
  title: string;
  detail: string;
  href: string;
  label: string;
}

/** Satu rumus kepatuhan gerai aktif untuk layar dan ekspor. */
export function reportingProgress(data: DashboardSummary) {
  const total = Math.max(0, data.activeUnits);
  const reported = Math.min(total, Math.max(0, data.activeReportedUnits ?? total - data.unreportedUnits.length));
  return { total, reported, percent: total ? Math.round(reported / total * 100) : null };
}

export function managerActions(data: DashboardSummary): ManagerAction[] {
  const tasks = new Map<string, ManagerAction>();
  for (const [list, label] of [
    [data.overdueTaskList ?? [], "Lewat tenggat"],
    [data.todayDueTaskList ?? [], "Hari ini"],
    [data.urgentTaskList, "Prioritas tinggi"],
  ] as const) {
    for (const task of list) {
      if (!tasks.has(task.id)) tasks.set(task.id, {
        id: `task-${task.id}`, category: "tugas", title: task.title,
        detail: `${task.pic_name || "PIC belum diisi"}${task.due_date ? ` · ${task.due_date}` : " · Tanpa tenggat"}`,
        href: "/pekerjaan", label,
      });
    }
  }
  return [
    ...tasks.values(),
    ...data.unreportedUnits.map((unit): ManagerAction => ({
      id: `unit-${unit.id}`, category: "gerai", title: unit.name,
      detail: "Belum ada rekap untuk hari ini. Hubungi PIC atau catat laporan.",
      href: "/monitoring", label: "Belum lapor",
    })),
    ...(data.lowStockItems ?? []).map((product): ManagerAction => ({
      id: `stock-${product.id}`, category: "stok", title: product.name,
      detail: `Tersisa ${product.current_stock} ${product.base_unit} · Batas minimum ${product.min_stock}`,
      href: "/stok", label: product.current_stock <= 0 ? "Stok habis" : "Stok menipis",
    })),
  ];
}

export function managerSnapshotRows(data: DashboardSummary, organizationName: string) {
  const reporting = reportingProgress(data);
  return [
    ["Ringkasan manajer", organizationName],
    ["Waktu pengambilan (ISO)", data.generatedAt ?? "Tidak tersedia"],
    ["Tanggal bisnis WIB", data.businessDate ?? "Tidak tersedia"],
    ["Indikator", "Nilai", "Keterangan"],
    ["Gerai aktif", reporting.total, "Gerai yang wajib melapor"],
    ["Gerai aktif sudah lapor", reporting.reported, "Hari ini"],
    ["Kepatuhan (%)", reporting.percent ?? "Belum berlaku", "Hanya gerai aktif"],
    ["Omset tercatat", data.monthRevenue, "Bulan berjalan sampai hari ini; Rupiah"],
    ["Pengeluaran tercatat", data.monthExpenses, "Bulan berjalan sampai hari ini; Rupiah"],
    ["Selisih operasional", data.monthProfit, "Bukan laba bersih atau SHU resmi; Rupiah"],
    ["Tugas aktif", data.activeTasks, "Semua tugas belum selesai"],
    ["Stok perlu perhatian", data.lowStockCount ?? 0, "Jumlah barang, bukan jumlah satuan"],
    [], ["Keterisian rekap tujuh hari", "Gerai aktif saat ini dengan rekap per tanggal; bukan jadwal hari operasional"],
    ["Tanggal", "Gerai melapor", "Gerai aktif", "Persentase"],
    ...(data.reportingTrend ?? []).map((day) => [day.date, day.reported, day.total, day.percent ?? "Belum berlaku"]),
    [], ["Kategori", "Tindak lanjut", "Keterangan", "Status"],
    ...managerActions(data).map((item) => [item.category, item.title, item.detail, item.label]),
    ["Catatan", "Daftar tugas/stok merupakan cuplikan prioritas, bukan backup lengkap."],
  ];
}
