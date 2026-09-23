import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  InMemoryPreparationRepository,
  SupabaseProductionRepository,
  getRepository,
  isProductionDatabaseConfigured,
} from '@/lib/repository';

describe('Tahap 09 — Verifikasi Skema SQL & Kebijakan Keamanan Supabase Sederhana', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const cleanSchemaFile = path.join(migrationsDir, '20260923000007_clean_simple_schema.sql');

  const schemaSql = fs.readFileSync(cleanSchemaFile, 'utf-8');

  it('memastikan berkas migrasi skema bersih Supabase tersedia dan tidak kosong', () => {
    expect(fs.existsSync(cleanSchemaFile)).toBe(true);
    expect(schemaSql.length).toBeGreaterThan(1000);
  });

  it('memvalidasi tabel-tabel inti pemantauan didefinisikan dalam skema sederhana', () => {
    const requiredTables = [
      'business_units',
      'unit_daily_reports',
      'tasks',
      'products',
      'members',
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
      'monthly_target NUMERIC\\(15, 2\\)',
      'gross_revenue NUMERIC\\(15, 2\\)',
      'operational_expenses NUMERIC\\(15, 2\\)',
      'net_profit NUMERIC\\(15, 2\\)',
      'cash_in_hand NUMERIC\\(15, 2\\)',
    ];

    for (const pattern of monetaryColumns) {
      const regex = new RegExp(pattern, 'i');
      expect(regex.test(schemaSql)).toBe(true);
    }
  });

  it('memvalidasi seluruh tabel pemantauan mengaktifkan Row Level Security (Default Deny)', () => {
    const tablesWithRls = [
      'business_units',
      'unit_daily_reports',
      'tasks',
      'products',
      'members',
    ];

    for (const table of tablesWithRls) {
      const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(rlsRegex.test(schemaSql)).toBe(true);
    }
  });

  it('memvalidasi kebijakan izin akses authenticated pada unit_daily_reports dan business_units', () => {
    expect(schemaSql).toContain('CREATE POLICY "Izin baca rekap gerai authenticated"');
    expect(schemaSql).toContain('CREATE POLICY "Izin kelola rekap gerai authenticated"');
    expect(schemaSql).toContain('CREATE POLICY "Izin baca gerai authenticated"');
    expect(schemaSql).toContain('CREATE POLICY "Izin kelola gerai authenticated"');
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
