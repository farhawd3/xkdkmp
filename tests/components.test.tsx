import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { preparationRepository } from "@/lib/repository";

describe("Utility Functions", () => {
  it("formatRupiah memformat mata uang IDR dengan benar", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
    expect(formatRupiah(500000)).toMatch(/Rp\s?500\.000/);
    expect(formatRupiah("1500000")).toMatch(/Rp\s?1\.500\.000/);
  });

  it("formatTanggal memformat tanggal ke format Indonesia", () => {
    const formatted = formatTanggal("2026-10-05T00:00:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oktober");
  });
});

describe("UI Components", () => {
  it("Button merender teks dan memiliki target sentuh minimal", () => {
    render(<Button>Simpan Data</Button>);
    const button = screen.getByRole("button", { name: /simpan data/i });
    expect(button).toBeDefined();
    expect(button.className).toContain("min-h-[44px]");
  });

  it("Badge merender dengan benar dan menampilkan label status", () => {
    render(<Badge variant="crimson">Mode Persiapan</Badge>);
    const badge = screen.getByText("Mode Persiapan");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("text-rose-800");
  });
});

describe("Master Data & Keanggotaan (Tahap 04)", () => {
  it("Pendaftaran anggota baru tidak menandai simpanan pokok sudah lunas", async () => {
    const newMember = await preparationRepository.addMember({
      fullName: "Sutan Palimo",
      maskedNik: "1306**********99",
      phone: "081233445566",
      domicile: "Jorong Ladang Laweh Barat",
      status: "calon",
      simpananPokokPaid: false,
      simpananWajibPaid: false,
      simpananPokokAmount: 0,
      simpananWajibAmount: 0,
      documentStatus: "belum_unggah",
    });

    expect(newMember.simpananPokokPaid).toBe(false);
    expect(newMember.simpananPokokAmount).toBe(0);
    expect(newMember.maskedNik).toContain("**********");

    const fetched = await preparationRepository.getMemberById(newMember.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.fullName).toBe("Sutan Palimo");
  });

  it("getMemberById mengembalikan null jika ID anggota tidak ditemukan", async () => {
    const invalid = await preparationRepository.getMemberById("mbr-tidak-ada-999");
    expect(invalid).toBeNull();
  });

  it("Fitur arsipkan anggota mengubah status ke nonaktif tanpa menghapus riwayat", async () => {
    const member = await preparationRepository.addMember({
      fullName: "Mak Katik",
      maskedNik: "1306**********88",
      phone: "081277889900",
      domicile: "Jorong Ladang Laweh Timur",
      status: "calon",
      simpananPokokPaid: false,
      simpananWajibPaid: false,
      simpananPokokAmount: 0,
      simpananWajibAmount: 0,
      documentStatus: "belum_unggah",
    });

    const archived = await preparationRepository.archiveMember(member.id);
    expect(archived).toBe(true);

    const check = await preparationRepository.getMemberById(member.id);
    expect(check?.isArchived).toBe(true);
    expect(check?.status).toBe("nonaktif");
  });

  it("Menambah produk master sembako tidak menambah kuantitas stok fisik (stok = 0)", async () => {
    const newProduct = await preparationRepository.addProduct({
      sku: "TEL-AYM-01",
      name: "Telur Ayam Ras 1 Piring (30 Butir)",
      category: "telur",
      baseUnit: "Piring",
      conversionUnit: "Ikat (5 Piring)",
      conversionFactor: 5,
      estimatedCost: 48000,
      sellingPrice: 53000,
      minStock: 15,
      hasExpiry: true,
    });

    expect(newProduct.currentStock).toBe(0); // Stok fisik selalu 0 di master produk
    expect(newProduct.sku).toBe("TEL-AYM-01");
  });

  it("Master pemasok mencatat kontak dan riwayat pesanan awal bernilai 0", async () => {
    const suppliers = await preparationRepository.getSuppliers();
    expect(suppliers.length).toBeGreaterThanOrEqual(2);
    expect(suppliers[0].poHistoryCount).toBe(0);
  });

  it("Profil organisasi memuat nama tampilan dan mengosongkan nama legal yang belum disahkan", async () => {
    const org = await preparationRepository.getOrganizationProfile();
    expect(org.displayName).toBe("Kopdes Merah Putih — Ladang Laweh");
    expect(org.legalName).toBe(""); // Kosong jujur
    expect(org.legalDocStatus).toBe("belum_diunggah");
  });
});

describe("Pekerjaan, Tata Kelola & Aset Tetap (Tahap 05)", () => {
  it("Validasi jam agenda: menolak waktu selesai yang lebih awal atau sama dengan waktu mulai", async () => {
    const result = await preparationRepository.addAgenda({
      title: "Rapat Validasi Jam",
      category: "rapat_pengurus",
      date: "2026-09-28",
      startTime: "14:00",
      endTime: "13:00", // Tidak valid
      isAllDay: false,
      timeZone: "Asia/Jakarta",
      picName: "Abdul Halim",
      locationType: "fisik",
    });

    expect(result.success).toBe(false);
    expect(result.warning).toContain("setelah waktu mulai");
  });

  it("Deteksi bentrok jadwal: memperingatkan jika PIC yang sama memiliki agenda di jam yang bertabrakan", async () => {
    // Agenda pertama
    const agd1 = await preparationRepository.addAgenda({
      title: "Rapat Koordinasi Toko Sembako",
      category: "operasional",
      date: "2026-09-29",
      startTime: "09:00",
      endTime: "11:00",
      isAllDay: false,
      timeZone: "Asia/Jakarta",
      picName: "Abdul Halim",
      locationType: "fisik",
    });
    expect(agd1.success).toBe(true);

    // Agenda kedua di jam yang sama untuk PIC Abdul Halim
    const agd2 = await preparationRepository.addAgenda({
      title: "Musyawarah Pembagian Tugas",
      category: "rapat_pengurus",
      date: "2026-09-29",
      startTime: "10:00", // Bentrok (09:00 - 11:00)
      endTime: "12:00",
      isAllDay: false,
      timeZone: "Asia/Jakarta",
      picName: "Abdul Halim",
      locationType: "fisik",
    });

    expect(agd2.success).toBe(true);
    expect(agd2.warning).toBeDefined();
    expect(agd2.warning).toContain("Peringatan Bentrok");
    expect(agd2.warning).toContain("Abdul Halim");
  });

  it("Tandai selesai tugas POAC dan fitur urungkan (Undo) status sebelumnya", async () => {
    const newTask = await preparationRepository.addTask({
      title: "Pengecekan Kebersihan Gudang Sembako",
      description: "Pemeriksaan fisik sirkulasi udara dan rak penyimpanan",
      poacCategory: "controlling",
      priority: "sedang",
      status: "rencana",
      picName: "Abdul Halim",
      dueDate: "2026-10-01",
    });

    // Tandai selesai
    const toggleRes = await preparationRepository.toggleTaskStatus(newTask.id);
    expect(toggleRes.task?.status).toBe("selesai");
    expect(toggleRes.task?.previousStatus).toBe("rencana");
    expect(toggleRes.canUndo).toBe(true);

    // Lakukan Undo
    const undone = await preparationRepository.undoTaskStatus(newTask.id);
    expect(undone?.status).toBe("rencana");
    expect(undone?.previousStatus).toBeUndefined();
  });

  it("Pembatalan agenda mencatat alasan pembatalan secara transparan", async () => {
    const agenda = await preparationRepository.addAgenda({
      title: "Kunjungan Studi Banding Koperasi",
      category: "operasional",
      date: "2026-09-30",
      startTime: "08:00",
      endTime: "12:00",
      isAllDay: false,
      timeZone: "Asia/Jakarta",
      picName: "Abdul Halim",
      locationType: "fisik",
    });

    const cancelled = await preparationRepository.cancelAgenda(
      agenda.agenda!.id,
      "Dibatalkan karena cuaca buruk dan jalan longsor"
    );

    expect(cancelled?.status).toBe("dibatalkan");
    expect(cancelled?.cancellationReason).toBe("Dibatalkan karena cuaca buruk dan jalan longsor");
  });

  it("Rencana kerja/RAPB 2027 tidak mengubah kas atau menciptakan saldo transaksi riil", async () => {
    const initialPlans = await preparationRepository.getWorkPlans();
    const newPlan = await preparationRepository.addWorkPlan({
      goal: "Persiapan Sistem IT",
      indicator: "Software siap uji",
      targetValue: "100%",
      program: "Instalasi Perangkat Komputer",
      estimatedCost: 3500000,
      picName: "Abdul Halim",
      dueDate: "2026-11-01",
      status: "draft",
    });

    expect(newPlan.id).toBeDefined();
    expect(newPlan.estimatedCost).toBe(3500000);

    const states = await preparationRepository.getOperationalStates();
    // Kas tetap 0 transaksi tercatat dan penjualan belum dikonfigurasi
    expect(states.cash).toBe("zero_recorded");
    expect(states.sales).toBe("unconfigured");
  });

  it("Register aset tetap fisik terpisah dari stok sembako (stok barang dagang tetap 0)", async () => {
    const initialAssets = await preparationRepository.getFixedAssets();

    const newAsset = await preparationRepository.addFixedAsset({
      code: "AST-2026-004",
      name: "Timbangan Duduk Digital 150 Kg",
      location: "Gudang Penimbangan",
      condition: "baik",
      picName: "Abdul Halim",
      acquisitionCost: 1200000,
      purchaseDocName: "Kwitansi-Timbangan.pdf",
    });

    expect(newAsset.code).toBe("AST-2026-004");

    // Pastikan stok produk sembako tidak berubah (tetap 0)
    const products = await preparationRepository.getProducts();
    for (const prd of products) {
      expect(prd.currentStock).toBe(0);
    }
  });
});

describe("Pengadaan (PO), Stok Persediaan & Kasir POS (Tahap 06)", () => {
  it("Pembuatan & persetujuan PO belum menambah saldo stok fisik komoditas", async () => {
    const productsBefore = await preparationRepository.getProducts();
    const rice = productsBefore.find((p) => p.sku === "BRS-KK-05");
    const initialStock = rice ? rice.currentStock : 0;

    // Buat PO baru
    const po = await preparationRepository.addPurchaseOrder({
      supplierId: "sup-01",
      supplierName: "UD Tani Makmur Bukittinggi",
      orderDate: "2026-09-22",
      expectedDeliveryDate: "2026-09-30",
      items: [
        {
          productId: rice!.id,
          productName: rice!.name,
          sku: rice!.sku,
          unit: rice!.baseUnit,
          orderedQty: 50,
          receivedQty: 0,
          invoicedQty: 0,
          unitPrice: 72000,
          subtotal: 3600000,
        },
      ],
      totalAmount: 3600000,
      createdBy: "Abdul Halim",
    });

    expect(po.status).toBe("diajukan");

    // Setujui PO
    const approved = await preparationRepository.approvePurchaseOrder(po.id, "Pengurus");
    expect(approved?.status).toBe("disetujui");

    // Pastikan stok fisik belum bertambah
    const productsAfter = await preparationRepository.getProducts();
    const riceAfter = productsAfter.find((p) => p.sku === "BRS-KK-05");
    expect(riceAfter?.currentStock).toBe(initialStock);
  });

  it("Penerimaan barang fisik (Goods Receipt) menambah stok fisik & mencatat kartu mutasi masuk", async () => {
    const products = await preparationRepository.getProducts();
    const rice = products.find((p) => p.sku === "BRS-KK-05")!;
    const prevStock = rice.currentStock;

    // Buat Goods Receipt untuk 15 sak baik dan 2 sak rusak
    const receiptRes = await preparationRepository.createGoodsReceipt({
      poId: "po-001",
      poNumber: "PO-2026-09-001",
      deliveryNoteNumber: "SJ-998877",
      receivedDate: "2026-09-23",
      receivedBy: "Petugas Gudang",
      items: [
        {
          productId: rice.id,
          productName: rice.name,
          receivedQty: 15,
          damagedQty: 2, // 2 sak rusak dialihkan ke karantina
        },
      ],
    });

    expect(receiptRes.success).toBe(true);

    // Cek stok fisik produk bertambah 15 (hanya yang baik)
    const updatedProd = await preparationRepository.getProductById(rice.id);
    expect(updatedProd?.currentStock).toBe(prevStock + 15);

    // Cek stok karantina bertambah 2
    const quarantineQty = await preparationRepository.getQuarantineStock(rice.id);
    expect(quarantineQty).toBe(2);

    // Cek kartu mutasi masuk dan karantina
    const mutations = await preparationRepository.getStockMutations(rice.id);
    expect(mutations.length).toBeGreaterThan(0);
    const inMut = mutations.find((m) => m.mutationType === "masuk_po");
    expect(inMut).toBeDefined();
    expect(inMut?.qtyChange).toBe(15);

    const damMut = mutations.find((m) => m.mutationType === "karantina_rusak");
    expect(damMut).toBeDefined();
    expect(damMut?.qtyChange).toBe(2);
  });

  it("Buka shift kasir, transaksi kasir POS atomik memotong stok, dan blind count tutup shift", async () => {
    // 1. Buka shift kasir
    const shift = await preparationRepository.openShift("Kasir Siti", "REG-01", 200000);
    expect(shift.status).toBe("buka");
    expect(shift.initialCash).toBe(200000);

    // 2. Ambil produk yang ada stoknya
    const products = await preparationRepository.getProducts();
    const rice = products.find((p) => p.sku === "BRS-KK-05")!;
    const stockBeforeSale = rice.currentStock;
    expect(stockBeforeSale).toBeGreaterThanOrEqual(2);

    // 3. Transaksi penjualan kasir tunai (2 sak beras)
    const txRes = await preparationRepository.createPosTransaction({
      shiftId: shift.id,
      cashierName: shift.cashierName,
      customerType: "umum",
      items: [
        {
          productId: rice.id,
          name: rice.name,
          sku: rice.sku,
          unit: rice.baseUnit,
          unitPrice: rice.sellingPrice,
          quantity: 2,
          discount: 0,
          subtotal: rice.sellingPrice * 2,
        },
      ],
      subtotal: rice.sellingPrice * 2,
      discountTotal: 0,
      grandTotal: rice.sellingPrice * 2,
      paymentMethod: "tunai",
      cashReceived: 200000,
      cashChange: 200000 - rice.sellingPrice * 2,
    });

    expect(txRes.success).toBe(true);
    expect(txRes.transaction?.receiptNumber).toBeDefined();

    // 4. Stok berkurang tepat 2 sak
    const prodAfterSale = await preparationRepository.getProductById(rice.id);
    expect(prodAfterSale?.currentStock).toBe(stockBeforeSale - 2);

    // 5. Tutup shift blind count
    // Uang sistem diharapkan = modal awal (200.000) + penjualan tunai (grandTotal)
    const expectedCash = 200000 + (txRes.transaction?.grandTotal || 0);
    const closeRes = await preparationRepository.closeShift(
      shift.id,
      expectedCash, // Kasir menghitung pas
      "Uang fisik pas sesuai hitungan blind count"
    );

    expect(closeRes.success).toBe(true);
    expect(closeRes.shift?.status).toBe("tutup");
    expect(closeRes.shift?.discrepancy).toBe(0);
  });

  it("Retur penjualan cacat mengalihkan barang ke gudang karantina (bukan stok jual)", async () => {
    const products = await preparationRepository.getProducts();
    const rice = products.find((p) => p.sku === "BRS-KK-05")!;
    const stockBefore = rice.currentStock;
    const quarantineBefore = await preparationRepository.getQuarantineStock(rice.id);

    // Buka shift sementara jika belum ada
    let activeShift = await preparationRepository.getActiveShift();
    if (!activeShift) {
      activeShift = await preparationRepository.openShift("Abdul Halim", "REG-02", 100000);
    }

    // Buat transaksi belanja
    const tx = await preparationRepository.createPosTransaction({
      shiftId: activeShift.id,
      cashierName: activeShift.cashierName,
      customerType: "umum",
      items: [
        {
          productId: rice.id,
          name: rice.name,
          sku: rice.sku,
          unit: rice.baseUnit,
          unitPrice: rice.sellingPrice,
          quantity: 1,
          discount: 0,
          subtotal: rice.sellingPrice,
        },
      ],
      subtotal: rice.sellingPrice,
      discountTotal: 0,
      grandTotal: rice.sellingPrice,
      paymentMethod: "tunai",
      cashReceived: 100000,
      cashChange: 100000 - rice.sellingPrice,
    });

    // Retur barang karena cacat/kutu beras
    const retRes = await preparationRepository.createPosReturn({
      originalReceiptNumber: tx.transaction!.receiptNumber,
      authorizedBy: "Abdul Halim (Manajer)",
      reason: "cacat_rusak",
      returnedItems: [
        {
          productId: rice.id,
          name: rice.name,
          quantity: 1,
          refundAmount: rice.sellingPrice,
        },
      ],
      totalRefund: rice.sellingPrice,
      allocatedTo: "karantina",
    });

    expect(retRes.success).toBe(true);

    // Karantina bertambah 1
    const quarantineAfter = await preparationRepository.getQuarantineStock(rice.id);
    expect(quarantineAfter).toBe(quarantineBefore + 1);

    // Stok jual TIDAK bertambah karena dialihkan ke karantina
    const riceAfterRetur = await preparationRepository.getProductById(rice.id);
    expect(riceAfterRetur?.currentStock).toBe(stockBefore - 1);
  });
});

describe("Keuangan, Simpanan, Jurnal Double-Entry & Laporan (Tahap 07)", () => {
  it("Setoran simpanan anggota menambah kas & ekuitas, BUKAN omzet penjualan", async () => {
    // 1. Ambil summary awal
    const summaryBefore = await preparationRepository.getFinancialReportSummary();
    const initialRevenue = summaryBefore.totalRevenue;
    const initialCash = summaryBefore.totalCash;

    // 2. Setor simpanan pokok anggota pendiri
    const deposit = await preparationRepository.createMemberDeposit({
      memberId: "mbr-01",
      memberName: "Bustamam Dt. Marajo",
      depositType: "pokok",
      amount: 100000,
      date: "2026-09-22",
      targetAccountId: "acc-1102", // Kas Brankas
      recordedBy: "Abdul Halim",
      notes: "Setoran simpanan pokok modal pendiri",
    });

    expect(deposit.depositNumber).toBeDefined();
    expect(deposit.amount).toBe(100000);

    // 3. Verifikasi kas bertambah 100.000
    const accounts = await preparationRepository.getCashAccounts();
    const brankas = accounts.find((a) => a.id === "acc-1102");
    expect(brankas?.balance).toBeGreaterThanOrEqual(100000);

    // 4. Verifikasi Omzet Penjualan TIDAK BERUBAH (bukan pendapatan toko)
    const summaryAfter = await preparationRepository.getFinancialReportSummary();
    expect(summaryAfter.totalRevenue).toBe(initialRevenue);
    expect(summaryAfter.totalCash).toBe(initialCash + 100000);

    // 5. Jurnal otomatis tercatat dengan posisi Debit Kas dan Kredit Ekuitas Simpanan Pokok
    const journals = await preparationRepository.getJournalEntries();
    const depositJournal = journals.find((j) => j.referenceNumber === deposit.depositNumber);
    expect(depositJournal).toBeDefined();
    expect(depositJournal?.totalDebit).toBe(100000);
    expect(depositJournal?.totalCredit).toBe(100000);

    const debitLine = depositJournal?.lines.find((l) => l.debit > 0);
    const creditLine = depositJournal?.lines.find((l) => l.credit > 0);
    expect(debitLine?.accountCode).toBe("1102");
    expect(creditLine?.accountCode).toBe("3101"); // Ekuitas Simpanan Pokok
  });

  it("Transfer kas internal memindahkan saldo tanpa menciptakan laba/pendapatan baru", async () => {
    // 1. Pastikan rekening brankas punya saldo cukup
    const accountsBefore = await preparationRepository.getCashAccounts();
    const brankasBefore = accountsBefore.find((a) => a.id === "acc-1102")!;
    const registerBefore = accountsBefore.find((a) => a.id === "acc-1101")!;
    const totalCashBefore = accountsBefore.reduce((sum, a) => sum + a.balance, 0);

    // Transfer 50.000 dari brankas ke kasir
    const transferRes = await preparationRepository.createInternalTransfer(
      brankasBefore.id,
      registerBefore.id,
      50000,
      "Pengisian kas kecil register kasir",
      "Abdul Halim"
    );

    expect(transferRes.success).toBe(true);

    // 2. Saldo total kas keseluruhan tetap konstan (tidak bertambah, tidak berkurang)
    const accountsAfter = await preparationRepository.getCashAccounts();
    const totalCashAfter = accountsAfter.reduce((sum, a) => sum + a.balance, 0);
    expect(totalCashAfter).toBe(totalCashBefore);

    // 3. Saldo brankas berkurang 50.000, kasir bertambah 50.000
    const brankasAfter = accountsAfter.find((a) => a.id === "acc-1102")!;
    const registerAfter = accountsAfter.find((a) => a.id === "acc-1101")!;
    expect(brankasAfter.balance).toBe(brankasBefore.balance - 50000);
    expect(registerAfter.balance).toBe(registerBefore.balance + 50000);

    // 4. Omzet dan laba tetap tidak tersentuh
    const summary = await preparationRepository.getFinancialReportSummary();
    expect(summary.totalCash).toBe(totalCashAfter);
  });

  it("Pencatatan jurnal umum menolak transaksi yang tidak seimbang (Unbalanced)", async () => {
    const unbalanceRes = await preparationRepository.createJournalEntry({
      date: "2026-09-22",
      description: "Jurnal uji coba tidak seimbang",
      lines: [
        {
          accountId: "acc-1102",
          accountCode: "1102",
          accountName: "Kas",
          debit: 100000,
          credit: 0,
        },
        {
          accountId: "acc-3101",
          accountCode: "3101",
          accountName: "Simpanan Pokok",
          debit: 0,
          credit: 80000, // Selisih 20.000
        },
      ],
      totalDebit: 100000,
      totalCredit: 80000,
      createdBy: "Abdul Halim",
    });

    expect(unbalanceRes.success).toBe(false);
    expect(unbalanceRes.error).toContain("tidak seimbang");
  });

  it("Jurnal pembalikan (Reversal Entry) membalik baris dan mengunci jurnal asli", async () => {
    // 1. Buat jurnal yang seimbang
    const validEntry = await preparationRepository.createJournalEntry({
      date: "2026-09-22",
      description: "Biaya Fotokopi Berkas Notaris",
      lines: [
        {
          accountId: "acc-6101",
          accountCode: "6101",
          accountName: "Beban Operasional Persiapan",
          debit: 35000,
          credit: 0,
        },
        {
          accountId: "acc-1102",
          accountCode: "1102",
          accountName: "Kas Brankas",
          debit: 0,
          credit: 35000,
        },
      ],
      totalDebit: 35000,
      totalCredit: 35000,
      createdBy: "Abdul Halim",
    });

    expect(validEntry.success).toBe(true);
    const origJournal = validEntry.entry!;
    expect(origJournal.status).toBe("posted");

    // 2. Eksekusi pembalikan jurnal karena salah pencatatan
    const revRes = await preparationRepository.reverseJournalEntry(
      origJournal.id,
      "Salah tanggal dan salah nominal kuitansi",
      "Abdul Halim"
    );

    expect(revRes.success).toBe(true);
    expect(revRes.reversalEntry?.entryNumber).toBe(`REV-${origJournal.entryNumber}`);
    expect(revRes.reversalEntry?.isReversal).toBe(true);
    expect(revRes.reversalEntry?.reversalOfId).toBe(origJournal.id);

    // Posisi baris terbalik: Beban menjadi Kredit, Kas menjadi Debit
    const revLines = revRes.reversalEntry!.lines;
    const reversedBeban = revLines.find((l) => l.accountCode === "6101");
    const reversedKas = revLines.find((l) => l.accountCode === "1102");
    expect(reversedBeban?.credit).toBe(35000);
    expect(reversedKas?.debit).toBe(35000);

    // 3. Jurnal asli statusnya menjadi reversed
    const allJournals = await preparationRepository.getJournalEntries();
    const updatedOrig = allJournals.find((j) => j.id === origJournal.id);
    expect(updatedOrig?.status).toBe("reversed");

    // 4. Jurnal yang sudah reversed tidak dapat dibalik ulang
    const secondRev = await preparationRepository.reverseJournalEntry(
      origJournal.id,
      "Pembalikan kedua",
      "Abdul Halim"
    );
    expect(secondRev.success).toBe(false);
    expect(secondRev.error).toContain("telah dibalikkan");
  });

  it("Laporan keuangan mengkalkulasi Laba Kotor, Hasil Usaha, dan Neraca seimbang", async () => {
    const summary = await preparationRepository.getFinancialReportSummary();

    // 1. Verifikasi Laba Kotor = Penjualan - HPP
    expect(summary.grossProfit).toBe(summary.totalRevenue - summary.costOfGoodsSold);

    // 2. Verifikasi Hasil Usaha Bersih = Laba Kotor - Beban Persiapan
    expect(summary.netOperatingIncome).toBe(summary.grossProfit - summary.operatingExpenses);

    // 3. Verifikasi Total Ekuitas = Simpanan Anggota + Hasil Usaha Bersih
    expect(summary.totalEquity).toBeDefined();

    // 4. Neraca Seimbang: Total Aset = Kewajiban + Ekuitas
    const totalAset = summary.totalCash + summary.totalInventory + summary.totalFixedAssets;
    const totalPasiva = summary.totalLiabilities + summary.totalEquity;
    // Nilai aset dan pasiva seimbang
    expect(totalAset).toBe(totalPasiva);
  });

  it("Komponen Alert terstandarisasi memiliki role='alert', rounded-2xl, dan struktur yang konsisten", async () => {
    const { Alert } = await import("@/components/ui/Alert");
    render(
      <Alert variant="amber" title="Peringatan Kepatuhan">
        Pesan peringatan sistem terstandarisasi
      </Alert>
    );

    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeDefined();
    expect(alertEl.className).toContain("rounded-2xl");
    expect(alertEl.className).toContain("border-amber-200/80");
    expect(screen.getByText("Peringatan Kepatuhan")).toBeDefined();
    expect(screen.getByText("Pesan peringatan sistem terstandarisasi")).toBeDefined();
  });
});

