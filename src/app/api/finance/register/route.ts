import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";
import { getCurrentYearMonthWIB } from "@/lib/utils";
import type { FinanceRegisterRow } from "@/lib/finance-register";

const QuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
const PAGE_SIZE = 25;

function amount(value: unknown): number {
  const raw = String(value);
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error("Nilai uang rekap tidak valid.");
  const parsed = Number(raw);
  if (!Number.isSafeInteger(Math.round(parsed * 100))) throw new Error("Nilai uang rekap melebihi batas aman.");
  return parsed;
}

export async function GET(request: Request) {
  const access = verifyPrivateApiAccess(request);
  if (!access.allowed) return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Bulan atau halaman tidak valid." }, { status: 400 });

  const month = parsed.data.month || getCurrentYearMonthWIB();
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10);
  const start = (parsed.data.page - 1) * PAGE_SIZE;

  try {
    const supabase = await createClient();
    const { data, count, error } = await supabase
      .from("unit_daily_reports")
      .select("id, report_date, gross_revenue, operational_expenses, cash_in_hand, source_type, business_units(name, code)", { count: "exact" })
      .gte("report_date", `${month}-01`)
      .lt("report_date", nextMonth)
      .order("report_date", { ascending: false })
      .order("id", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) return NextResponse.json({ error: `Buku rekap belum dapat dimuat: ${error.message}` }, { status: 500 });
    if (count === null) return NextResponse.json({ error: "Jumlah rekap belum diketahui; daftar tidak ditampilkan agar halaman tidak menyesatkan." }, { status: 500 });

    const rows: FinanceRegisterRow[] = (data ?? []).map((item) => {
      const unit = Array.isArray(item.business_units) ? item.business_units[0] : item.business_units;
      return {
        id: item.id,
        reportDate: item.report_date,
        unitName: unit?.name || "Gerai tidak ditemukan",
        unitCode: unit?.code || null,
        grossRevenue: amount(item.gross_revenue),
        operationalExpenses: amount(item.operational_expenses),
        reportedCash: item.cash_in_hand === null ? null : amount(item.cash_in_hand),
        sourceType: item.source_type || "tidak diketahui",
      };
    });
    return NextResponse.json({ month, page: parsed.data.page, pageSize: PAGE_SIZE, total: count, rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Buku rekap belum dapat dimuat." }, { status: 500 });
  }
}
