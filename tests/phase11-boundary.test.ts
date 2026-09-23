import { describe, expect, it } from "vitest";
import { getRepository, SupabaseProductionRepository } from "@/lib/repository";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Tahap 11 — batas data produksi", () => {
  it("tidak mengembalikan data sesi lokal saat konfigurasi Supabase aktif", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-test-key";
      const repository = getRepository();
      expect(repository).toBeInstanceOf(SupabaseProductionRepository);
      await expect(repository.getMembers()).rejects.toThrow("belum terhubung ke database Supabase");
      await expect(repository.getChecklistItems()).rejects.toThrow("belum terhubung ke database Supabase");
    } finally {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
    }
  });

  it("menghapus seluruh tabel transaksi retail rumit lama agar skema database bersih", () => {
    const sql = readFileSync(resolve("supabase/migrations/20260923000007_clean_simple_schema.sql"), "utf8");
    const droppedTables = [
      "pos_transaction_items",
      "pos_transactions",
      "cashier_shifts",
      "goods_receipt_items",
      "goods_receipts",
      "purchase_order_items",
      "purchase_orders",
      "stock_mutations",
      "stock_opname_items",
      "stock_opnames",
      "journal_lines",
      "journal_entries",
      "chart_of_accounts",
    ];

    for (const name of droppedTables) {
      expect(sql).toContain(`DROP TABLE IF EXISTS public.${name}`);
    }
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.business_units");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.unit_daily_reports");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.tasks");
  });
});
