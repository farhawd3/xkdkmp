import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility untuk menggabungkan class Tailwind secara aman dan menghindari konflik class.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Memformat angka menjadi Rupiah Indonesia (IDR) baku Asia/Jakarta.
 */
export function formatRupiah(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Memformat tanggal ke bahasa Indonesia.
 */
export function formatTanggal(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/**
 * Mengambil komponen tanggal (tahun, bulan, hari) sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getWIBDateParts(d = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  return { year, month, day, dateStr: `${year}-${month}-${day}` };
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getTodayWIB(d = new Date()): string {
  return getWIBDateParts(d).dateStr;
}

/**
 * Mendapatkan bulan berjalan dalam format YYYY-MM sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getCurrentYearMonthWIB(d = new Date()): string {
  const { year, month } = getWIBDateParts(d);
  return `${year}-${month}`;
}

/**
 * Mendapatkan tanggal N hari ke belakang dalam format YYYY-MM-DD sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getDaysAgoWIB(days: number, d = new Date()): string {
  const target = new Date(d);
  target.setDate(target.getDate() - days);
  return getTodayWIB(target);
}

/**
 * Mendapatkan tanggal besok dalam format YYYY-MM-DD sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getTomorrowWIB(d = new Date()): string {
  const target = new Date(d);
  target.setDate(target.getDate() + 1);
  return getTodayWIB(target);
}
