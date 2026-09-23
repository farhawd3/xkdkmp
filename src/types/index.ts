export type UserRole =
  | "admin"
  | "manajer"
  | "bendahara"
  | "pengurus"
  | "pengawas"
  | "operator"
  | "kasir"
  | "anggota";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unitId?: string;
  unitName?: string;
  avatarUrl?: string;
}

export type OrgBusinessStatus = "persiapan" | "siap_buka" | "aktif" | "ditutup_sementara";

export type UnitStatus = "rencana" | "persiapan" | "siap_buka" | "aktif" | "nonaktif";

export interface UnitStatusHistory {
  fromStatus: UnitStatus;
  toStatus: UnitStatus;
  timestamp: string;
  actor: string;
  notes: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  type: string;
  status: UnitStatus;
  picName: string;
  readinessPercentage: number;
  operationalStartDate: string | null;
  statusHistory: UnitStatusHistory[];
  prerequisitesMet: boolean;
  missingRequirements: string[];
}

export type MemberStatus = "calon" | "terverifikasi" | "aktif" | "nonaktif" | "keluar";

export interface Member {
  id: string;
  memberNo: string;
  fullName: string;
  maskedNik: string;
  phone: string;
  domicile: string;
  birthDate?: string;
  job?: string;
  joinDate: string;
  status: MemberStatus;
  simpananPokokPaid: boolean;
  simpananWajibPaid: boolean;
  simpananPokokAmount: number;
  simpananWajibAmount: number;
  notes?: string;
  documentStatus: "belum_unggah" | "menunggu_verifikasi" | "terverifikasi";
  isArchived?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: "beras" | "minyak_goreng" | "gula_tepung" | "telur" | "bumbu_dapur" | "lainnya";
  baseUnit: string;
  conversionUnit?: string;
  conversionFactor?: number;
  barcode?: string;
  estimatedCost: number;
  sellingPrice: number;
  minStock: number;
  currentStock: number;
  hasExpiry: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  suppliedCategory: string;
  poHistoryCount: number;
  isArchived: boolean;
  createdAt: string;
}

export interface OrganizationProfile {
  displayName: string;
  legalName: string;
  region: string;
  fullAddress: string;
  fiscalYear: string;
  timeZone: "Asia/Jakarta";
  legalDocStatus: "belum_diunggah" | "dalam_proses" | "terbit";
  npwpKoperasi: string;
  rekeningBank: string;
  bankName: string;
}

export type ChecklistCategory =
  | "legalitas"
  | "pendataan_anggota"
  | "anggaran"
  | "tempat_fisik"
  | "pemasok_produk"
  | "sop"
  | "sdm_petugas"
  | "keuangan_bank"
  | "uji_sistem"
  | "keputusan_pembukaan";

export type ChecklistStatus = "belum_selesai" | "dalam_proses" | "selesai";

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  isRequired: boolean;
  picName?: string;
  targetDate?: string;
  status: ChecklistStatus;
  reasonOrNotes?: string;
  proofFileName?: string;
  sourceUrl?: string;
  relatedTaskId?: string;
  completedAt?: string | null;
  updatedAt?: string;
}

export type OperationalDataState = "unconfigured" | "zero_recorded" | "error" | "ready";

export type TaskPriority = "tinggi" | "sedang" | "rendah";

export type TaskStatus = "rencana" | "dalam_proses" | "selesai" | "dibatalkan";

export type PoacCategory = "planning" | "organizing" | "actuating" | "controlling";

export interface TaskChecklistStep {
  id: string;
  text: string;
  isDone: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  poacCategory: PoacCategory;
  picName: string;
  dueDate: string;
  checklistSteps?: TaskChecklistStep[];
  attachmentName?: string;
  relatedUnitId?: string;
  relatedChecklistId?: string;
  previousStatus?: TaskStatus;
  notes?: string;
}

export type AgendaCategory = "rapat_pengurus" | "audit" | "operasional" | "legalitas";

export type AgendaStatus = "terjadwal" | "selesai" | "dibatalkan";

export interface AgendaItem {
  id: string;
  title: string;
  category: AgendaCategory;
  date: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  timeZone: "Asia/Jakarta";
  picName: string;
  unitId?: string;
  locationType: "fisik" | "online";
  locationAddress?: string;
  meetingUrl?: string;
  description?: string;
  attachmentName?: string;
  relatedTaskId?: string;
  status: AgendaStatus;
  cancellationReason?: string;
  rescheduledFrom?: string;
}

export interface WorkPlanItem {
  id: string;
  goal: string;
  indicator: string;
  targetValue: string;
  program: string;
  estimatedCost: number;
  picName: string;
  dueDate: string;
  status: "draft" | "ditinjau" | "disetujui";
}

export type RiskCategory = "kepatuhan" | "manajemen" | "bisnis" | "operasional" | "tata_kelola";

export interface RiskItem {
  id: string;
  category: RiskCategory;
  title: string;
  impact: "tinggi" | "sedang" | "rendah";
  likelihood: "tinggi" | "sedang" | "rendah";
  mitigationPlan: string;
  ownerName: string;
  followUpStatus: "belum_ditangani" | "dalam_mitigasi" | "terkendali";
  proofNotes?: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  docType: "ad_art" | "legalitas" | "sop" | "notulen" | "keputusan";
  version: string;
  ownerName: string;
  date: string;
  status: "draft" | "peninjauan" | "disahkan";
  attachmentFileName?: string;
  notes?: string;
  meetingAttendees?: string[];
  meetingDecisions?: string[];
}

export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  location: string;
  condition: "baik" | "perlu_perbaikan" | "rusak";
  picName: string;
  acquisitionCost: number;
  purchaseDocName?: string;
  notes?: string;
  isArchived: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeType?: "crimson" | "amber" | "info" | "neutral";
  children?: NavItem[];
}

// ==========================================
// Tipe Data Tahap 06: Pembelian, Stok & Kasir
// ==========================================

export type PurchaseOrderStatus =
  | "draft"
  | "diajukan"
  | "disetujui"
  | "diterima_sebagian"
  | "selesai"
  | "ditolak";

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  invoicedQty: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: PurchaseOrderStatus;
  paymentStatus: "belum_ditagih" | "sebagian_ditagih" | "menunggu_bayar" | "lunas";
  rejectionReason?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface GoodsReceiptItem {
  productId: string;
  productName: string;
  receivedQty: number;
  damagedQty: number;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poId: string;
  poNumber: string;
  deliveryNoteNumber: string;
  receivedDate: string;
  receivedBy: string;
  items: GoodsReceiptItem[];
  notes?: string;
  status: "diverifikasi" | "diposting";
  createdAt: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  receiptId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "belum_bayar" | "sebagian" | "lunas";
  proofFileName?: string;
}

export type StockMutationType =
  | "masuk_po"
  | "keluar_kasir"
  | "retur_penjualan"
  | "retur_pembelian"
  | "opname_penyesuaian"
  | "karantina_rusak";

export interface StockMutation {
  id: string;
  productId: string;
  productName: string;
  mutationType: StockMutationType;
  referenceNumber: string;
  date: string;
  qtyChange: number;
  qtyBefore: number;
  qtyAfter: number;
  notes?: string;
  operatorName: string;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  systemQty: number;
  physicalQty: number;
  diffQty: number;
  reason: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string;
  date: string;
  performedBy: string;
  items: StockOpnameItem[];
  status: "usulan" | "disetujui" | "ditolak";
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface CashierShift {
  id: string;
  cashierName: string;
  registerNumber: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  systemExpectedCash?: number;
  physicalCashCount?: number;
  discrepancy?: number;
  discrepancyReason?: string;
  status: "buka" | "tutup";
  totalSalesCount: number;
  totalSalesAmount: number;
}

export interface PosCartItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface PosTransaction {
  id: string;
  receiptNumber: string;
  shiftId: string;
  timestamp: string;
  cashierName: string;
  customerType: "umum" | "anggota";
  memberId?: string;
  memberName?: string;
  items: PosCartItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: "tunai" | "transfer_manual" | "qris_manual";
  cashReceived?: number;
  cashChange?: number;
  referenceNumber?: string;
  isReturned: boolean;
}

export interface PosReturn {
  id: string;
  returnNumber: string;
  originalReceiptNumber: string;
  timestamp: string;
  authorizedBy: string;
  reason: "cacat_rusak" | "salah_beli" | "kedaluwarsa";
  returnedItems: {
    productId: string;
    name: string;
    quantity: number;
    refundAmount: number;
  }[];
  totalRefund: number;
  allocatedTo: "karantina" | "stok_jual";
}

// ==========================================
// Tipe Data Tahap 07: Keuangan & Laporan
// ==========================================

export type CashAccountType = "kas_tunai" | "bank";

export interface CashAccount {
  id: string;
  code: string;
  name: string;
  type: CashAccountType;
  balance: number;
  status: "belum_ditetapkan" | "terverifikasi";
  accountNumber?: string;
  bankName?: string;
}

export type CashTransactionType = "masuk" | "keluar" | "transfer_internal";

export type CashTransactionCategory =
  | "simpanan_anggota"
  | "beban_persiapan"
  | "operasional_toko"
  | "mutasi_internal"
  | "lainnya";

export interface CashTransaction {
  id: string;
  trxNumber: string;
  type: CashTransactionType;
  category: CashTransactionCategory;
  sourceAccountId: string;
  targetAccountId?: string;
  amount: number;
  date: string;
  description: string;
  proofFileName?: string;
  createdBy: string;
  verifiedBy?: string;
  memberId?: string;
  memberName?: string;
  isSimulatedDemo?: boolean;
}

export interface MemberDepositRecord {
  id: string;
  depositNumber: string;
  memberId: string;
  memberName: string;
  depositType: "pokok" | "wajib" | "sukarela";
  amount: number;
  date: string;
  targetAccountId: string;
  proofFileName?: string;
  recordedBy: string;
  notes?: string;
}

export interface JournalEntryLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export type JournalStatus = "draft" | "posted" | "reversed";

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  referenceNumber?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: JournalStatus;
  createdBy: string;
  postedAt?: string;
  isReversal?: boolean;
  reversalOfId?: string;
}

export interface FinancialReportSummary {
  period: string;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  totalCash: number;
  totalInventory: number;
  totalFixedAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}


