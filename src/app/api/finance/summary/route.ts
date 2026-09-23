import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sesi masuk diperlukan." }, { status: 401 });

    const supabase = await createClient();

    // Ambil rekap harian gerai dan produk untuk menghitung aset & SHU
    const [reportsRes, productsRes, membersRes] = await Promise.all([
      supabase.from("unit_daily_reports").select("gross_revenue, operational_expenses, net_profit, cash_in_hand, report_date"),
      supabase.from("products").select("current_stock, min_stock").eq("is_archived", false),
      supabase.from("members").select("id", { count: "exact", head: true }).eq("is_archived", false),
    ]);

    let totalGrossRevenue = 0;
    let totalExpenses = 0;
    let totalCashReceived = 0;

    if (reportsRes.data && Array.isArray(reportsRes.data)) {
      for (const row of reportsRes.data) {
        totalGrossRevenue += Number(row.gross_revenue) || 0;
        totalExpenses += Number(row.operational_expenses) || 0;
        totalCashReceived += Number(row.cash_in_hand) || (Number(row.gross_revenue) - Number(row.operational_expenses));
      }
    }

    // SHU Berjalan
    const currentShu = Math.max(0, totalGrossRevenue - totalExpenses);

    // Hitung Estimasi Nilai Stok Sederhana (misal Rp20.000 rata-rata komoditas pokok)
    let totalStockQty = 0;
    if (productsRes.data && Array.isArray(productsRes.data)) {
      for (const p of productsRes.data) {
        totalStockQty += Number(p.current_stock) || 0;
      }
    }
    const estimatedInventoryValue = totalStockQty * 20000;

    // Aset
    const kasOperasional = Math.max(0, totalCashReceived);
    const kasBank = 25000000; // Modal awal di rekening bank koperasi
    const asetTetap = 15000000; // Perlengkapan etalase/rak gerai
    const totalAsetLancar = kasOperasional + kasBank + estimatedInventoryValue;
    const totalAset = totalAsetLancar + asetTetap;

    // Kewajiban
    const totalKewajiban = 0; // Koperasi tanpa utang komersial

    // Ekuitas / Modal (Seimbang dengan Total Aset)
    const modalAwal = kasBank + asetTetap + estimatedInventoryValue;
    const totalEkuitas = modalAwal + currentShu;

    // Alokasi Pembagian SHU Sesuai Standar Koperasi
    const alokasiShu = {
      cadangan: Math.round(currentShu * 0.40),      // 40% Dana Cadangan
      jasaUsaha: Math.round(currentShu * 0.25),     // 25% Jasa Anggota (Belanja)
      jasaModal: Math.round(currentShu * 0.20),     // 20% Jasa Simpanan Modal
      pengurus: Math.round(currentShu * 0.05),      // 5% Insentif Pengurus & Pengawas
      pendidikan: Math.round(currentShu * 0.05),    // 5% Dana Pendidikan Perkoperasian
      sosial: Math.round(currentShu * 0.05),        // 5% Dana Sosial Nagari Ladang Laweh
    };

    return NextResponse.json({
      summary: {
        totalGrossRevenue,
        totalExpenses,
        currentShu,
        totalMembers: membersRes.count ?? 0,
      },
      bukuBesar: {
        kasOperasional,
        kasBank,
        totalPenerimaan: totalGrossRevenue,
        totalPengeluaran: totalExpenses,
        saldoKasTersedia: kasOperasional + kasBank,
      },
      neraca: {
        aset: {
          kasBank,
          kasTunai: kasOperasional,
          persediaanBarang: estimatedInventoryValue,
          totalAsetLancar,
          asetTetap,
          totalAset,
        },
        kewajiban: {
          utangUsaha: 0,
          utangLancarLainnya: 0,
          totalKewajiban,
        },
        ekuitas: {
          modalAwal,
          shuBerjalan: currentShu,
          totalEkuitas,
        },
        isBalanced: totalAset === (totalKewajiban + totalEkuitas),
      },
      alokasiShu,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
