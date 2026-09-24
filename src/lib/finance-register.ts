/** Baris rekap gerai, bukan jurnal debit/kredit atau buku besar akuntansi. */
export interface FinanceRegisterRow {
  id: string;
  reportDate: string;
  unitName: string;
  unitCode: string | null;
  grossRevenue: number;
  operationalExpenses: number;
  reportedCash: number | null;
  sourceType: string;
}

export interface FinanceRegisterResponse {
  month: string;
  page: number;
  pageSize: number;
  total: number;
  rows: FinanceRegisterRow[];
}
