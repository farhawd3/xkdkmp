import { NextResponse } from "next/server";
import { verifyPrivateApiAccess } from "@/lib/security/private-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const access = verifyPrivateApiAccess(request);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Akses ditolak." }, { status: access.status || 403 });
    }

    const supabase = await createClient();

    // Ambil rekap harian gerai, data produk fisik, dan anggota secara paralel
    const [reportsRes, productsRes, membersRes] = await Promise.all([
      supabase.from("unit_daily_reports").select("gross_revenue, operational_expenses, net_profit, cash_in_hand, report_date"),
      supabase.from("products").select("current_stock, min_stock").eq("is_archived", false),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
    ]);

    // Pemeriksaan galat database secara fail-fast (tidak menyamarkan error menjadi angka nol)
    const dbError = reportsRes.error || productsRes.error || membersRes.error;
    if (dbError) {
      return NextResponse.json(
        { error: "Gagal membaca data keuangan dari database: " + dbError.message },
        { status: 500 }
      );
    }

    let totalGrossRevenue = 0;
    let totalExpenses = 0;
    let totalCashReceived = 0;
    const reportCount = (reportsRes.data && Array.isArray(reportsRes.data)) ? reportsRes.data.length : 0;

    if (reportsRes.data && Array.isArray(reportsRes.data)) {
      for (const row of reportsRes.data) {
        const rev = Number(row.gross_revenue) || 0;
        const exp = Number(row.operational_expenses) || 0;
        totalGrossRevenue += rev;
        totalExpenses += exp;

        // Pertahankan nilai cash_in_hand = 0 (jangan gunakan || yang menimpa angka 0)
        if (row.cash_in_hand !== null && row.cash_in_hand !== undefined && !isNaN(Number(row.cash_in_hand))) {
          totalCashReceived += Number(row.cash_in_hand);
        } else {
          totalCashReceived += (rev - exp);
        }
      }
    }

    // Selisih operasional tercatat (dapat bernilai negatif jika terjadi defisit operasional)
    const netOperationalMargin = totalGrossRevenue - totalExpenses;

    // Hitung total kuantitas fisik stok barang (unit), bukan valuasi rupiah buatan
    let totalStockQty = 0;
    if (productsRes.data && Array.isArray(productsRes.data)) {
      for (const p of productsRes.data) {
        totalStockQty += Number(p.current_stock) || 0;
      }
    }

    // Pos Keuangan yang Jujur (Tanpa Saldo Rekaan):
    // 1. Kas Operasional Fisik: Akumulasi uang setoran nyata dari gerai
    const kasOperasional = totalCashReceived;

    // 2. Rekening Bank & Aset Tetap: Belum terhubung / belum tercatat (Mode Persiapan 2027)
    const kasBank = null;
    const asetTetap = null;

    // 3. Simulasi SHU (Belum disahkan oleh RAT / AD-ART resmi — Ref: [TERBUKA-08])
    const simulasiBasis = Math.max(0, netOperationalMargin);
    const alokasiShu = {
      isSimulated: true,
      status: "belum_ditetapkan",
      keterangan: "Simulasi alokasi — persentase resmi menunggu pengesahan AD/ART dalam RAT",
      basisPerhitungan: simulasiBasis,
      cadangan: Math.round(simulasiBasis * 0.40),      // 40% Dana Cadangan
      jasaUsaha: Math.round(simulasiBasis * 0.25),     // 25% Jasa Usaha Belanja
      jasaModal: Math.round(simulasiBasis * 0.20),     // 20% Jasa Simpanan Modal
      pengurus: Math.round(simulasiBasis * 0.05),      // 5% Insentif Pengurus & Pengawas
      pendidikan: Math.round(simulasiBasis * 0.05),    // 5% Dana Pendidikan Perkoperasian
      sosial: Math.round(simulasiBasis * 0.05),        // 5% Dana Sosial Nagari Ladang Laweh
    };

    return NextResponse.json({
      summary: {
        totalGrossRevenue,
        totalExpenses,
        currentShu: netOperationalMargin,
        netOperationalMargin,
        totalMembers: membersRes.count ?? 0,
        reportCount,
        hasReports: reportCount > 0,
      },
      bukuBesar: {
        kasOperasional,
        kasBank: null,
        kasBankStatus: "belum_terhubung",
        totalPenerimaan: totalGrossRevenue,
        totalPengeluaran: totalExpenses,
        saldoKasTersedia: kasOperasional, // Kas riil yang tercatat
        hasReports: reportCount > 0,
      },
      neraca: {
        status: "persiapan",
        isBalanced: false,
        statusNote: "Neraca sementara (Mode Persiapan 2027) — pos modal awal dan rekening bank menunggu penetapan resmi pengurus.",
        aset: {
          kasBank: null,
          kasBankStatus: "belum_terhubung",
          kasTunai: kasOperasional,
          persediaanBarang: null,
          persediaanQty: totalStockQty,
          persediaanStatus: "hanya_kuantitas_fisik",
          totalAsetLancar: kasOperasional,
          asetTetap: null,
          asetTetapStatus: "belum_tercatat",
          totalAset: kasOperasional,
        },
        kewajiban: {
          utangUsaha: 0,
          utangLancarLainnya: 0,
          totalKewajiban: 0,
        },
        ekuitas: {
          modalAwal: null,
          modalAwalStatus: "belum_ditetapkan",
          shuBerjalan: netOperationalMargin,
          totalEkuitas: null,
        },
      },
      alokasiShu,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
