import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  InMemoryPreparationRepository,
  SupabaseProductionRepository,
  getRepository,
  isProductionDatabaseConfigured,
} from '@/lib/repository';

describe('Tahap 09 — Verifikasi Skema SQL & Kebijakan Keamanan Supabase', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const file1 = path.join(migrationsDir, '20260923000001_core_schema.sql');
  const file2 = path.join(migrationsDir, '20260923000002_rls_policies.sql');
  const file3 = path.join(migrationsDir, '20260923000003_atomic_rpcs.sql');

  const schemaSql = fs.readFileSync(file1, 'utf-8');
  const rlsSql = fs.readFileSync(file2, 'utf-8');
  const rpcSql = fs.readFileSync(file3, 'utf-8');

  it('memastikan berkas migrasi SQL tersedia dan tidak kosong', () => {
    expect(fs.existsSync(file1)).toBe(true);
    expect(fs.existsSync(file2)).toBe(true);
    expect(fs.existsSync(file3)).toBe(true);
    expect(schemaSql.length).toBeGreaterThan(500);
    expect(rlsSql.length).toBeGreaterThan(500);
    expect(rpcSql.length).toBeGreaterThan(500);
  });

  it('memvalidasi 15+ tabel inti didefinisikan dalam skema', () => {
    const requiredTables = [
      'user_roles',
      'members',
      'organization_profile',
      'fixed_assets',
      'suppliers',
      'products',
      'purchase_orders',
      'purchase_order_items',
      'goods_receipts',
      'goods_receipt_items',
      'stock_mutations',
      'stock_opnames',
      'stock_opname_items',
      'cashier_shifts',
      'pos_transactions',
      'pos_transaction_items',
      'chart_of_accounts',
      'journal_entries',
      'journal_lines',
      'audit_logs',
    ];

    for (const table of requiredTables) {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i');
      expect(regex.test(schemaSql)).toBe(true);
    }
  });

  it('memvalidasi kolom moneter menggunakan NUMERIC(15, 2) dan tidak menggunakan FLOAT/REAL', () => {
    // Dilarang ada FLOAT atau REAL untuk presisi desimal pembukuan
    expect(/\bFLOAT\b/i.test(schemaSql)).toBe(false);
    expect(/\bREAL\b/i.test(schemaSql)).toBe(false);
    expect(/\bDOUBLE PRECISION\b/i.test(schemaSql)).toBe(false);

    // Kolom moneter wajib NUMERIC(15, 2)
    const monetaryColumns = [
      'cost_price NUMERIC\\(15, 2\\)',
      'selling_price NUMERIC\\(15, 2\\)',
      'total_amount NUMERIC\\(15, 2\\)',
      'unit_price NUMERIC\\(15, 2\\)',
      'debit NUMERIC\\(15, 2\\)',
      'credit NUMERIC\\(15, 2\\)',
      'simpanan_pokok_amount NUMERIC\\(15, 2\\)',
    ];

    for (const pattern of monetaryColumns) {
      const regex = new RegExp(pattern, 'i');
      expect(regex.test(schemaSql)).toBe(true);
    }
  });

  it('memvalidasi seluruh tabel mengaktifkan Row Level Security (Default Deny)', () => {
    const tablesWithRls = [
      'user_roles',
      'members',
      'organization_profile',
      'fixed_assets',
      'suppliers',
      'products',
      'purchase_orders',
      'purchase_order_items',
      'goods_receipts',
      'goods_receipt_items',
      'stock_mutations',
      'stock_opnames',
      'stock_opname_items',
      'cashier_shifts',
      'pos_transactions',
      'pos_transaction_items',
      'chart_of_accounts',
      'journal_entries',
      'journal_lines',
      'audit_logs',
    ];

    for (const table of tablesWithRls) {
      const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(rlsRegex.test(rlsSql)).toBe(true);
    }
  });

  it('memvalidasi aturan imutabilitas transaksi (larangan UPDATE dan DELETE langsung pada jurnal dan mutasi)', () => {
    // Memastikan ada policy immutability dengan USING (FALSE)
    expect(rlsSql).toContain('Jurnal dilarang diedit langsung');
    expect(rlsSql).toContain('Jurnal dilarang dihapus langsung');
    expect(rlsSql).toContain('Mutasi stok dilarang diedit langsung');
    expect(rlsSql).toContain('Mutasi stok dilarang dihapus langsung');
    expect(rlsSql).toContain('Transaksi kasir dilarang diedit langsung');
    expect(rlsSql).toContain('Transaksi kasir dilarang dihapus langsung');
    expect(rlsSql).toContain('USING (FALSE)');
  });

  it('memvalidasi fungsi RPC atomik didefinisikan dengan kontrol transaksi aman', () => {
    expect(rpcSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_receive_goods_shipment');
    expect(rpcSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_process_pos_sale');
    expect(rpcSql).toContain('CREATE OR REPLACE FUNCTION public.rpc_create_balanced_journal');
    expect(rpcSql).toContain('SECURITY DEFINER');
    expect(rpcSql).toContain('SET search_path = public');
    expect(rpcSql).toContain('Jurnal tidak seimbang');
  });
});

describe('Tahap 09 — Pemisahan Repositori & Pencegahan Fallback Data Palsu', () => {
  it('SupabaseProductionRepository bersifat fail-fast dan menolak operasi jika kredensial belum ada', async () => {
    // Pastikan tanpa NEXT_PUBLIC_SUPABASE_URL, repo melempar error dan BUKAN mengembalikan data mock
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const prodRepo = new SupabaseProductionRepository();
      await expect(prodRepo.getMembers()).rejects.toThrow(
        /Koneksi basis data PostgreSQL Supabase belum dikonfigurasi/
      );
      await expect(prodRepo.getProducts()).rejects.toThrow(
        /Koneksi basis data PostgreSQL Supabase belum dikonfigurasi/
      );
    } finally {
      if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    }
  });

  it('InMemoryPreparationRepository dimulai tanpa data palsu (anggota 0)', async () => {
    const memRepo = new InMemoryPreparationRepository();
    const result = await memRepo.getMembers();
    expect(result.members).toEqual([]);
    expect(result.total).toBe(0);

    const summary = await memRepo.getMemberSummary();
    expect(summary.total).toBe(0);
    expect(summary.calon).toBe(0);
    expect(summary.verified).toBe(0);
  });

  it('getRepository mendeteksi lingkungan dengan benar tanpa data contoh otomatis', () => {
    const repo = getRepository();
    expect(repo).toBeDefined();
    // Di lingkungan pengujian lokal tanpa kredensial, default adalah InMemoryPreparationRepository
    expect(isProductionDatabaseConfigured()).toBe(false);
  });
});
