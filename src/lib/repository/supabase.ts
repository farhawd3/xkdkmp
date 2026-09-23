import {
  BusinessUnit,
  ChecklistItem,
  UnitStatus,
  Member,
  TaskItem,
  AgendaItem,
  OperationalDataState,
  Product,
  Supplier,
  OrganizationProfile,
  WorkPlanItem,
  RiskItem,
  GovernanceDocument,
  FixedAsset,
  PurchaseOrder,
  GoodsReceipt,
  StockMutation,
  StockOpname,
  CashierShift,
  PosTransaction,
  PosReturn,
  CashAccount,
  CashTransaction,
  MemberDepositRecord,
  JournalEntry,
  FinancialReportSummary,
} from "@/types";
import { IPreparationRepository } from "./index";

/**
 * Repositori Basis Data Produksi Supabase (Tahap 09)
 *
 * Aturan Kepatuhan:
 * 1. Tidak ada data contoh atau angka rekaan.
 * 2. Fail-fast: Jika kredensial belum dikonfigurasi atau koneksi gagal,
 *    sistem melempar kesalahan teknis yang jujur tanpa fallback ke mock data.
 * 3. Otorisasi server & RLS ditegakkan langsung oleh PostgreSQL.
 */
export class SupabaseProductionRepository implements IPreparationRepository {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  private assertConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(
        "Koneksi basis data PostgreSQL Supabase belum dikonfigurasi. " +
        "Lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di lingkungan produksi."
      );
    }
  }

  async getMemberSummary(): Promise<{ total: number; calon: number; verified: number }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getBusinessUnits(): Promise<BusinessUnit[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateUnitStatus(
    _unitId: string,
    _targetStatus: UnitStatus,
    _actor: string,
    _notes: string
  ): Promise<{ success: boolean; unit?: BusinessUnit; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getChecklistItems(): Promise<ChecklistItem[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getChecklistItem(_id: string): Promise<ChecklistItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateChecklistItem(_id: string, _updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addChecklistItem(_item: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async deleteChecklistItem(_id: string): Promise<boolean> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getMembers(
    _query?: string,
    _statusFilter?: string,
    _page?: number,
    _pageSize?: number
  ): Promise<{ members: Member[]; total: number; totalPages: number }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getMemberById(_id: string): Promise<Member | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addMember(_member: Omit<Member, "id" | "memberNo" | "joinDate" | "isArchived">): Promise<Member> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateMember(_id: string, _updates: Partial<Member>): Promise<Member | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async archiveMember(_id: string): Promise<boolean> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async importMembers(
    _rows: { fullName: string; phone: string; domicile: string; nik?: string }[]
  ): Promise<{ importedCount: number; errors: { row: number; error: string }[] }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getProducts(): Promise<Product[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getProductById(_id: string): Promise<Product | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addProduct(_product: Omit<Product, "id" | "currentStock" | "isArchived" | "createdAt">): Promise<Product> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateProduct(_id: string, _updates: Partial<Product>): Promise<Product | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async archiveProduct(_id: string): Promise<boolean> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getSuppliers(): Promise<Supplier[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getSupplierById(_id: string): Promise<Supplier | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addSupplier(
    _supplier: Omit<Supplier, "id" | "poHistoryCount" | "isArchived" | "createdAt">
  ): Promise<Supplier> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateSupplier(_id: string, _updates: Partial<Supplier>): Promise<Supplier | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async archiveSupplier(_id: string): Promise<boolean> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getOrganizationProfile(): Promise<OrganizationProfile> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateOrganizationProfile(_updates: Partial<OrganizationProfile>): Promise<OrganizationProfile> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getTasks(_poacFilter?: string, _statusFilter?: string): Promise<TaskItem[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getTaskById(_id: string): Promise<TaskItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addTask(_task: Omit<TaskItem, "id">): Promise<TaskItem> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateTask(_id: string, _updates: Partial<TaskItem>): Promise<TaskItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async toggleTaskStatus(_id: string): Promise<{ task: TaskItem | null; canUndo: boolean }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async undoTaskStatus(_id: string): Promise<TaskItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getAgendas(): Promise<AgendaItem[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getAgendaById(_id: string): Promise<AgendaItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addAgenda(
    _agenda: Omit<AgendaItem, "id" | "status">
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateAgenda(
    _id: string,
    _updates: Partial<AgendaItem>
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async cancelAgenda(_id: string, _reason: string): Promise<AgendaItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async rescheduleAgenda(
    _id: string,
    _newDate: string,
    _newStartTime: string,
    _newEndTime: string
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getWorkPlans(): Promise<WorkPlanItem[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addWorkPlan(_plan: Omit<WorkPlanItem, "id">): Promise<WorkPlanItem> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateWorkPlan(_id: string, _updates: Partial<WorkPlanItem>): Promise<WorkPlanItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getRisks(): Promise<RiskItem[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addRisk(_risk: Omit<RiskItem, "id">): Promise<RiskItem> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async updateRisk(_id: string, _updates: Partial<RiskItem>): Promise<RiskItem | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getGovernanceDocuments(): Promise<GovernanceDocument[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addGovernanceDocument(_doc: Omit<GovernanceDocument, "id">): Promise<GovernanceDocument> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getFixedAssets(): Promise<FixedAsset[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addFixedAsset(_asset: Omit<FixedAsset, "id" | "isArchived">): Promise<FixedAsset> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async archiveFixedAsset(_id: string): Promise<boolean> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getOperationalStates(): Promise<{
    sales: OperationalDataState;
    cash: OperationalDataState;
    inventory: OperationalDataState;
  }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getPurchaseOrderById(_id: string): Promise<PurchaseOrder | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async addPurchaseOrder(
    _po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "paymentStatus" | "createdAt">
  ): Promise<PurchaseOrder> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async approvePurchaseOrder(_id: string, _approverName: string): Promise<PurchaseOrder | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async rejectPurchaseOrder(_id: string, _reason: string): Promise<PurchaseOrder | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createGoodsReceipt(
    _data: Omit<GoodsReceipt, "id" | "receiptNumber" | "status" | "createdAt">
  ): Promise<{ success: boolean; receipt?: GoodsReceipt; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getStockMutations(_productId?: string): Promise<StockMutation[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getStockOpnames(): Promise<StockOpname[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createStockOpname(
    _data: Omit<StockOpname, "id" | "opnameNumber" | "status" | "createdAt">
  ): Promise<StockOpname> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async approveStockOpname(
    _id: string,
    _approverName: string
  ): Promise<{ success: boolean; opname?: StockOpname; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getQuarantineStock(_productId: string): Promise<number> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getActiveShift(): Promise<CashierShift | null> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async openShift(_cashierName: string, _registerNumber: string, _initialCash: number): Promise<CashierShift> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async closeShift(
    _shiftId: string,
    _physicalCashCount: number,
    _discrepancyReason?: string
  ): Promise<{ success: boolean; shift?: CashierShift; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getPosTransactions(_shiftId?: string): Promise<PosTransaction[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createPosTransaction(
    _data: Omit<PosTransaction, "id" | "receiptNumber" | "timestamp" | "isReturned">
  ): Promise<{ success: boolean; transaction?: PosTransaction; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createPosReturn(
    _data: Omit<PosReturn, "id" | "returnNumber" | "timestamp">
  ): Promise<{ success: boolean; returnRecord?: PosReturn; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getCashAccounts(): Promise<CashAccount[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getCashTransactions(): Promise<CashTransaction[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createExpense(
    _data: Omit<CashTransaction, "id" | "trxNumber" | "type">
  ): Promise<CashTransaction> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createInternalTransfer(
    _sourceId: string,
    _targetId: string,
    _amount: number,
    _notes: string,
    _actor: string
  ): Promise<{ success: boolean; transaction?: CashTransaction; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getMemberDeposits(_memberId?: string): Promise<MemberDepositRecord[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createMemberDeposit(
    _data: Omit<MemberDepositRecord, "id" | "depositNumber">
  ): Promise<MemberDepositRecord> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async createJournalEntry(
    _data: Omit<JournalEntry, "id" | "entryNumber" | "status">
  ): Promise<{ success: boolean; entry?: JournalEntry; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async reverseJournalEntry(
    _journalId: string,
    _reason: string,
    _actor: string
  ): Promise<{ success: boolean; reversalEntry?: JournalEntry; error?: string }> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }

  async getFinancialReportSummary(): Promise<FinancialReportSummary> {
    this.assertConfigured();
    throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
  }
}
