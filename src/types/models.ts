import { TaskPriority, TaskStatus, BusinessUnitStatus } from "@/lib/validations/simple-schemas";

/**
 * Pilihan dropdown unit usaha yang digunakan di berbagai modul operasional.
 */
export interface UnitOption {
  id: string;
  name: string;
  code?: string;
  location?: string;
}

/**
 * Data entitas tugas operasional manajer (tabel `tasks`).
 */
export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  unit_id: string | null;
  pic_name: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  business_units?: { name: string } | null;
}

/**
 * Data entitas unit usaha / gerai koperasi (tabel `business_units`).
 */
export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  unit_type: string;
  status: BusinessUnitStatus;
  pic_name: string;
  phone: string | null;
  location: string | null;
  monthly_target: string | number;
  readiness_percentage: number;
  operational_start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Data entitas rekap harian pemantauan gerai (tabel `unit_daily_reports`).
 */
export interface DailyReportRecord {
  id: string;
  unit_id: string;
  report_date: string;
  gross_revenue: string;
  operational_expenses: string;
  net_profit: string;
  transaction_count: number;
  cash_in_hand: string;
  operational_notes: string | null;
  source_type: string;
  created_at: string;
  business_units?: { name: string; code: string } | null;
}

/**
 * Data entitas anggota warga nagari (tabel `members`).
 */
export interface MemberRecord {
  id: string;
  member_number: string;
  full_name: string;
  phone: string | null;
  status: "calon" | "aktif" | "nonaktif";
  join_date: string;
  notes: string | null;
  created_at: string;
  is_archived?: boolean;
}

/**
 * Data entitas katalog stok komoditas fisik (tabel `products`).
 */
export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  base_unit: string;
  current_stock: number;
  min_stock: number;
  notes?: string | null;
}
