import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MonitoringTaskModal } from "@/components/monitoring/MonitoringTaskModal";
import { TaskFormModal } from "@/components/pekerjaan/TaskFormModal";
import { TaskSchema } from "@/lib/validations/simple-schemas";
import type { DailyReportRecord } from "@/types/models";

vi.mock("@/lib/OrganizationContext", () => ({ useOrganizationProfile: () => ({ profile: { manager_name: "Manajer Kustom" } }) }));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Form kendala menjadi tugas — payload nyata", () => {
  it("agenda kalender baru memakai POST tanpa ID palsu dan tanggal pilihan tetap terisi", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const saved = vi.fn();
    render(<TaskFormModal isOpen onClose={vi.fn()} task={null} defaultDueDate="2026-10-12" units={[]} onTaskSaved={saved} />);
    fireEvent.change(screen.getByLabelText(/Judul Tugas Operasional/), { target: { value: "Tinjau persiapan gerai" } });
    fireEvent.submit(screen.getByLabelText(/Judul Tugas Operasional/).closest("form")!);
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    const options = fetchMock.mock.calls[0][1];
    const payload = JSON.parse(options.body);
    expect(options.method).toBe("POST");
    expect(payload).not.toHaveProperty("id");
    expect(payload.due_date).toBe("2026-10-12");
    expect(TaskSchema.safeParse(payload).success).toBe(true);
  });
  it("mengirim status sah, mempertahankan mendesak, memakai profil kustom", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const onCreated = vi.fn();
    const report: DailyReportRecord = {
      id: "r1", unit_id: "550e8400-e29b-41d4-a716-446655440001", report_date: "2026-09-23",
      gross_revenue: "0", operational_expenses: "0", net_profit: "0", transaction_count: 0,
      cash_in_hand: "0", operational_notes: "Periksa pasokan yang terlambat", source_type: "manual", created_at: "2026-09-23",
    };
    render(<MonitoringTaskModal isOpen onClose={vi.fn()} report={report} units={[{ id: report.unit_id, name: "Gerai" }]} existingTasks={[]} onTaskCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText("Skala Prioritas"), { target: { value: "mendesak" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Penugasan" }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(TaskSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({ priority: "mendesak", status: "belum_mulai", pic_name: "Manajer Kustom" });
  });
});
