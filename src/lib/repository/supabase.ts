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
import type { IPreparationRepository } from "./index";

/**
 * Repositori Basis Data Produksi Supabase
 *
 * Aturan Kepatuhan:
 * 1. Tidak ada data contoh transaksi/keuangan rekaan di produksi.
 * 2. Fail-fast: Jika kredensial belum dikonfigurasi, sistem melempar
 *    kesalahan teknis yang jujur tanpa fallback data.
 * 3. Dalam mode persiapan, data instrumen persiapan pra-operasional
 *    dilayani secara proporsional dan mutasi operasional nyata
 *    dihubungkan secara atomik di Tahap 11.
 */
export class SupabaseProductionRepository implements IPreparationRepository {
  private isConfigured: boolean;
  private delegate?: IPreparationRepository;

  constructor(delegate?: IPreparationRepository) {
    this.isConfigured = !!(
      typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    this.delegate = delegate;
  }

  private assertConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(
        "Koneksi basis data PostgreSQL Supabase belum dikonfigurasi. " +
        "Lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di lingkungan produksi."
      );
    }
  }

  private getActiveDelegate(): IPreparationRepository {
    this.assertConfigured();
    if (!this.delegate) {
      throw new Error("Koneksi klien Supabase produksi aktif pada Tahap 10.");
    }
    return this.delegate;
  }

  async getMemberSummary(): Promise<{ total: number; calon: number; verified: number }> {
    return this.getActiveDelegate().getMemberSummary();
  }

  async getBusinessUnits(): Promise<BusinessUnit[]> {
    return this.getActiveDelegate().getBusinessUnits();
  }

  async updateUnitStatus(
    unitId: string,
    targetStatus: UnitStatus,
    actor: string,
    notes: string
  ): Promise<{ success: boolean; unit?: BusinessUnit; error?: string }> {
    return this.getActiveDelegate().updateUnitStatus(unitId, targetStatus, actor, notes);
  }

  async getChecklistItems(): Promise<ChecklistItem[]> {
    return this.getActiveDelegate().getChecklistItems();
  }

  async getChecklistItem(id: string): Promise<ChecklistItem | null> {
    return this.getActiveDelegate().getChecklistItem(id);
  }

  async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    return this.getActiveDelegate().updateChecklistItem(id, updates);
  }

  async addChecklistItem(item: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    return this.getActiveDelegate().addChecklistItem(item);
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    return this.getActiveDelegate().deleteChecklistItem(id);
  }

  async getMembers(
    query?: string,
    statusFilter?: string,
    page?: number,
    pageSize?: number
  ): Promise<{ members: Member[]; total: number; totalPages: number }> {
    return this.getActiveDelegate().getMembers(query, statusFilter, page, pageSize);
  }

  async getMemberById(id: string): Promise<Member | null> {
    return this.getActiveDelegate().getMemberById(id);
  }

  async addMember(member: Omit<Member, "id" | "memberNo" | "joinDate" | "isArchived">): Promise<Member> {
    return this.getActiveDelegate().addMember(member);
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    return this.getActiveDelegate().updateMember(id, updates);
  }

  async archiveMember(id: string): Promise<boolean> {
    return this.getActiveDelegate().archiveMember(id);
  }

  async importMembers(
    rows: { fullName: string; phone: string; domicile: string; nik?: string }[]
  ): Promise<{ importedCount: number; errors: { row: number; error: string }[] }> {
    return this.getActiveDelegate().importMembers(rows);
  }

  async getProducts(): Promise<Product[]> {
    return this.getActiveDelegate().getProducts();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.getActiveDelegate().getProductById(id);
  }

  async addProduct(product: Omit<Product, "id" | "currentStock" | "isArchived" | "createdAt">): Promise<Product> {
    return this.getActiveDelegate().addProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return this.getActiveDelegate().updateProduct(id, updates);
  }

  async archiveProduct(id: string): Promise<boolean> {
    return this.getActiveDelegate().archiveProduct(id);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.getActiveDelegate().getSuppliers();
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.getActiveDelegate().getSupplierById(id);
  }

  async addSupplier(
    supplier: Omit<Supplier, "id" | "poHistoryCount" | "isArchived" | "createdAt">
  ): Promise<Supplier> {
    return this.getActiveDelegate().addSupplier(supplier);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    return this.getActiveDelegate().updateSupplier(id, updates);
  }

  async archiveSupplier(id: string): Promise<boolean> {
    return this.getActiveDelegate().archiveSupplier(id);
  }

  async getOrganizationProfile(): Promise<OrganizationProfile> {
    return this.getActiveDelegate().getOrganizationProfile();
  }

  async updateOrganizationProfile(updates: Partial<OrganizationProfile>): Promise<OrganizationProfile> {
    return this.getActiveDelegate().updateOrganizationProfile(updates);
  }

  async getTasks(poacFilter?: string, statusFilter?: string): Promise<TaskItem[]> {
    return this.getActiveDelegate().getTasks(poacFilter, statusFilter);
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    return this.getActiveDelegate().getTaskById(id);
  }

  async addTask(task: Omit<TaskItem, "id">): Promise<TaskItem> {
    return this.getActiveDelegate().addTask(task);
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> {
    return this.getActiveDelegate().updateTask(id, updates);
  }

  async toggleTaskStatus(id: string): Promise<{ task: TaskItem | null; canUndo: boolean }> {
    return this.getActiveDelegate().toggleTaskStatus(id);
  }

  async undoTaskStatus(id: string): Promise<TaskItem | null> {
    return this.getActiveDelegate().undoTaskStatus(id);
  }

  async getAgendas(): Promise<AgendaItem[]> {
    return this.getActiveDelegate().getAgendas();
  }

  async getAgendaById(id: string): Promise<AgendaItem | null> {
    return this.getActiveDelegate().getAgendaById(id);
  }

  async addAgenda(
    agenda: Omit<AgendaItem, "id" | "status">
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    return this.getActiveDelegate().addAgenda(agenda);
  }

  async updateAgenda(
    id: string,
    updates: Partial<AgendaItem>
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    return this.getActiveDelegate().updateAgenda(id, updates);
  }

  async cancelAgenda(id: string, reason: string): Promise<AgendaItem | null> {
    return this.getActiveDelegate().cancelAgenda(id, reason);
  }

  async rescheduleAgenda(
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    return this.getActiveDelegate().rescheduleAgenda(id, newDate, newStartTime, newEndTime);
  }

  async getWorkPlans(): Promise<WorkPlanItem[]> {
    return this.getActiveDelegate().getWorkPlans();
  }

  async addWorkPlan(plan: Omit<WorkPlanItem, "id">): Promise<WorkPlanItem> {
    return this.getActiveDelegate().addWorkPlan(plan);
  }

  async updateWorkPlan(id: string, updates: Partial<WorkPlanItem>): Promise<WorkPlanItem | null> {
    return this.getActiveDelegate().updateWorkPlan(id, updates);
  }

  async getRisks(): Promise<RiskItem[]> {
    return this.getActiveDelegate().getRisks();
  }

  async addRisk(risk: Omit<RiskItem, "id">): Promise<RiskItem> {
    return this.getActiveDelegate().addRisk(risk);
  }

  async updateRisk(id: string, updates: Partial<RiskItem>): Promise<RiskItem | null> {
    return this.getActiveDelegate().updateRisk(id, updates);
  }

  async getGovernanceDocuments(): Promise<GovernanceDocument[]> {
    return this.getActiveDelegate().getGovernanceDocuments();
  }

  async addGovernanceDocument(doc: Omit<GovernanceDocument, "id">): Promise<GovernanceDocument> {
    return this.getActiveDelegate().addGovernanceDocument(doc);
  }

  async getFixedAssets(): Promise<FixedAsset[]> {
    return this.getActiveDelegate().getFixedAssets();
  }

  async addFixedAsset(asset: Omit<FixedAsset, "id" | "isArchived">): Promise<FixedAsset> {
    return this.getActiveDelegate().addFixedAsset(asset);
  }

  async archiveFixedAsset(id: string): Promise<boolean> {
    return this.getActiveDelegate().archiveFixedAsset(id);
  }

  async getOperationalStates(): Promise<{
    sales: OperationalDataState;
    cash: OperationalDataState;
    inventory: OperationalDataState;
  }> {
    return this.getActiveDelegate().getOperationalStates();
  }

  // --- Tahap 06: Pengadaan (PO), Stok & Kasir ---
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.getActiveDelegate().getPurchaseOrders();
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    return this.getActiveDelegate().getPurchaseOrderById(id);
  }

  async addPurchaseOrder(
    po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "paymentStatus" | "createdAt">
  ): Promise<PurchaseOrder> {
    return this.getActiveDelegate().addPurchaseOrder(po);
  }

  async approvePurchaseOrder(id: string, approverName: string): Promise<PurchaseOrder | null> {
    return this.getActiveDelegate().approvePurchaseOrder(id, approverName);
  }

  async rejectPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder | null> {
    return this.getActiveDelegate().rejectPurchaseOrder(id, reason);
  }

  async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    return this.getActiveDelegate().getGoodsReceipts();
  }

  async createGoodsReceipt(
    data: Omit<GoodsReceipt, "id" | "receiptNumber" | "status" | "createdAt">
  ): Promise<{ success: boolean; receipt?: GoodsReceipt; error?: string }> {
    return this.getActiveDelegate().createGoodsReceipt(data);
  }

  async getStockMutations(productId?: string): Promise<StockMutation[]> {
    return this.getActiveDelegate().getStockMutations(productId);
  }

  async getStockOpnames(): Promise<StockOpname[]> {
    return this.getActiveDelegate().getStockOpnames();
  }

  async createStockOpname(
    data: Omit<StockOpname, "id" | "opnameNumber" | "status" | "createdAt">
  ): Promise<StockOpname> {
    return this.getActiveDelegate().createStockOpname(data);
  }

  async approveStockOpname(
    id: string,
    approverName: string
  ): Promise<{ success: boolean; opname?: StockOpname; error?: string }> {
    return this.getActiveDelegate().approveStockOpname(id, approverName);
  }

  async getQuarantineStock(productId: string): Promise<number> {
    return this.getActiveDelegate().getQuarantineStock(productId);
  }

  async getActiveShift(): Promise<CashierShift | null> {
    return this.getActiveDelegate().getActiveShift();
  }

  async openShift(cashierName: string, registerNumber: string, initialCash: number): Promise<CashierShift> {
    return this.getActiveDelegate().openShift(cashierName, registerNumber, initialCash);
  }

  async closeShift(
    shiftId: string,
    physicalCashCount: number,
    discrepancyReason?: string
  ): Promise<{ success: boolean; shift?: CashierShift; error?: string }> {
    return this.getActiveDelegate().closeShift(shiftId, physicalCashCount, discrepancyReason);
  }

  async getPosTransactions(shiftId?: string): Promise<PosTransaction[]> {
    return this.getActiveDelegate().getPosTransactions(shiftId);
  }

  async createPosTransaction(
    data: Omit<PosTransaction, "id" | "receiptNumber" | "timestamp" | "isReturned">
  ): Promise<{ success: boolean; transaction?: PosTransaction; error?: string }> {
    return this.getActiveDelegate().createPosTransaction(data);
  }

  async createPosReturn(
    data: Omit<PosReturn, "id" | "returnNumber" | "timestamp">
  ): Promise<{ success: boolean; returnRecord?: PosReturn; error?: string }> {
    return this.getActiveDelegate().createPosReturn(data);
  }

  // --- Tahap 07: Keuangan, Jurnal & Laporan ---
  async getCashAccounts(): Promise<CashAccount[]> {
    return this.getActiveDelegate().getCashAccounts();
  }

  async getCashTransactions(): Promise<CashTransaction[]> {
    return this.getActiveDelegate().getCashTransactions();
  }

  async createExpense(
    data: Omit<CashTransaction, "id" | "trxNumber" | "type">
  ): Promise<CashTransaction> {
    return this.getActiveDelegate().createExpense(data);
  }

  async createInternalTransfer(
    sourceId: string,
    targetId: string,
    amount: number,
    notes: string,
    actor: string
  ): Promise<{ success: boolean; transaction?: CashTransaction; error?: string }> {
    return this.getActiveDelegate().createInternalTransfer(sourceId, targetId, amount, notes, actor);
  }

  async getMemberDeposits(memberId?: string): Promise<MemberDepositRecord[]> {
    return this.getActiveDelegate().getMemberDeposits(memberId);
  }

  async createMemberDeposit(
    data: Omit<MemberDepositRecord, "id" | "depositNumber">
  ): Promise<MemberDepositRecord> {
    return this.getActiveDelegate().createMemberDeposit(data);
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return this.getActiveDelegate().getJournalEntries();
  }

  async createJournalEntry(
    data: Omit<JournalEntry, "id" | "entryNumber" | "status">
  ): Promise<{ success: boolean; entry?: JournalEntry; error?: string }> {
    return this.getActiveDelegate().createJournalEntry(data);
  }

  async reverseJournalEntry(
    journalId: string,
    reason: string,
    actor: string
  ): Promise<{ success: boolean; reversalEntry?: JournalEntry; error?: string }> {
    return this.getActiveDelegate().reverseJournalEntry(journalId, reason, actor);
  }

  async getFinancialReportSummary(): Promise<FinancialReportSummary> {
    return this.getActiveDelegate().getFinancialReportSummary();
  }
}
