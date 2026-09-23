"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, History, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MonitoringReportForm } from "@/components/monitoring/MonitoringReportForm";
import { MonitoringHistoryTable } from "@/components/monitoring/MonitoringHistoryTable";
import { MonitoringPeriodicSummary } from "@/components/monitoring/MonitoringPeriodicSummary";
import { MonitoringTaskModal, ExistingTask } from "@/components/monitoring/MonitoringTaskModal";
import { DailyReportRecord, UnitOption } from "@/types/models";

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<"input" | "riwayat" | "ringkasan">("input");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [reports, setReports] = useState<DailyReportRecord[]>([]);
  const [tasks, setTasks] = useState<ExistingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal "Jadikan Kendala sebagai Tugas"
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueTargetReport, setIssueTargetReport] = useState<DailyReportRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsRes, reportsRes, tasksRes] = await Promise.all([
        fetch("/api/units", { cache: "no-store" }),
        fetch("/api/monitoring/records", { cache: "no-store" }),
        fetch("/api/tasks", { cache: "no-store" }),
      ]);

      if (!unitsRes.ok) throw new Error("Gagal mengambil daftar gerai.");
      if (!reportsRes.ok) throw new Error("Riwayat rekap gagal dimuat. Angka ringkasan belum dapat ditampilkan.");
      if (!tasksRes.ok) throw new Error("Daftar tugas gagal dimuat. Pemeriksaan tugas ganda belum dapat dilakukan.");
      const unitsData = await unitsRes.json();
      setUnits(unitsData.units || []);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    try {
    const res = await fetch("/api/monitoring/records", { cache: "no-store" });
    if (!res.ok) throw new Error("Rekap sudah disimpan, tetapi daftar terbaru gagal dimuat. Coba muat ulang; jangan kirim ulang laporan.");
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports || []);
    }
    setActiveTab("riwayat");
    } catch (err) { setError(err instanceof Error ? err.message : "Daftar laporan gagal diperbarui."); }
  };

  const refreshTasks = async () => {
    try {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    if (!res.ok) throw new Error("Tugas sudah disimpan, tetapi daftar terbaru gagal dimuat. Coba muat ulang.");
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks || []);
    }
    } catch (err) { setError(err instanceof Error ? err.message : "Daftar tugas gagal diperbarui."); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenIssueTaskModal = (report: DailyReportRecord) => {
    setIssueTargetReport(report);
    setIssueModalOpen(true);
  };

  if (loading) return <LoadingState label="Memuat modul pemantauan gerai…" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header Halaman (Sembunyi saat Cetak) */}
      <div className="print:hidden">
        <PageHeader
          breadcrumbItems={[
            { label: "Operasional Gerai" },
            { label: "Pemantauan Gerai", active: true },
          ]}
          title="Pemantauan & Rekapitulasi Gerai"
          description="Catat rekap omset harian, monitor performa kas riil, dan alihkan kendala lapangan menjadi instruksi kerja terukur."
          badgeText="Operasional Manajer"
        />

        {/* Tab Switcher Tiga Pilar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 gap-2 overflow-x-auto mt-4">
          <button
            onClick={() => setActiveTab("input")}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap min-h-11 ${
              activeTab === "input"
                ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Input Rekap Harian (Manual)
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap min-h-11 ${
              activeTab === "riwayat"
                ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <History className="h-4 w-4" />
            Riwayat Rekapitulasi Gerai ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab("ringkasan")}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap min-h-11 ${
              activeTab === "ringkasan"
                ? "border-primary-container text-primary-container dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Ringkasan Berkala &amp; Format Cetak
          </button>
        </div>
      </div>

      {/* Konten Tab 1: Input Rekap Harian */}
      {activeTab === "input" && (
        <MonitoringReportForm
          units={units}
          onReportSaved={refreshReports}
        />
      )}

      {/* Konten Tab 2: Riwayat Rekapitulasi dengan Filter & Ekspor */}
      {activeTab === "riwayat" && (
        <MonitoringHistoryTable
          reports={reports}
          units={units}
          onConvertIssueToTask={handleOpenIssueTaskModal}
        />
      )}

      {/* Konten Tab 3: Ringkasan Berkala & Format Cetak */}
      {activeTab === "ringkasan" && (
        <MonitoringPeriodicSummary
          reports={reports}
          units={units}
        />
      )}

      {/* Modal Dialog Tindak Lanjut Kendala Jadi Tugas */}
      <MonitoringTaskModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        report={issueTargetReport}
        units={units}
        existingTasks={tasks}
        onTaskCreated={refreshTasks}
      />
    </div>
  );
}
