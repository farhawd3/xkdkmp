import { describe, expect, it } from "vitest";
import { managerActions, reportingProgress, managerSnapshotRows, type DashboardSummary } from "@/lib/manager-summary";
import { SimpleMemberUpdateSchema } from "@/lib/validations/simple-schemas";
import { isLoopbackHost, verifyPrivateApiAccess } from "@/lib/security/private-access";

const summary: DashboardSummary = {
  totalUnits: 5, activeUnits: 2, activeReportedUnits: 1, totalMembers: 3,
  activeTasks: 1, urgentTasks: 1, urgentTaskList: [], todayReports: 3,
  monthRevenue: 100, monthExpenses: 200, monthProfit: -100,
  dailyTrend: [], unreportedUnits: [{ id: "u1", name: "Gerai aktif" }], businessStatus: "persiapan",
};

describe("Ringkasan manajer dan integrasi", () => {
  it("kepatuhan hanya membandingkan gerai aktif, bukan seluruh laporan", () => {
    expect(reportingProgress(summary)).toEqual({ total: 2, reported: 1, percent: 50 });
  });
  it("tanpa gerai aktif tidak mengklaim kepatuhan 100%", () => {
    expect(reportingProgress({ ...summary, activeUnits: 0 }).percent).toBeNull();
  });
  it("membatasi persentase dalam rentang 0 sampai 100", () => {
    expect(reportingProgress({ ...summary, activeReportedUnits: 9 }).percent).toBe(100);
  });
  it("tugas yang mendesak sekaligus terlambat tidak ditampilkan dua kali", () => {
    const task = { id: "t1", title: "Periksa gerai", priority: "mendesak", status: "belum_mulai", due_date: "2026-09-01", pic_name: "Manajer" };
    const result = managerActions({ ...summary, urgentTaskList: [task], overdueTaskList: [task] });
    expect(result.filter((item) => item.category === "tugas")).toHaveLength(1);
    expect(result[0].label).toBe("Lewat tenggat");
  });
  it("ekspor menjaga selisih negatif dan menjelaskan batas laporan", () => {
    const rows = managerSnapshotRows(summary, "Nama kustom");
    expect(rows[0]).toEqual(["Ringkasan manajer", "Nama kustom"]);
    expect(rows.find((row) => row[0] === "Selisih operasional")?.[1]).toBe(-100);
    expect(rows.at(-1)?.[1]).toContain("bukan backup lengkap");
  });
  it("PATCH anggota menolak status dan boolean arsip palsu", () => {
    const id = "550e8400-e29b-41d4-a716-446655440001";
    expect(SimpleMemberUpdateSchema.safeParse({ id, status: "admin" }).success).toBe(false);
    expect(SimpleMemberUpdateSchema.safeParse({ id, is_archived: "false" }).success).toBe(false);
    expect(SimpleMemberUpdateSchema.safeParse({ id, is_archived: false }).success).toBe(true);
    expect(SimpleMemberUpdateSchema.safeParse({ id }).success).toBe(false);
  });
  it("header IP privat palsu tidak membuka akses URL publik", () => {
    const result = verifyPrivateApiAccess(new Request("https://public.example/api/tasks", {
      headers: { host: "public.example", "x-forwarded-for": "127.0.0.1", "x-real-ip": "192.168.1.1" },
    }));
    expect(result.allowed).toBe(false);
  });
  it("loopback IPv6 dikenali, alamat bind umum tidak dipercaya", () => {
    expect(isLoopbackHost("[::1]:3000")).toBe(true);
    expect(isLoopbackHost("0.0.0.0:3000")).toBe(false);
    expect(isLoopbackHost("localhost.attacker.test")).toBe(false);
  });
});
