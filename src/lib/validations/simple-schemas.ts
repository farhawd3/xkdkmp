import { z } from "zod";

/**
 * Pola angka desimal uang non-negatif (contoh: "150000", "25000.50")
 */
const monetaryString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Format angka tidak valid. Gunakan format angka desimal positif.")
  .or(
    z.number().nonnegative("Nilai uang tidak boleh negatif").transform((n) => n.toFixed(2))
  );

// ------------------------------------------------------------------------------
// SKEMA TUGAS OPERASIONAL MANAJER (tasks)
// ------------------------------------------------------------------------------
export const TaskPriorityEnum = z.enum(["rendah", "sedang", "tinggi", "mendesak"]);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

export const TaskStatusEnum = z.enum(["belum_mulai", "sedang_proses", "selesai", "tertunda"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskSchema = z.object({
  id: z.string().uuid("ID tugas tidak valid").optional(),
  title: z.string().trim().min(3, "Judul tugas minimal 3 karakter").max(255, "Judul tugas maksimal 255 karakter"),
  description: z.string().trim().optional().default(""),
  unit_id: z.string().uuid("ID unit usaha tidak valid").nullable().optional(),
  pic_name: z.string().trim().min(2, "Nama penanggung jawab minimal 2 karakter"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").nullable().optional(),
  priority: TaskPriorityEnum.default("sedang"),
  status: TaskStatusEnum.default("belum_mulai"),
  notes: z.string().trim().optional().default(""),
});

export const TaskStatusUpdateSchema = z.object({
  id: z.string().uuid("ID tugas tidak valid"),
  status: TaskStatusEnum,
});

// ------------------------------------------------------------------------------
// SKEMA REKAPITULASI PEMANTAUAN GERAI HARIAN (unit_daily_reports)
// ------------------------------------------------------------------------------
export const DailyReportSchema = z.object({
  unit_id: z.string().uuid("Pilih unit usaha yang sah"),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal laporan harus YYYY-MM-DD"),
  gross_revenue: monetaryString,
  operational_expenses: monetaryString,
  cash_in_hand: monetaryString.optional().default("0.00"),
  transaction_count: z.coerce.number().int().nonnegative("Jumlah transaksi tidak boleh negatif").default(0),
  operational_notes: z.string().trim().optional().default(""),
  source_type: z.enum(["manual", "api"]).default("manual"),
});

// ------------------------------------------------------------------------------
// SKEMA PROFIL GERAI / UNIT USAHA (business_units)
// ------------------------------------------------------------------------------
export const BusinessUnitStatusEnum = z.enum(["rencana", "persiapan", "siap_buka", "aktif", "nonaktif"]);
export type BusinessUnitStatus = z.infer<typeof BusinessUnitStatusEnum>;

export const BusinessUnitSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2, "Kode unit minimal 2 karakter").max(50),
  name: z.string().trim().min(3, "Nama gerai minimal 3 karakter").max(150),
  unit_type: z.string().trim().min(2, "Jenis usaha wajib diisi").default("Sembako & Kebutuhan Pokok"),
  status: BusinessUnitStatusEnum.default("rencana"),
  pic_name: z.string().trim().min(2, "Nama PIC minimal 2 karakter"),
  phone: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default("Ladang Laweh"),
  monthly_target: monetaryString.default("0.00"),
  readiness_percentage: z.coerce.number().int().min(0).max(100).default(0),
  operational_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().trim().optional().default(""),
});

// ------------------------------------------------------------------------------
// SKEMA PEMANTAUAN STOK ANGKA (products)
// ------------------------------------------------------------------------------
export const SimpleStockUpdateSchema = z.object({
  product_id: z.string().uuid("ID produk tidak valid"),
  current_stock: z.coerce.number().min(0, "Jumlah stok fisik tidak boleh negatif"),
  min_stock: z.coerce.number().min(0, "Batas stok minimum tidak boleh negatif").optional(),
  notes: z.string().trim().optional(),
});

// ------------------------------------------------------------------------------
// SKEMA PEMANTAUAN DATA ANGGOTA (members)
// ------------------------------------------------------------------------------
export const SimpleMemberSchema = z.object({
  id: z.string().uuid().optional(),
  member_number: z.string().trim().min(2, "Nomor anggota minimal 2 karakter"),
  full_name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
  phone: z.string().trim().optional().default(""),
  status: z.enum(["calon", "aktif", "nonaktif"]).default("calon"),
  join_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().trim().optional().default(""),
});
