import {
  BusinessUnit,
  ChecklistItem,
  ChecklistCategory,
  ChecklistStatus,
  UnitStatus,
  Member,
  TaskItem,
  AgendaItem,
  OperationalDataState,
  Product,
  Supplier,
  OrganizationProfile,
  PoacCategory,
  AgendaStatus,
  WorkPlanItem,
  RiskItem,
  GovernanceDocument,
  FixedAsset,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  SupplierInvoice,
  StockMutation,
  StockOpname,
  CashierShift,
  PosTransaction,
  PosReturn,
  PosCartItem,
  CashAccount,
  CashTransaction,
  MemberDepositRecord,
  JournalEntryLine,
  JournalEntry,
  FinancialReportSummary,
} from "@/types";
import { formatRupiah } from "@/lib/utils";

/**
 * Interface repositori data untuk persiapan operasional koperasi.
 */
export interface IPreparationRepository {
  getMemberSummary(): Promise<{ total: number; calon: number; verified: number }>;
  getBusinessUnits(): Promise<BusinessUnit[]>;
  updateUnitStatus(
    unitId: string,
    targetStatus: UnitStatus,
    actor: string,
    notes: string
  ): Promise<{ success: boolean; unit?: BusinessUnit; error?: string }>;
  getChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItem(id: string): Promise<ChecklistItem | null>;
  updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null>;
  addChecklistItem(item: Omit<ChecklistItem, "id">): Promise<ChecklistItem>;
  deleteChecklistItem(id: string): Promise<boolean>;
  getMembers(
    query?: string,
    statusFilter?: string,
    page?: number,
    pageSize?: number
  ): Promise<{ members: Member[]; total: number; totalPages: number }>;
  getMemberById(id: string): Promise<Member | null>;
  addMember(member: Omit<Member, "id" | "memberNo" | "joinDate" | "isArchived">): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member | null>;
  archiveMember(id: string): Promise<boolean>;
  importMembers(
    rows: { fullName: string; phone: string; domicile: string; nik?: string }[]
  ): Promise<{ importedCount: number; errors: { row: number; error: string }[] }>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  addProduct(product: Omit<Product, "id" | "currentStock" | "isArchived" | "createdAt">): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
  archiveProduct(id: string): Promise<boolean>;
  getSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: string): Promise<Supplier | null>;
  addSupplier(
    supplier: Omit<Supplier, "id" | "poHistoryCount" | "isArchived" | "createdAt">
  ): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null>;
  archiveSupplier(id: string): Promise<boolean>;
  getOrganizationProfile(): Promise<OrganizationProfile>;
  updateOrganizationProfile(updates: Partial<OrganizationProfile>): Promise<OrganizationProfile>;
  getTasks(poacFilter?: string, statusFilter?: string): Promise<TaskItem[]>;
  getTaskById(id: string): Promise<TaskItem | null>;
  addTask(task: Omit<TaskItem, "id">): Promise<TaskItem>;
  updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null>;
  toggleTaskStatus(id: string): Promise<{ task: TaskItem | null; canUndo: boolean }>;
  undoTaskStatus(id: string): Promise<TaskItem | null>;
  getAgendas(): Promise<AgendaItem[]>;
  getAgendaById(id: string): Promise<AgendaItem | null>;
  addAgenda(
    agenda: Omit<AgendaItem, "id" | "status">
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }>;
  updateAgenda(
    id: string,
    updates: Partial<AgendaItem>
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }>;
  cancelAgenda(id: string, reason: string): Promise<AgendaItem | null>;
  rescheduleAgenda(
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }>;
  getWorkPlans(): Promise<WorkPlanItem[]>;
  addWorkPlan(plan: Omit<WorkPlanItem, "id">): Promise<WorkPlanItem>;
  updateWorkPlan(id: string, updates: Partial<WorkPlanItem>): Promise<WorkPlanItem | null>;
  getRisks(): Promise<RiskItem[]>;
  addRisk(risk: Omit<RiskItem, "id">): Promise<RiskItem>;
  updateRisk(id: string, updates: Partial<RiskItem>): Promise<RiskItem | null>;
  getGovernanceDocuments(): Promise<GovernanceDocument[]>;
  addGovernanceDocument(doc: Omit<GovernanceDocument, "id">): Promise<GovernanceDocument>;
  getFixedAssets(): Promise<FixedAsset[]>;
  addFixedAsset(asset: Omit<FixedAsset, "id" | "isArchived">): Promise<FixedAsset>;
  archiveFixedAsset(id: string): Promise<boolean>;
  getOperationalStates(): Promise<{
    sales: OperationalDataState;
    cash: OperationalDataState;
    inventory: OperationalDataState;
  }>;

  // --- Tahap 06: Pengadaan (PO), Stok & Kasir ---
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder | null>;
  addPurchaseOrder(
    po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "paymentStatus" | "createdAt">
  ): Promise<PurchaseOrder>;
  approvePurchaseOrder(id: string, approverName: string): Promise<PurchaseOrder | null>;
  rejectPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder | null>;
  getGoodsReceipts(): Promise<GoodsReceipt[]>;
  createGoodsReceipt(
    data: Omit<GoodsReceipt, "id" | "receiptNumber" | "status" | "createdAt">
  ): Promise<{ success: boolean; receipt?: GoodsReceipt; error?: string }>;
  getStockMutations(productId?: string): Promise<StockMutation[]>;
  getStockOpnames(): Promise<StockOpname[]>;
  createStockOpname(
    data: Omit<StockOpname, "id" | "opnameNumber" | "status" | "createdAt">
  ): Promise<StockOpname>;
  approveStockOpname(
    id: string,
    approverName: string
  ): Promise<{ success: boolean; opname?: StockOpname; error?: string }>;
  getQuarantineStock(productId: string): Promise<number>;
  getActiveShift(): Promise<CashierShift | null>;
  openShift(cashierName: string, registerNumber: string, initialCash: number): Promise<CashierShift>;
  closeShift(
    shiftId: string,
    physicalCashCount: number,
    discrepancyReason?: string
  ): Promise<{ success: boolean; shift?: CashierShift; error?: string }>;
  getPosTransactions(shiftId?: string): Promise<PosTransaction[]>;
  createPosTransaction(
    data: Omit<PosTransaction, "id" | "receiptNumber" | "timestamp" | "isReturned">
  ): Promise<{ success: boolean; transaction?: PosTransaction; error?: string }>;
  createPosReturn(
    data: Omit<PosReturn, "id" | "returnNumber" | "timestamp">
  ): Promise<{ success: boolean; returnRecord?: PosReturn; error?: string }>;

  // --- Tahap 07: Keuangan, Jurnal & Laporan ---
  getCashAccounts(): Promise<CashAccount[]>;
  getCashTransactions(): Promise<CashTransaction[]>;
  createExpense(
    data: Omit<CashTransaction, "id" | "trxNumber" | "type">
  ): Promise<CashTransaction>;
  createInternalTransfer(
    sourceId: string,
    targetId: string,
    amount: number,
    notes: string,
    actor: string
  ): Promise<{ success: boolean; transaction?: CashTransaction; error?: string }>;
  getMemberDeposits(memberId?: string): Promise<MemberDepositRecord[]>;
  createMemberDeposit(
    data: Omit<MemberDepositRecord, "id" | "depositNumber">
  ): Promise<MemberDepositRecord>;
  getJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(
    data: Omit<JournalEntry, "id" | "entryNumber" | "status">
  ): Promise<{ success: boolean; entry?: JournalEntry; error?: string }>;
  reverseJournalEntry(
    journalId: string,
    reason: string,
    actor: string
  ): Promise<{ success: boolean; reversalEntry?: JournalEntry; error?: string }>;
  getFinancialReportSummary(): Promise<FinancialReportSummary>;
}

/**
 * Adapter repositori in-memory dengan kondisi awal persiapan jujur (tanpa data fiktif).
 */
class InMemoryPreparationRepository implements IPreparationRepository {
  async getMemberSummary() {
    const members = this.members.filter((member) => !member.isArchived);
    return {
      total: members.length,
      calon: members.filter((member) => member.status === "calon").length,
      verified: members.filter((member) => member.status === "terverifikasi" || member.status === "aktif").length,
    };
  }
  private businessUnits: BusinessUnit[] = [
    {
      id: "unt-sembako-01",
      name: "Gerai Sembako Ladang Laweh",
      type: "Ritel & Pangan Pokok",
      status: "rencana",
      picName: "Abdul Halim",
      readinessPercentage: 25,
      operationalStartDate: null,
      prerequisitesMet: false,
      missingRequirements: [
        "Checklist wajib mencapai minimal 80% (saat ini masih di bawah ambang)",
        "Rekening bank operasional resmi atas nama Koperasi Desa Ladang Laweh",
        "Penetapan modal kerja awal dan penerimaan stok pasokan beras/minyak",
      ],
      statusHistory: [
        {
          fromStatus: "rencana",
          toStatus: "rencana",
          timestamp: "2026-09-01T08:00:00Z",
          actor: "Musyawarah Pengurus Desa",
          notes: "Usulan awal pembentukan gerai sembako dicatat dalam draf perencanaan 2027.",
        },
      ],
    },
  ];

  private checklistItems: ChecklistItem[] = [
    // 1. Legalitas & Profil Organisasi
    {
      id: "chk-01",
      category: "legalitas",
      title: "Akta Pendirian Notaris & SK Pengesahan Kemenkumham/Kemenkop",
      description: "Penerbitan badan hukum resmi Koperasi Desa Ladang Laweh oleh notaris terdaftar.",
      isRequired: true,
      picName: "Pengurus Inti & Abdul Halim",
      targetDate: "2026-11-30",
      status: "dalam_proses",
      reasonOrNotes: "Sedang dalam penyusunan draf AD/ART bersama notaris mitra daerah.",
      proofFileName: "draft_akta_notaris_v1.pdf",
      sourceUrl: "https://ahu.go.id",
      relatedTaskId: "tsk-01",
    },
    {
      id: "chk-02",
      category: "legalitas",
      title: "Nomor Induk Berusaha (NIB) dan Izin Usaha Ritel Sembako",
      description: "Pendaftaran KBLI Perdagangan Eceran Beras dan Sembako melalui sistem OSS.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-12-10",
      status: "belum_selesai",
      reasonOrNotes: "Menunggu SK Pengesahan badan hukum selesai terbit terlebih dahulu.",
    },

    // 2. Pendataan Anggota Pendiri
    {
      id: "chk-03",
      category: "pendataan_anggota",
      title: "Pendaftaran & Verifikasi Identitas 20+ Anggota Pendiri",
      description: "Pengumpulan berkas fotokopi KTP/KK warga nagari Ladang Laweh sebagai pendiri.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-10-31",
      status: "dalam_proses",
      reasonOrNotes: "Telah terkumpul 14 berkas calon anggota pendiri awal.",
      relatedTaskId: "tsk-02",
    },
    {
      id: "chk-04",
      category: "pendataan_anggota",
      title: "Buku Registrasi Induk Keanggotaan Terlindungi",
      description: "Penyiapan sistem pencatatan anggota dengan perlindungan penyembunyian NIK (masking).",
      isRequired: false,
      picName: "Operator Data",
      targetDate: "2026-11-15",
      status: "selesai",
      completedAt: "2026-09-20",
      reasonOrNotes: "Sistem aplikasi tahap 02 telah memuat fungsi masking NIK.",
    },

    // 3. Rencana Kerja & Anggaran (RAPB)
    {
      id: "chk-05",
      category: "anggaran",
      title: "Penyusunan Rencana Anggaran Pendapatan & Belanja (RAPB) 2027",
      description: "Estimasi biaya sewa, modal belanja sembako, dan biaya operasional bulanan.",
      isRequired: true,
      picName: "Bendahara & Abdul Halim",
      targetDate: "2026-11-20",
      status: "dalam_proses",
      reasonOrNotes: "Draf proyeksi modal kerja Rp 25.000.000 sedang dihitung.",
    },

    // 4. Tempat & Peralatan Fisik
    {
      id: "chk-06",
      category: "tempat_fisik",
      title: "Survei & Kesepakatan Sewa Bangunan Gerai Sembako",
      description: "Penetapan lokasi gerai sembako di jalan poros Nagari Ladang Laweh.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-10-15",
      status: "selesai",
      completedAt: "2026-09-15",
      reasonOrNotes: "Lokasi di dekat Kantor Wali Nagari disepakati oleh perwakilan pengurus.",
    },
    {
      id: "chk-07",
      category: "tempat_fisik",
      title: "Pengadaan Rak Display Toko & Timbangan Digital",
      description: "Penyediaan rak besi dagangan, palet beras, dan timbangan bersertifikasi tera.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-12-20",
      status: "belum_selesai",
      reasonOrNotes: "Menunggu pencairan dana modal awal disetor.",
    },

    // 5. Pemasok & Produk Sembako
    {
      id: "chk-08",
      category: "pemasok_produk",
      title: "Penetapan Komoditas Awal (Beras, Minyak Goreng, Gula, Tepung)",
      description: "Inventarisasi 10 item pangan pokok prioritas yang paling dibutuhkan warga.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-10-25",
      status: "selesai",
      completedAt: "2026-09-18",
      reasonOrNotes: "Daftar 10 komoditas telah diverifikasi berdasarkan kebutuhan rumah tangga.",
    },
    {
      id: "chk-09",
      category: "pemasok_produk",
      title: "Perjanjian Kerjasama Pasokan dengan Distributor/Penggilingan",
      description: "Kesepakatan harga grosir dan tempo pengiriman dengan pemasok beras lokal.",
      isRequired: false,
      picName: "Abdul Halim",
      targetDate: "2026-12-05",
      status: "belum_selesai",
      reasonOrNotes: "2 calon grosir telah disurvei, menunggu finalisasi perjanjian.",
    },

    // 6. Standar Operasional Prosedur (SOP)
    {
      id: "chk-10",
      category: "sop",
      title: "Penyusunan Draf SOP Jam Kerja, Pelayanan Kasir, & Tutup Kas",
      description: "Aturan tertulis pembukaan gerai, batas toleransi selisih kas, dan penerimaan retur.",
      isRequired: true,
      picName: "Abdul Halim",
      targetDate: "2026-11-10",
      status: "dalam_proses",
      reasonOrNotes: "Draf dokumen SOP sedang direview oleh Pengawas Koperasi.",
      relatedTaskId: "tsk-01",
    },

    // 7. SDM & Pelatihan Petugas
    {
      id: "chk-11",
      category: "sdm_petugas",
      title: "Surat Tugas Manajer Persiapan untuk Abdul Halim",
      description: "Surat penugasan resmi dari penanggung jawab inisiasi koperasi desa.",
      isRequired: true,
      picName: "Pengurus Desa",
      targetDate: "2026-09-01",
      status: "selesai",
      completedAt: "2026-09-01",
      reasonOrNotes: "SK Penugasan tertanggal 1 September 2026 telah ditandatangani.",
      proofFileName: "sk_penugasan_abdul_halim.pdf",
    },
    {
      id: "chk-12",
      category: "sdm_petugas",
      title: "Pelatihan Penggunaan Dashboard & Kasir Tablet untuk Pengelola",
      description: "Simulasi alur input barang dan transaksi pada perangkat tablet.",
      isRequired: false,
      picName: "Abdul Halim",
      targetDate: "2026-12-28",
      status: "belum_selesai",
      reasonOrNotes: "Dijadwalkan setelah modul inventaris dan kasir selesai dibangun.",
    },

    // 8. Keuangan Awal & Rekening Bank
    {
      id: "chk-13",
      category: "keuangan_bank",
      title: "Pembukaan Rekening Giro Resmi Bank atas nama Koperasi",
      description: "Rekening lembaga perbankan resmi (Bank Nagari/BNI/BRI) dengan spesimen bendahara.",
      isRequired: true,
      picName: "Bendahara",
      targetDate: "2026-12-15",
      status: "belum_selesai",
      reasonOrNotes: "Wajib melampirkan akta pengesahan kemenkumham dan NPWP koperasi.",
    },
    {
      id: "chk-14",
      category: "keuangan_bank",
      title: "Pencatatan Setoran Kas Simpanan Pokok Anggota Pendiri",
      description: "Penerimaan riil kas setoran ke rekening bank tanpa manipulasi saldo.",
      isRequired: true,
      picName: "Bendahara",
      targetDate: "2026-12-30",
      status: "belum_selesai",
      reasonOrNotes: "Saldo saat ini tetap Rp 0 sampai bukti transfer disahkan.",
    },

    // 9. Uji Coba Sistem
    {
      id: "chk-15",
      category: "uji_sistem",
      title: "Simulasi Transaksi Penjualan Mode Latihan di Tablet",
      description: "Uji respons antarmuka tablet 1024x768 dan keandalan tombol sentuh kasir.",
      isRequired: false,
      picName: "Abdul Halim",
      targetDate: "2027-01-05",
      status: "belum_selesai",
      reasonOrNotes: "Simulasi latihan tanpa mengubah buku kas riil produksi.",
    },

    // 10. Keputusan Pembukaan
    {
      id: "chk-16",
      category: "keputusan_pembukaan",
      title: "Berita Acara Keputusan Musyawarah Pembukaan Gerai Sembako",
      description: "Pengesahan resmi tanggal pembukaan gerai oleh Pengurus, Pengawas, dan Tokoh Nagari.",
      isRequired: true,
      picName: "Pengurus & Wali Nagari",
      targetDate: "2027-01-15",
      status: "belum_selesai",
      reasonOrNotes: "Tanggal pembukaan tetap bernilai null sampai berita acara ini diteken.",
    },
  ];

  private members: Member[] = [];

  private tasks: TaskItem[] = [
    {
      id: "tsk-01",
      title: "Penyusunan Draf SOP Pelayanan Kasir & Jam Buka",
      description: "Menyusun standar operasional jam buka, penerimaan barang, dan kasir toko.",
      priority: "tinggi",
      status: "dalam_proses",
      poacCategory: "planning",
      picName: "Abdul Halim",
      dueDate: "2026-10-15",
      relatedUnitId: "unt-sembako-01",
      relatedChecklistId: "chk-10",
      checklistSteps: [
        { id: "st-1", text: "Draf teks SOP operasional", isDone: true },
        { id: "st-2", text: "Review oleh Pengawas Koperasi", isDone: false },
        { id: "st-3", text: "Finalisasi pengesahan pengurus", isDone: false },
      ],
      attachmentName: "draft_sop_pelayanan_v1.docx",
    },
    {
      id: "tsk-02",
      title: "Inventarisasi Berkas Identitas Calon Anggota Pendiri",
      description: "Mengumpulkan fotokopi KTP/KK 20+ warga untuk berkas akta notaris.",
      priority: "tinggi",
      status: "rencana",
      poacCategory: "organizing",
      picName: "Abdul Halim",
      dueDate: "2026-10-25",
      relatedUnitId: "unt-sembako-01",
      relatedChecklistId: "chk-03",
      checklistSteps: [
        { id: "st-4", text: "Kumpulkan KTP minimal 20 warga", isDone: false },
        { id: "st-5", text: "Verifikasi domisili Jorong", isDone: false },
      ],
    },
    {
      id: "tsk-03",
      title: "Survei & Kesepakatan Bangunan Kios Sembako",
      description: "Pemeriksaan fisik ruangan toko sembako di jalan poros Nagari Ladang Laweh.",
      priority: "sedang",
      status: "selesai",
      poacCategory: "actuating",
      picName: "Abdul Halim",
      dueDate: "2026-09-15",
      relatedUnitId: "unt-sembako-01",
      relatedChecklistId: "chk-06",
      checklistSteps: [
        { id: "st-6", text: "Cek instalasi listrik & ventilasi", isDone: true },
        { id: "st-7", text: "Kesepakatan draf biaya sewa", isDone: true },
      ],
    },
    {
      id: "tsk-04",
      title: "Pemeriksaan Rekapitulasi Biaya Pengeluaran Pra-Operasional",
      description: "Audit pencatatan biaya survei, fotokopi, dan transportasi persiapan.",
      priority: "sedang",
      status: "rencana",
      poacCategory: "controlling",
      picName: "Bendahara",
      dueDate: "2026-11-05",
    },
  ];

  private agendas: AgendaItem[] = [
    {
      id: "agd-01",
      title: "Rapat Pleno Koordinasi Persiapan Pembukaan",
      category: "rapat_pengurus",
      date: "2026-10-05",
      startTime: "09:00",
      endTime: "11:30",
      isAllDay: false,
      timeZone: "Asia/Jakarta",
      picName: "Abdul Halim",
      locationType: "fisik",
      locationAddress: "Kantor Wali Nagari Ladang Laweh",
      description: "Pembahasan kesiapan legalitas notaris dan lokasi gerai sembako.",
      relatedTaskId: "tsk-01",
      status: "terjadwal",
    },
  ];

  private workPlans: WorkPlanItem[] = [
    {
      id: "wp-01",
      goal: "Kesiapan Fisik & Fasilitas Gerai Sembako",
      indicator: "Rak display, timbangan digital, dan meja kasir terpasang rapi",
      targetValue: "1 Gerai Siap Pakai",
      program: "Pengadaan & Penataan Tata Letak Toko",
      estimatedCost: 8500000,
      picName: "Abdul Halim",
      dueDate: "2026-12-20",
      status: "ditinjau",
    },
    {
      id: "wp-02",
      goal: "Legalitas Badan Hukum Resmi Koperasi",
      indicator: "Penerbitan Akta Notaris & SK Kemenkumham/Kemenkop",
      targetValue: "1 Dokumen SK Sah",
      program: "Koordinasi Administrasi Notaris Wilayah",
      estimatedCost: 4000000,
      picName: "Pengurus Koperasi",
      dueDate: "2026-11-30",
      status: "disetujui",
    },
    {
      id: "wp-03",
      goal: "Penyediaan Pasokan Bahan Sembako Perdana",
      indicator: "Tersedianya 10 komoditas pangan pokok siap jual",
      targetValue: "10 Komoditas Siap Rak",
      program: "Pengadaan Pembelian Perdana (PO)",
      estimatedCost: 15000000,
      picName: "Bendahara & Abdul Halim",
      dueDate: "2026-12-30",
      status: "draft",
    },
  ];

  private risks: RiskItem[] = [
    {
      id: "rsk-01",
      category: "kepatuhan",
      title: "Keterlambatan Penerbitan SK Legalitas dari Kemenkumham",
      impact: "tinggi",
      likelihood: "sedang",
      mitigationPlan: "Melengkapi seluruh 20 fotokopi KTP pendiri lebih awal dan koordinasi intensif dengan notaris.",
      ownerName: "Abdul Halim",
      followUpStatus: "dalam_mitigasi",
      proofNotes: "Draf berkas AD/ART sedang diteliti notaris.",
    },
    {
      id: "rsk-02",
      category: "bisnis",
      title: "Fluktuasi Harga Pasar Beras & Minyak Goreng Curah",
      impact: "sedang",
      likelihood: "tinggi",
      mitigationPlan: "Membuat perjanjian pasokan harga grosir tetap selama 1 bulan dengan penggilingan lokal.",
      ownerName: "Abdul Halim",
      followUpStatus: "dalam_mitigasi",
    },
    {
      id: "rsk-03",
      category: "operasional",
      title: "Gangguan Pasokan Listrik saat Transaksi Kasir Tablet",
      impact: "sedang",
      likelihood: "rendah",
      mitigationPlan: "Menyiapkan baterai cadangan (powerbank) dan buku nota manual cadangan berstempel.",
      ownerName: "Operator Unit",
      followUpStatus: "terkendali",
    },
  ];

  private governanceDocs: GovernanceDocument[] = [
    {
      id: "doc-01",
      title: "Draf Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)",
      docType: "ad_art",
      version: "1.0-draf",
      ownerName: "Pengurus Koperasi",
      date: "2026-09-05",
      status: "peninjauan",
      attachmentFileName: "draf_ad_art_kopdes_ladang_laweh_v1.pdf",
      notes: "Sedang dikaji bersama tokoh adat dan wali nagari.",
    },
    {
      id: "doc-02",
      title: "Berita Acara Musyawarah Pembentukan Koperasi Desa",
      docType: "notulen",
      version: "1.0",
      ownerName: "Tokoh Nagari & Pengurus",
      date: "2026-09-01",
      status: "disahkan",
      attachmentFileName: "berita_acara_musyawarah_desa.pdf",
      meetingAttendees: ["Wali Nagari", "Abdul Halim", "Bustamam", "Datuak Marajo", "Nurhasanah"],
      meetingDecisions: [
        "Menyetujui pendirian Kopdes Merah Putih Ladang Laweh.",
        "Menunjuk Abdul Halim sebagai Manajer Persiapan Operasional.",
      ],
    },
  ];

  private fixedAssets: FixedAsset[] = [
    {
      id: "ast-01",
      code: "AST-RAK-01",
      name: "Rak Gondola Display Besi 4 Susun",
      location: "Kios Gerai Sembako Ladang Laweh",
      condition: "baik",
      picName: "Abdul Halim",
      acquisitionCost: 1850000,
      purchaseDocName: "faktur_rak_display.pdf",
      notes: "Aset tetap inventaris fisik (bukan barang dagang).",
      isArchived: false,
    },
    {
      id: "ast-02",
      code: "AST-TMB-01",
      name: "Timbangan Digital Komersial Bersertifikasi Tera",
      location: "Meja Kasir Gerai Sembako",
      condition: "baik",
      picName: "Abdul Halim",
      acquisitionCost: 650000,
      purchaseDocName: "faktur_timbangan.pdf",
      notes: "Aset tetap untuk penimbangan beras curah dan telur.",
      isArchived: false,
    },
  ];

  async getBusinessUnits(): Promise<BusinessUnit[]> {
    return JSON.parse(JSON.stringify(this.businessUnits));
  }

  async updateUnitStatus(
    unitId: string,
    targetStatus: UnitStatus,
    actor: string,
    notes: string
  ): Promise<{ success: boolean; unit?: BusinessUnit; error?: string }> {
    const unit = this.businessUnits.find((u) => u.id === unitId);
    if (!unit) {
      return { success: false, error: "Unit usaha tidak ditemukan." };
    }

    // Validasi Prasyarat Perpindahan Status
    if (targetStatus === "siap_buka" || targetStatus === "aktif") {
      const requiredItems = this.checklistItems.filter((item) => item.isRequired);
      const completedRequired = requiredItems.filter((item) => item.status === "selesai");
      const requiredPercent = requiredItems.length > 0 ? (completedRequired.length / requiredItems.length) * 100 : 0;

      if (requiredPercent < 80) {
        return {
          success: false,
          error: `Prasyarat belum terpenuhi: Checklist wajib baru selesai ${Math.round(
            requiredPercent
          )}% (minimal 80% dan verifikasi rekening bank diperlukan).`,
        };
      }
    }

    const previousStatus = unit.status;
    unit.status = targetStatus;
    unit.statusHistory.unshift({
      fromStatus: previousStatus,
      toStatus: targetStatus,
      timestamp: new Date().toISOString(),
      actor,
      notes,
    });

    return { success: true, unit: { ...unit } };
  }

  async getChecklistItems(): Promise<ChecklistItem[]> {
    return JSON.parse(JSON.stringify(this.checklistItems));
  }

  async getChecklistItem(id: string): Promise<ChecklistItem | null> {
    const item = this.checklistItems.find((c) => c.id === id);
    return item ? { ...item } : null;
  }

  async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    const index = this.checklistItems.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = this.checklistItems[index];
    const updated: ChecklistItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status === "selesai" && !updated.completedAt) {
      updated.completedAt = new Date().toISOString().split("T")[0];
    } else if (updates.status !== "selesai") {
      updated.completedAt = null;
    }

    this.checklistItems[index] = updated;

    // Perbarui kesiapan unit usaha secara proporsional
    const totalItems = this.checklistItems.length;
    const completedItems = this.checklistItems.filter((i) => i.status === "selesai").length;
    const currentPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    if (this.businessUnits[0]) {
      this.businessUnits[0].readinessPercentage = currentPercent;
    }

    return { ...updated };
  }

  async addChecklistItem(itemData: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    const newItem: ChecklistItem = {
      ...itemData,
      id: `chk-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.checklistItems.push(newItem);
    return { ...newItem };
  }

  private products: Product[] = [
    {
      id: "prd-01",
      sku: "BRS-KK-05",
      name: "Beras Kuriak Kusuik 5 Kg",
      category: "beras",
      baseUnit: "Sak",
      conversionUnit: "Kg",
      conversionFactor: 5,
      barcode: "899123456701",
      estimatedCost: 72000,
      sellingPrice: 78000,
      minStock: 10,
      currentStock: 0,
      hasExpiry: false,
      isArchived: false,
      createdAt: "2026-09-10T08:00:00Z",
    },
    {
      id: "prd-02",
      sku: "MYK-GR-01",
      name: "Minyak Goreng Sawit 1 Liter",
      category: "minyak_goreng",
      baseUnit: "Pouch",
      conversionUnit: "Dus (12 Pouch)",
      conversionFactor: 12,
      barcode: "899123456702",
      estimatedCost: 15500,
      sellingPrice: 17500,
      minStock: 24,
      currentStock: 0,
      hasExpiry: true,
      isArchived: false,
      createdAt: "2026-09-10T08:00:00Z",
    },
    {
      id: "prd-03",
      sku: "GLA-PS-01",
      name: "Gula Pasir Kristal Putih 1 Kg",
      category: "gula_tepung",
      baseUnit: "Kg",
      conversionUnit: "Karung (50 Kg)",
      conversionFactor: 50,
      barcode: "899123456703",
      estimatedCost: 16000,
      sellingPrice: 18000,
      minStock: 20,
      currentStock: 0,
      hasExpiry: false,
      isArchived: false,
      createdAt: "2026-09-10T08:00:00Z",
    },
  ];

  private suppliers: Supplier[] = [
    {
      id: "sup-01",
      code: "SUP-BKT-01",
      name: "UD Tani Makmur Bukittinggi",
      contactPerson: "Datuak Marajo",
      phone: "081267890011",
      address: "Pasar Bawah, Kota Bukittinggi",
      suppliedCategory: "Beras & Komoditas Pangan Pokok",
      poHistoryCount: 0,
      isArchived: false,
      createdAt: "2026-09-12T09:00:00Z",
    },
    {
      id: "sup-02",
      code: "SUP-PDG-02",
      name: "Distributor Sembako Padang",
      contactPerson: "Ibu Ratna",
      phone: "081345678900",
      address: "Kawasan Pergudangan By Pass, Padang",
      suppliedCategory: "Minyak Goreng Kemasan & Gula",
      poHistoryCount: 0,
      isArchived: false,
      createdAt: "2026-09-12T09:00:00Z",
    },
  ];

  private organizationProfile: OrganizationProfile = {
    displayName: "Kopdes Merah Putih — Ladang Laweh",
    legalName: "", // Kosong jujur - menunggu SK Kemenkumham
    region: "Nagari Ladang Laweh, Kec. Banuhampu, Kab. Agam, Sumatera Barat",
    fullAddress: "Jalan Raya Ladang Laweh (Kantor Persiapan Sementara)",
    fiscalYear: "2027 (Draf)",
    timeZone: "Asia/Jakarta",
    legalDocStatus: "belum_diunggah",
    npwpKoperasi: "",
    rekeningBank: "",
    bankName: "Bank Nagari (Rencana)",
  };

  async deleteChecklistItem(id: string): Promise<boolean> {
    const initialLength = this.checklistItems.length;
    this.checklistItems = this.checklistItems.filter((c) => c.id !== id);
    return this.checklistItems.length < initialLength;
  }

  async getMembers(
    query?: string,
    statusFilter?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ members: Member[]; total: number; page: number; totalPages: number }> {
    let filtered = this.members.filter((m) => !m.isArchived);

    if (statusFilter === "verified") {
      filtered = filtered.filter((member) => member.status === "terverifikasi" || member.status === "aktif");
    } else if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberNo.toLowerCase().includes(q) ||
          m.domicile.toLowerCase().includes(q) ||
          m.phone.includes(q)
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    return {
      members: JSON.parse(JSON.stringify(paginated)),
      total,
      page: safePage,
      totalPages,
    };
  }

  async getMemberById(id: string): Promise<Member | null> {
    const member = this.members.find((m) => m.id === id);
    return member ? JSON.parse(JSON.stringify(member)) : null;
  }

  async addMember(data: Omit<Member, "id" | "memberNo" | "joinDate">): Promise<Member> {
    const newMember: Member = {
      ...data,
      id: `mbr-${crypto.randomUUID()}`,
      memberNo: `A-${String(this.members.length + 1).padStart(4, "0")}`,
      joinDate: new Date().toISOString().split("T")[0],
      simpananPokokPaid: data.simpananPokokPaid ?? false,
      simpananWajibPaid: data.simpananWajibPaid ?? false,
      simpananPokokAmount: data.simpananPokokAmount ?? 0,
      simpananWajibAmount: data.simpananWajibAmount ?? 0,
      documentStatus: data.documentStatus ?? "belum_unggah",
      isArchived: false,
    };
    this.members.push(newMember);
    return { ...newMember };
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    const index = this.members.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.members[index] = { ...this.members[index], ...updates };
    return { ...this.members[index] };
  }

  async archiveMember(id: string): Promise<boolean> {
    const member = this.members.find((m) => m.id === id);
    if (!member) return false;
    member.isArchived = true;
    member.status = "nonaktif";
    return true;
  }

  async importMembers(
    rows: { fullName: string; phone: string; domicile: string; nik?: string }[]
  ): Promise<{ importedCount: number; errors: { row: number; error: string }[] }> {
    const errors: { row: number; error: string }[] = [];
    let count = 0;

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      if (!row.fullName || row.fullName.trim().length < 3) {
        errors.push({ row: rowNum, error: "Nama lengkap calon anggota minimal 3 karakter." });
        return;
      }
      if (!row.domicile) {
        errors.push({ row: rowNum, error: "Jorong / domisili Ladang Laweh wajib diisi." });
        return;
      }

      // Validasi duplikasi NIK atau nama
      const isDuplicate = this.members.some(
        (m) => m.fullName.toLowerCase() === row.fullName.toLowerCase()
      );
      if (isDuplicate) {
        errors.push({ row: rowNum, error: `Nama "${row.fullName}" sudah terdaftar.` });
        return;
      }

      if (row.nik && !/^\d{16}$/.test(row.nik)) {
        errors.push({ row: rowNum, error: "NIK harus terdiri dari 16 angka, atau dikosongkan." });
        return;
      }
      const masked = row.nik && row.nik.length === 16
        ? `${row.nik.substring(0, 4)}**********${row.nik.substring(14)}`
        : "";

      const newMember: Member = {
        id: `mbr-${Date.now()}-${idx}`,
        memberNo: `A-${String(this.members.length + 1).padStart(4, "0")}`,
        fullName: row.fullName.trim(),
        maskedNik: masked,
        phone: row.phone.trim(),
        domicile: row.domicile.trim(),
        joinDate: new Date().toISOString().split("T")[0],
        status: "calon",
        simpananPokokPaid: false,
        simpananWajibPaid: false,
        simpananPokokAmount: 0,
        simpananWajibAmount: 0,
        documentStatus: "belum_unggah",
        isArchived: false,
      };

      this.members.push(newMember);
      count++;
    });

    return { importedCount: count, errors };
  }

  async getProducts(): Promise<Product[]> {
    return JSON.parse(JSON.stringify(this.products.filter((p) => !p.isArchived)));
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  }

  async addProduct(
    data: Omit<Product, "id" | "currentStock" | "isArchived" | "createdAt">
  ): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: `prd-${Date.now()}`,
      currentStock: 0, // Kuantitas fisik selalu 0 di master produk
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return { ...newProduct };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    // Lindungi currentStock agar tidak bisa dimutasi melalui edit katalog produk
    const { currentStock: _ignoredStock, ...safeUpdates } = updates;
    this.products[index] = { ...this.products[index], ...safeUpdates };
    return { ...this.products[index] };
  }

  async archiveProduct(id: string): Promise<boolean> {
    const product = this.products.find((p) => p.id === id);
    if (!product) return false;
    product.isArchived = true;
    return true;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return JSON.parse(JSON.stringify(this.suppliers.filter((s) => !s.isArchived)));
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const supplier = this.suppliers.find((s) => s.id === id);
    return supplier ? JSON.parse(JSON.stringify(supplier)) : null;
  }

  async addSupplier(
    data: Omit<Supplier, "id" | "poHistoryCount" | "isArchived" | "createdAt">
  ): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      poHistoryCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    this.suppliers.push(newSupplier);
    return { ...newSupplier };
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.suppliers[index] = { ...this.suppliers[index], ...updates };
    return { ...this.suppliers[index] };
  }

  async archiveSupplier(id: string): Promise<boolean> {
    const supplier = this.suppliers.find((s) => s.id === id);
    if (!supplier) return false;
    supplier.isArchived = true;
    return true;
  }

  async getOrganizationProfile(): Promise<OrganizationProfile> {
    return JSON.parse(JSON.stringify(this.organizationProfile));
  }

  async updateOrganizationProfile(
    updates: Partial<OrganizationProfile>
  ): Promise<OrganizationProfile> {
    this.organizationProfile = { ...this.organizationProfile, ...updates };
    return { ...this.organizationProfile };
  }

  async getTasks(poacFilter?: string, statusFilter?: string): Promise<TaskItem[]> {
    let filtered = [...this.tasks];
    if (poacFilter && poacFilter !== "all") {
      filtered = filtered.filter((t) => t.poacCategory === poacFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    return JSON.parse(JSON.stringify(filtered));
  }

  async getTaskById(id: string): Promise<TaskItem | null> {
    const task = this.tasks.find((t) => t.id === id);
    return task ? JSON.parse(JSON.stringify(task)) : null;
  }

  async addTask(data: Omit<TaskItem, "id">): Promise<TaskItem> {
    const newTask: TaskItem = {
      ...data,
      id: `tsk-${Date.now()}`,
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tasks[index] = { ...this.tasks[index], ...updates };
    return { ...this.tasks[index] };
  }

  async toggleTaskStatus(id: string): Promise<{ task: TaskItem | null; canUndo: boolean }> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { task: null, canUndo: false };

    task.previousStatus = task.status;
    if (task.status === "selesai") {
      task.status = "dalam_proses";
    } else {
      task.status = "selesai";
    }
    return { task: { ...task }, canUndo: true };
  }

  async undoTaskStatus(id: string): Promise<TaskItem | null> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task || !task.previousStatus) return null;

    task.status = task.previousStatus;
    task.previousStatus = undefined;
    return { ...task };
  }

  async getAgendas(): Promise<AgendaItem[]> {
    return JSON.parse(JSON.stringify(this.agendas));
  }

  async getAgendaById(id: string): Promise<AgendaItem | null> {
    const agenda = this.agendas.find((a) => a.id === id);
    return agenda ? JSON.parse(JSON.stringify(agenda)) : null;
  }

  async addAgenda(
    data: Omit<AgendaItem, "id" | "status">
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    // Validasi jam akhir > jam mulai jika bukan all-day
    if (!data.isAllDay && data.startTime && data.endTime && data.endTime <= data.startTime) {
      return {
        success: false,
        warning: "Waktu selesai agenda harus setelah waktu mulai.",
      };
    }

    // Deteksi bentrok jadwal untuk PIC yang sama
    let clashWarning: string | undefined;
    const clashingAgenda = this.agendas.find(
      (a) =>
        a.status === "terjadwal" &&
        a.date === data.date &&
        a.picName.toLowerCase() === data.picName.toLowerCase() &&
        !a.isAllDay &&
        !data.isAllDay &&
        ((data.startTime >= a.startTime && data.startTime < a.endTime) ||
          (data.endTime > a.startTime && data.endTime <= a.endTime) ||
          (data.startTime <= a.startTime && data.endTime >= a.endTime))
    );

    if (clashingAgenda) {
      clashWarning = `Peringatan Bentrok: ${data.picName} telah memiliki agenda "${clashingAgenda.title}" pada rentang jam ${clashingAgenda.startTime} - ${clashingAgenda.endTime}.`;
    }

    const newAgenda: AgendaItem = {
      ...data,
      id: `agd-${Date.now()}`,
      status: "terjadwal",
    };
    this.agendas.push(newAgenda);
    return { success: true, agenda: { ...newAgenda }, warning: clashWarning };
  }

  async updateAgenda(
    id: string,
    updates: Partial<AgendaItem>
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    const index = this.agendas.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, warning: "Agenda tidak ditemukan." };

    if (
      !updates.isAllDay &&
      updates.startTime &&
      updates.endTime &&
      updates.endTime <= updates.startTime
    ) {
      return { success: false, warning: "Waktu selesai harus setelah waktu mulai." };
    }

    this.agendas[index] = { ...this.agendas[index], ...updates };
    return { success: true, agenda: { ...this.agendas[index] } };
  }

  async cancelAgenda(id: string, reason: string): Promise<AgendaItem | null> {
    const agenda = this.agendas.find((a) => a.id === id);
    if (!agenda) return null;
    agenda.status = "dibatalkan";
    agenda.cancellationReason = reason;
    return { ...agenda };
  }

  async rescheduleAgenda(
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<{ success: boolean; agenda?: AgendaItem; warning?: string }> {
    const agenda = this.agendas.find((a) => a.id === id);
    if (!agenda) return { success: false, warning: "Agenda tidak ditemukan." };

    if (newEndTime <= newStartTime) {
      return { success: false, warning: "Waktu selesai baru harus setelah waktu mulai." };
    }

    const oldDate = agenda.date;
    agenda.rescheduledFrom = oldDate;
    agenda.date = newDate;
    agenda.startTime = newStartTime;
    agenda.endTime = newEndTime;
    agenda.status = "terjadwal";

    return { success: true, agenda: { ...agenda } };
  }

  async getWorkPlans(): Promise<WorkPlanItem[]> {
    return JSON.parse(JSON.stringify(this.workPlans));
  }

  async addWorkPlan(data: Omit<WorkPlanItem, "id">): Promise<WorkPlanItem> {
    const newPlan: WorkPlanItem = {
      ...data,
      id: `wp-${Date.now()}`,
    };
    this.workPlans.push(newPlan);
    return { ...newPlan };
  }

  async updateWorkPlan(id: string, updates: Partial<WorkPlanItem>): Promise<WorkPlanItem | null> {
    const index = this.workPlans.findIndex((w) => w.id === id);
    if (index === -1) return null;
    this.workPlans[index] = { ...this.workPlans[index], ...updates };
    return { ...this.workPlans[index] };
  }

  async getRisks(): Promise<RiskItem[]> {
    return JSON.parse(JSON.stringify(this.risks));
  }

  async addRisk(data: Omit<RiskItem, "id">): Promise<RiskItem> {
    const newRisk: RiskItem = {
      ...data,
      id: `rsk-${Date.now()}`,
    };
    this.risks.push(newRisk);
    return { ...newRisk };
  }

  async updateRisk(id: string, updates: Partial<RiskItem>): Promise<RiskItem | null> {
    const index = this.risks.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.risks[index] = { ...this.risks[index], ...updates };
    return { ...this.risks[index] };
  }

    // Data Tahap 06
  private purchaseOrders: PurchaseOrder[] = [
    {
      id: "po-001",
      poNumber: "PO-2026-09-001",
      supplierId: "sup-01",
      supplierName: "UD Tani Makmur Bukittinggi",
      orderDate: "2026-09-15",
      expectedDeliveryDate: "2026-09-28",
      status: "disetujui",
      paymentStatus: "belum_ditagih",
      items: [
        {
          productId: "prd-01",
          productName: "Beras Kuriak Kusuik 5 Kg",
          sku: "BRS-KK-05",
          unit: "Sak",
          orderedQty: 20,
          receivedQty: 0,
          invoicedQty: 0,
          unitPrice: 72000,
          subtotal: 1440000,
        },
      ],
      totalAmount: 1440000,
      notes: "Pengadaan awal beras kualitas lokal untuk gerai sembako Ladang Laweh.",
      createdBy: "Abdul Halim",
      approvedBy: "Pengurus Koperasi",
      createdAt: "2026-09-15T09:00:00Z",
    },
  ];

  private goodsReceipts: GoodsReceipt[] = [];
  private stockMutations: StockMutation[] = [];
  private stockOpnames: StockOpname[] = [];
  private quarantineStocks: Record<string, number> = {
    "prd-01": 0,
    "prd-02": 0,
    "prd-03": 0,
  };
  private cashierShifts: CashierShift[] = [];
  private posTransactions: PosTransaction[] = [];
  private posReturns: PosReturn[] = [];

  async getGovernanceDocuments(): Promise<GovernanceDocument[]> {
    return JSON.parse(JSON.stringify(this.governanceDocs));
  }

  async addGovernanceDocument(
    data: Omit<GovernanceDocument, "id">
  ): Promise<GovernanceDocument> {
    const newDoc: GovernanceDocument = {
      ...data,
      id: `doc-${Date.now()}`,
    };
    this.governanceDocs.push(newDoc);
    return { ...newDoc };
  }

  async getFixedAssets(): Promise<FixedAsset[]> {
    return JSON.parse(JSON.stringify(this.fixedAssets.filter((a) => !a.isArchived)));
  }

  async addFixedAsset(data: Omit<FixedAsset, "id" | "isArchived">): Promise<FixedAsset> {
    const newAsset: FixedAsset = {
      ...data,
      id: `ast-${Date.now()}`,
      isArchived: false,
    };
    this.fixedAssets.push(newAsset);
    return { ...newAsset };
  }

  async archiveFixedAsset(id: string): Promise<boolean> {
    const asset = this.fixedAssets.find((a) => a.id === id);
    if (!asset) return false;
    asset.isArchived = true;
    return true;
  }

  async getOperationalStates(): Promise<{
    sales: OperationalDataState;
    cash: OperationalDataState;
    inventory: OperationalDataState;
  }> {
    return {
      sales: "unconfigured",
      cash: "zero_recorded",
      inventory: "unconfigured",
    };
  }

  // --- Implementasi Tahap 06: Pembelian (PO) ---
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return JSON.parse(JSON.stringify(this.purchaseOrders));
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    return po ? JSON.parse(JSON.stringify(po)) : null;
  }

  async addPurchaseOrder(
    data: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "paymentStatus" | "createdAt">
  ): Promise<PurchaseOrder> {
    const nextNum = String(this.purchaseOrders.length + 1).padStart(3, "0");
    const newPo: PurchaseOrder = {
      ...data,
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-09-${nextNum}`,
      status: "diajukan",
      paymentStatus: "belum_ditagih",
      createdAt: new Date().toISOString(),
    };
    this.purchaseOrders.push(newPo);
    // CATATAN: Pembuatan PO TIDAK menambah stok fisik produk!
    return { ...newPo };
  }

  async approvePurchaseOrder(id: string, approverName: string): Promise<PurchaseOrder | null> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) return null;
    po.status = "disetujui";
    po.approvedBy = approverName;
    return { ...po };
  }

  async rejectPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder | null> {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) return null;
    po.status = "ditolak";
    po.rejectionReason = reason;
    return { ...po };
  }

  // --- Penerimaan Barang (Goods Receipt) -> Memutasi Stok Fisik Sah ---
  async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    return JSON.parse(JSON.stringify(this.goodsReceipts));
  }

  async createGoodsReceipt(
    data: Omit<GoodsReceipt, "id" | "receiptNumber" | "status" | "createdAt">
  ): Promise<{ success: boolean; receipt?: GoodsReceipt; error?: string }> {
    const po = this.purchaseOrders.find((p) => p.id === data.poId);
    if (!po) return { success: false, error: "Nomor PO tidak ditemukan." };

    const receiptNum = `GR-2026-09-${String(this.goodsReceipts.length + 1).padStart(3, "0")}`;
    const newReceipt: GoodsReceipt = {
      ...data,
      id: `gr-${Date.now()}`,
      receiptNumber: receiptNum,
      status: "diposting",
      createdAt: new Date().toISOString(),
    };

    // Mutasi stok produk secara fisik
    for (const item of data.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod && item.receivedQty > 0) {
        const prevStock = prod.currentStock;
        prod.currentStock += item.receivedQty;

        // Catat Kartu Mutasi Masuk
        this.stockMutations.push({
          id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          mutationType: "masuk_po",
          referenceNumber: receiptNum,
          date: data.receivedDate,
          qtyChange: item.receivedQty,
          qtyBefore: prevStock,
          qtyAfter: prod.currentStock,
          notes: `Penerimaan fisik barang dari PO: ${po.poNumber}`,
          operatorName: data.receivedBy,
        });
      }

      // Jika ada barang cacat/rusak saat datang, alihkan ke karantina
      if (item.damagedQty > 0) {
        this.quarantineStocks[item.productId] =
          (this.quarantineStocks[item.productId] || 0) + item.damagedQty;
        this.stockMutations.push({
          id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          productName: item.productName,
          mutationType: "karantina_rusak",
          referenceNumber: receiptNum,
          date: data.receivedDate,
          qtyChange: item.damagedQty,
          qtyBefore: this.quarantineStocks[item.productId] - item.damagedQty,
          qtyAfter: this.quarantineStocks[item.productId],
          notes: `Barang rusak/cacat saat diterima: dialihkan ke karantina`,
          operatorName: data.receivedBy,
        });
      }

      // Update item PO
      const poItem = po.items.find((i) => i.productId === item.productId);
      if (poItem) {
        poItem.receivedQty += item.receivedQty;
      }
    }

    // Perbarui status PO
    const allReceived = po.items.every((i) => i.receivedQty >= i.orderedQty);
    po.status = allReceived ? "selesai" : "diterima_sebagian";

    this.goodsReceipts.push(newReceipt);
    return { success: true, receipt: { ...newReceipt } };
  }

  // --- Mutasi Stok & Opname ---
  async getStockMutations(productId?: string): Promise<StockMutation[]> {
    let list = [...this.stockMutations];
    if (productId) {
      list = list.filter((m) => m.productId === productId);
    }
    return JSON.parse(JSON.stringify(list.reverse()));
  }

  async getStockOpnames(): Promise<StockOpname[]> {
    return JSON.parse(JSON.stringify(this.stockOpnames));
  }

  async createStockOpname(
    data: Omit<StockOpname, "id" | "opnameNumber" | "status" | "createdAt">
  ): Promise<StockOpname> {
    const opnameNum = `SOP-2026-09-${String(this.stockOpnames.length + 1).padStart(3, "0")}`;
    const newOpname: StockOpname = {
      ...data,
      id: `sop-${Date.now()}`,
      opnameNumber: opnameNum,
      status: "usulan",
      createdAt: new Date().toISOString(),
    };
    this.stockOpnames.push(newOpname);
    return { ...newOpname };
  }

  async approveStockOpname(
    id: string,
    approverName: string
  ): Promise<{ success: boolean; opname?: StockOpname; error?: string }> {
    const op = this.stockOpnames.find((o) => o.id === id);
    if (!op) return { success: false, error: "Opname tidak ditemukan." };

    for (const item of op.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        const prevStock = prod.currentStock;
        prod.currentStock = item.physicalQty;

        this.stockMutations.push({
          id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          mutationType: "opname_penyesuaian",
          referenceNumber: op.opnameNumber,
          date: op.date,
          qtyChange: item.diffQty,
          qtyBefore: prevStock,
          qtyAfter: prod.currentStock,
          notes: `Penyesuaian stok fisik hasil opname: ${item.reason}`,
          operatorName: approverName,
        });
      }
    }

    op.status = "disetujui";
    op.approvedBy = approverName;
    return { success: true, opname: { ...op } };
  }

  async getQuarantineStock(productId: string): Promise<number> {
    return this.quarantineStocks[productId] || 0;
  }

  // --- Kasir POS: Shift & Transaksi Atomik ---
  async getActiveShift(): Promise<CashierShift | null> {
    const shift = this.cashierShifts.find((s) => s.status === "buka");
    return shift ? JSON.parse(JSON.stringify(shift)) : null;
  }

  async openShift(
    cashierName: string,
    registerNumber: string,
    initialCash: number
  ): Promise<CashierShift> {
    const existing = await this.getActiveShift();
    if (existing) {
      return existing;
    }

    const newShift: CashierShift = {
      id: `shf-${Date.now()}`,
      cashierName,
      registerNumber,
      openedAt: new Date().toISOString(),
      initialCash,
      status: "buka",
      totalSalesCount: 0,
      totalSalesAmount: 0,
    };
    this.cashierShifts.push(newShift);
    return { ...newShift };
  }

  async closeShift(
    shiftId: string,
    physicalCashCount: number,
    discrepancyReason?: string
  ): Promise<{ success: boolean; shift?: CashierShift; error?: string }> {
    const shift = this.cashierShifts.find((s) => s.id === shiftId);
    if (!shift) return { success: false, error: "Shift tidak ditemukan." };

    // Hitung total tunai masuk dari penjualan shift
    const shiftCashSales = this.posTransactions
      .filter((t) => t.shiftId === shiftId && t.paymentMethod === "tunai")
      .reduce((sum, t) => sum + t.grandTotal, 0);

    const systemExpected = shift.initialCash + shiftCashSales;
    const discrepancy = physicalCashCount - systemExpected;

    shift.closedAt = new Date().toISOString();
    shift.systemExpectedCash = systemExpected;
    shift.physicalCashCount = physicalCashCount;
    shift.discrepancy = discrepancy;
    shift.discrepancyReason = discrepancyReason || "";
    shift.status = "tutup";

    return { success: true, shift: { ...shift } };
  }

  async getPosTransactions(shiftId?: string): Promise<PosTransaction[]> {
    let list = [...this.posTransactions];
    if (shiftId) {
      list = list.filter((t) => t.shiftId === shiftId);
    }
    return JSON.parse(JSON.stringify(list.reverse()));
  }

  async createPosTransaction(
    data: Omit<PosTransaction, "id" | "receiptNumber" | "timestamp" | "isReturned">
  ): Promise<{ success: boolean; transaction?: PosTransaction; error?: string }> {
    const activeShift = await this.getActiveShift();
    if (!activeShift) {
      return { success: false, error: "Shift kasir belum dibuka. Harap buka shift terlebih dahulu." };
    }

    // Validasi stok fisik tersedia cukup
    for (const item of data.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod || prod.currentStock < item.quantity) {
        return {
          success: false,
          error: `Stok tidak mencukupi untuk "${item.name}". Tersedia: ${prod ? prod.currentStock : 0} ${item.unit}.`,
        };
      }
    }

    const receiptNum = `TRX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newTx: PosTransaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString(),
      isReturned: false,
    };

    // Eksekusi atomik: kurangi stok fisik produk & catat kartu mutasi
    for (const item of data.items) {
      const prod = this.products.find((p) => p.id === item.productId)!;
      const prevStock = prod.currentStock;
      prod.currentStock -= item.quantity;

      this.stockMutations.push({
        id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        productName: prod.name,
        mutationType: "keluar_kasir",
        referenceNumber: receiptNum,
        date: new Date().toISOString().split("T")[0],
        qtyChange: -item.quantity,
        qtyBefore: prevStock,
        qtyAfter: prod.currentStock,
        notes: `Penjualan Kasir POS (${receiptNum})`,
        operatorName: data.cashierName,
      });
    }

    // Perbarui shift
    const shiftInList = this.cashierShifts.find((s) => s.id === activeShift.id);
    if (shiftInList) {
      shiftInList.totalSalesCount += 1;
      shiftInList.totalSalesAmount += data.grandTotal;
    }

    // Mutasi saldo kas register jika pembayaran tunai
    if (data.paymentMethod === "tunai") {
      const regAcc = this.cashAccounts.find((a) => a.id === "acc-1101");
      if (regAcc) {
        regAcc.balance += data.grandTotal;
      }
    }

    this.posTransactions.push(newTx);
    return { success: true, transaction: { ...newTx } };
  }

  async createPosReturn(
    data: Omit<PosReturn, "id" | "returnNumber" | "timestamp">
  ): Promise<{ success: boolean; returnRecord?: PosReturn; error?: string }> {
    const originalTx = this.posTransactions.find(
      (t) => t.receiptNumber === data.originalReceiptNumber
    );
    if (!originalTx) {
      return { success: false, error: "Nomor struk transaksi asal tidak ditemukan." };
    }

    const retNum = `RET-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newReturn: PosReturn = {
      ...data,
      id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      returnNumber: retNum,
      timestamp: new Date().toISOString(),
    };

    // Barang cacat dialihkan ke gudang karantina (BUKAN stok siap jual)
    for (const item of data.returnedItems) {
      if (data.allocatedTo === "karantina") {
        this.quarantineStocks[item.productId] =
          (this.quarantineStocks[item.productId] || 0) + item.quantity;
        this.stockMutations.push({
          id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          productName: item.name,
          mutationType: "karantina_rusak",
          referenceNumber: retNum,
          date: new Date().toISOString().split("T")[0],
          qtyChange: item.quantity,
          qtyBefore: this.quarantineStocks[item.productId] - item.quantity,
          qtyAfter: this.quarantineStocks[item.productId],
          notes: `Retur pelanggan dialihkan ke karantina (${data.reason})`,
          operatorName: data.authorizedBy,
        });
      } else {
        // Kembalikan ke stok jual jika masih layak
        const prod = this.products.find((p) => p.id === item.productId);
        if (prod) {
          const prev = prod.currentStock;
          prod.currentStock += item.quantity;
          this.stockMutations.push({
            id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: prod.id,
            productName: prod.name,
            mutationType: "retur_penjualan",
            referenceNumber: retNum,
            date: new Date().toISOString().split("T")[0],
            qtyChange: item.quantity,
            qtyBefore: prev,
            qtyAfter: prod.currentStock,
            notes: `Retur pelanggan dikembalikan ke stok jual`,
            operatorName: data.authorizedBy,
          });
        }
      }
    }

    originalTx.isReturned = true;

    // Kembalikan uang tunai dari kas register
    const regAcc = this.cashAccounts.find((a) => a.id === "acc-1101");
    if (regAcc && data.totalRefund > 0) {
      regAcc.balance -= data.totalRefund;
    }

    this.posReturns.push(newReturn);
    return { success: true, returnRecord: { ...newReturn } };
  }

  // --- Data & Method Tahap 07: Keuangan, Jurnal & Laporan ---
  private cashAccounts: CashAccount[] = [
    {
      id: "acc-1101",
      code: "1101",
      name: "Kas Register Kasir Gerai Sembako",
      type: "kas_tunai",
      balance: 0,
      status: "terverifikasi",
    },
    {
      id: "acc-1102",
      code: "1102",
      name: "Kas Brankas Koperasi",
      type: "kas_tunai",
      balance: 0,
      status: "terverifikasi",
    },
    {
      id: "acc-1110",
      code: "1110",
      name: "Rekening Giro Bank Nagari (Rencana)",
      type: "bank",
      balance: 0,
      status: "belum_ditetapkan",
      bankName: "Bank Nagari",
    },
  ];

  private cashTransactions: CashTransaction[] = [];
  private memberDeposits: MemberDepositRecord[] = [];
  private journalEntries: JournalEntry[] = [];

  async getCashAccounts(): Promise<CashAccount[]> {
    return JSON.parse(JSON.stringify(this.cashAccounts));
  }

  async getCashTransactions(): Promise<CashTransaction[]> {
    return JSON.parse(JSON.stringify(this.cashTransactions.slice().reverse()));
  }

  async createExpense(
    data: Omit<CashTransaction, "id" | "trxNumber" | "type">
  ): Promise<CashTransaction> {
    const nextNum = `BKK-2026-09-${String(this.cashTransactions.length + 1).padStart(3, "0")}`;
    const newTx: CashTransaction = {
      ...data,
      id: `ctx-${Date.now()}`,
      trxNumber: nextNum,
      type: "keluar",
    };

    // Kurangi saldo rekening sumber
    const account = this.cashAccounts.find((a) => a.id === data.sourceAccountId);
    if (account) {
      account.balance -= data.amount;
    }

    // Buat entri jurnal berpasangan otomatis
    const jurNum = `JUR-2026-09-${String(this.journalEntries.length + 1).padStart(3, "0")}`;
    this.journalEntries.push({
      id: `jur-${Date.now()}`,
      entryNumber: jurNum,
      date: data.date,
      description: `Beban Persiapan: ${data.description}`,
      referenceNumber: nextNum,
      lines: [
        {
          accountId: "acc-6101",
          accountCode: "6101",
          accountName: "Beban Operasional Persiapan & Legalitas",
          debit: data.amount,
          credit: 0,
          description: data.description,
        },
        {
          accountId: account?.id || "acc-1102",
          accountCode: account?.code || "1102",
          accountName: account?.name || "Kas Koperasi",
          debit: 0,
          credit: data.amount,
          description: `Pengeluaran via ${account?.name || "Kas"}`,
        },
      ],
      totalDebit: data.amount,
      totalCredit: data.amount,
      status: "posted",
      createdBy: data.createdBy,
      postedAt: new Date().toISOString(),
    });

    this.cashTransactions.push(newTx);
    return { ...newTx };
  }

  async createInternalTransfer(
    sourceId: string,
    targetId: string,
    amount: number,
    notes: string,
    actor: string
  ): Promise<{ success: boolean; transaction?: CashTransaction; error?: string }> {
    const src = this.cashAccounts.find((a) => a.id === sourceId);
    const tgt = this.cashAccounts.find((a) => a.id === targetId);

    if (!src || !tgt) {
      return { success: false, error: "Rekening asal atau tujuan tidak ditemukan." };
    }

    if (src.balance < amount) {
      return {
        success: false,
        error: `Saldo pada ${src.name} (${formatRupiah(src.balance)}) tidak mencukupi untuk transfer ${formatRupiah(amount)}.`,
      };
    }

    // Mutasi saldo
    src.balance -= amount;
    tgt.balance += amount;

    const nextNum = `TRF-2026-09-${String(this.cashTransactions.length + 1).padStart(3, "0")}`;
    const newTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      trxNumber: nextNum,
      type: "transfer_internal",
      category: "mutasi_internal",
      sourceAccountId: src.id,
      targetAccountId: tgt.id,
      amount,
      date: new Date().toISOString().split("T")[0],
      description: `Mutasi Internal: Dari ${src.name} ke ${tgt.name} (${notes})`,
      createdBy: actor,
    };

    // Jurnal pemindahan kas
    const jurNum = `JUR-2026-09-${String(this.journalEntries.length + 1).padStart(3, "0")}`;
    this.journalEntries.push({
      id: `jur-${Date.now()}`,
      entryNumber: jurNum,
      date: new Date().toISOString().split("T")[0],
      description: `Mutasi Kas Internal: Dari ${src.name} ke ${tgt.name}`,
      referenceNumber: nextNum,
      lines: [
        {
          accountId: tgt.id,
          accountCode: tgt.code,
          accountName: tgt.name,
          debit: amount,
          credit: 0,
          description: "Penerimaan mutasi",
        },
        {
          accountId: src.id,
          accountCode: src.code,
          accountName: src.name,
          debit: 0,
          credit: amount,
          description: "Pengeluaran mutasi",
        },
      ],
      totalDebit: amount,
      totalCredit: amount,
      status: "posted",
      createdBy: actor,
      postedAt: new Date().toISOString(),
    });

    this.cashTransactions.push(newTx);
    return { success: true, transaction: { ...newTx } };
  }

  async getMemberDeposits(memberId?: string): Promise<MemberDepositRecord[]> {
    let list = [...this.memberDeposits];
    if (memberId) {
      list = list.filter((d) => d.memberId === memberId);
    }
    return JSON.parse(JSON.stringify(list.reverse()));
  }

  async createMemberDeposit(
    data: Omit<MemberDepositRecord, "id" | "depositNumber">
  ): Promise<MemberDepositRecord> {
    const nextNum = `BKM-SIMP-${String(this.memberDeposits.length + 1).padStart(3, "0")}`;
    const newRecord: MemberDepositRecord = {
      ...data,
      id: `dep-${Date.now()}`,
      depositNumber: nextNum,
    };

    // Tambah saldo rekening penerima
    const account = this.cashAccounts.find((a) => a.id === data.targetAccountId);
    if (account) {
      account.balance += data.amount;
    }

    // Update buku simpanan pada member
    const member = this.members.find((m) => m.id === data.memberId);
    if (member) {
      if (data.depositType === "pokok") {
        member.simpananPokokPaid = true;
        member.simpananPokokAmount = (member.simpananPokokAmount || 0) + data.amount;
      } else if (data.depositType === "wajib") {
        member.simpananWajibPaid = true;
        member.simpananWajibAmount = (member.simpananWajibAmount || 0) + data.amount;
      }
    }

    // Catat arus kas masuk (BUKAN omzet toko!)
    this.cashTransactions.push({
      id: `ctx-${Date.now()}`,
      trxNumber: nextNum,
      type: "masuk",
      category: "simpanan_anggota",
      sourceAccountId: data.targetAccountId,
      amount: data.amount,
      date: data.date,
      description: `Setoran ${data.depositType === "pokok" ? "Simpanan Pokok" : "Simpanan Wajib"} Anggota: ${data.memberName}`,
      createdBy: data.recordedBy,
      memberId: data.memberId,
      memberName: data.memberName,
    });

    // Buat jurnal double-entry: Kas bertambah (Debit), Ekuitas Simpanan bertambah (Kredit)
    const jurNum = `JUR-2026-09-${String(this.journalEntries.length + 1).padStart(3, "0")}`;
    const equityCode = data.depositType === "pokok" ? "3101" : "3102";
    const equityName =
      data.depositType === "pokok" ? "Simpanan Pokok Anggota" : "Simpanan Wajib Anggota";

    this.journalEntries.push({
      id: `jur-${Date.now()}`,
      entryNumber: jurNum,
      date: data.date,
      description: `Penerimaan ${equityName} an. ${data.memberName}`,
      referenceNumber: nextNum,
      lines: [
        {
          accountId: account?.id || "acc-1102",
          accountCode: account?.code || "1102",
          accountName: account?.name || "Kas Koperasi",
          debit: data.amount,
          credit: 0,
          description: `Penyetoran ke ${account?.name || "Kas"}`,
        },
        {
          accountId: `acc-${equityCode}`,
          accountCode: equityCode,
          accountName: equityName,
          debit: 0,
          credit: data.amount,
          description: `Setoran ${data.memberName}`,
        },
      ],
      totalDebit: data.amount,
      totalCredit: data.amount,
      status: "posted",
      createdBy: data.recordedBy,
      postedAt: new Date().toISOString(),
    });

    this.memberDeposits.push(newRecord);
    return { ...newRecord };
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return JSON.parse(JSON.stringify(this.journalEntries.slice().reverse()));
  }

  async createJournalEntry(
    data: Omit<JournalEntry, "id" | "entryNumber" | "status">
  ): Promise<{ success: boolean; entry?: JournalEntry; error?: string }> {
    // Validasi double-entry seimbang
    if (data.totalDebit !== data.totalCredit) {
      return {
        success: false,
        error: `Jurnal tidak seimbang! Total Debit (${formatRupiah(data.totalDebit)}) tidak sama dengan Total Kredit (${formatRupiah(data.totalCredit)}). Selisih: ${formatRupiah(Math.abs(data.totalDebit - data.totalCredit))}.`,
      };
    }

    const nextNum = `JUR-2026-09-${String(this.journalEntries.length + 1).padStart(3, "0")}`;
    const newEntry: JournalEntry = {
      ...data,
      id: `jur-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entryNumber: nextNum,
      status: "posted",
      postedAt: new Date().toISOString(),
    };

    this.journalEntries.push(newEntry);
    return { success: true, entry: { ...newEntry } };
  }

  async reverseJournalEntry(
    journalId: string,
    reason: string,
    actor: string
  ): Promise<{ success: boolean; reversalEntry?: JournalEntry; error?: string }> {
    const original = this.journalEntries.find((j) => j.id === journalId);
    if (!original) return { success: false, error: "Jurnal asli tidak ditemukan." };
    if (original.status === "reversed") {
      return { success: false, error: "Jurnal ini telah dibalikkan sebelumnya." };
    }

    const nextNum = `REV-${original.entryNumber}`;
    // Balik baris: Debit menjadi Kredit, Kredit menjadi Debit
    const reversedLines: JournalEntryLine[] = original.lines.map((l) => ({
      accountId: l.accountId,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: l.credit,
      credit: l.debit,
      description: `Pembalikan: ${l.description || original.description}`,
    }));

    const reversalEntry: JournalEntry = {
      id: `jur-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entryNumber: nextNum,
      date: new Date().toISOString().split("T")[0],
      description: `Jurnal Pembalikan atas ${original.entryNumber}: ${reason}`,
      referenceNumber: original.entryNumber,
      lines: reversedLines,
      totalDebit: original.totalCredit,
      totalCredit: original.totalDebit,
      status: "posted",
      createdBy: actor,
      postedAt: new Date().toISOString(),
      isReversal: true,
      reversalOfId: original.id,
    };

    original.status = "reversed";
    this.journalEntries.push(reversalEntry);
    return { success: true, reversalEntry: { ...reversalEntry } };
  }

  async getFinancialReportSummary(): Promise<FinancialReportSummary> {
    // 1. Total Penjualan
    const validSales = this.posTransactions.filter((t) => !t.isReturned);
    const totalRevenue = validSales.reduce((sum, t) => sum + t.grandTotal, 0);

    // 2. HPP Barang Terjual
    let costOfGoodsSold = 0;
    validSales.forEach((t) => {
      t.items.forEach((it) => {
        const prod = this.products.find((p) => p.id === it.productId);
        costOfGoodsSold += (prod ? prod.estimatedCost : 0) * it.quantity;
      });
    });

    const grossProfit = totalRevenue - costOfGoodsSold;

    // 3. Beban Operasional Persiapan (hanya dari transaksi kas berstatus sah/belum dibalik)
    const operatingExpenses = this.cashTransactions
      .filter((t) => t.type === "keluar" && t.category === "beban_persiapan")
      .reduce((sum, t) => sum + t.amount, 0);

    const netOperatingIncome = grossProfit - operatingExpenses;

    // 4. Saldo Kas Riil
    const totalCash = this.cashAccounts.reduce((sum, a) => sum + a.balance, 0);

    // 5. Nilai Persediaan Fisik (Stok Siap Jual + Stok Karantina) * Harga Beli
    const totalInventory = this.products.reduce((sum, p) => {
      const regStock = p.currentStock;
      const quaranStock = this.quarantineStocks[p.id] || 0;
      return sum + (regStock + quaranStock) * p.estimatedCost;
    }, 0);

    // 6. Aset Tetap Fisik
    const totalFixedAssets = this.fixedAssets
      .filter((a) => !a.isArchived)
      .reduce((sum, a) => sum + a.acquisitionCost, 0);

    // 7. Kewajiban (Utang Dagang PO atas persediaan yang belum dilunasi kas ke pemasok)
    const totalLiabilities = totalInventory + costOfGoodsSold;

    // 8. Ekuitas (Simpanan Pokok & Wajib + Modal Donasi/Hibah Aset Tetap Awal + Hasil Usaha Berjalan)
    const totalDeposits = this.memberDeposits.reduce((sum, d) => sum + d.amount, 0);
    const founderFixedAssetCapital = totalFixedAssets;
    const totalEquity = totalDeposits + founderFixedAssetCapital + netOperatingIncome;

    return {
      period: "Tahun Persiapan 2026/2027",
      totalRevenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      netOperatingIncome,
      totalCash,
      totalInventory,
      totalFixedAssets,
      totalLiabilities,
      totalEquity,
    };
  }
}

import { SupabaseProductionRepository } from "./supabase";

export { InMemoryPreparationRepository };
export { SupabaseProductionRepository };

export function isProductionDatabaseConfigured(): boolean {
  return !!(
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const defaultInMemory = new InMemoryPreparationRepository();

export const preparationRepository: IPreparationRepository = isProductionDatabaseConfigured()
  ? new SupabaseProductionRepository()
  : defaultInMemory;

export function getRepository(): IPreparationRepository {
  return isProductionDatabaseConfigured()
    ? new SupabaseProductionRepository()
    : preparationRepository;
}

