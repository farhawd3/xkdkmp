"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { parseCsv } from "@/lib/csv";
import { CheckCircle2, AlertCircle, Upload } from "lucide-react";

export interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const MemberImportModal: React.FC<MemberImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [importText, setImportText] = useState("");
  const [previewRows, setPreviewRows] = useState<{
    valid: { fullName: string; phone: string; domicile?: string; nik?: string }[];
    errors: { row: number; error: string }[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number } | null>(null);

  const { showToast } = useToast();

  const handlePreviewCsv = () => {
    if (!importText.trim()) {
      showToast("error", "Data Kosong", "Masukkan teks baris CSV untuk memeriksa data.");
      return;
    }
    setImportSummary(null);
    try {
      const parsed = parseCsv(importText);
      const valid: { fullName: string; phone: string; domicile?: string; nik?: string }[] = [];
      const errors: { row: number; error: string }[] = [];

      parsed.forEach((parts, idx) => {
        const rowNumber = idx + 1;
        // Deteksi baris header
        if (
          idx === 0 &&
          (parts[0]?.toLowerCase().includes("nama") ||
            parts[1]?.toLowerCase().includes("telepon") ||
            parts[1]?.toLowerCase().includes("hp"))
        ) {
          return;
        }

        if (parts.length < 2) {
          errors.push({
            row: rowNumber,
            error: "Format kolom minimal: Nama, Telepon.",
          });
          return;
        }

        const personName = parts[0]?.trim() || "";
        const personPhone = parts[1]?.trim() || "";
        const personDomicile = parts[2]?.trim() || "";
        const personNik = parts[3]?.trim() || undefined;

        if (!personName || personName.length < 2) {
          errors.push({ row: rowNumber, error: "Nama lengkap minimal 2 karakter." });
          return;
        }

        if (personNik && !/^\d{16}$/.test(personNik)) {
          errors.push({ row: rowNumber, error: "NIK harus 16 digit angka jika diisi." });
          return;
        }

        valid.push({
          fullName: personName,
          phone: personPhone,
          domicile: personDomicile,
          nik: personNik,
        });
      });

      if (valid.length === 0 && errors.length === 0) {
        showToast("info", "Data Kosong", "Tidak ada baris data yang ditemukan.");
        return;
      }

      setPreviewRows({ valid, errors });
    } catch (err) {
      showToast(
        "error",
        "Format CSV Belum Valid",
        err instanceof Error ? err.message : "Periksa tanda kutip dan koma pada teks."
      );
    }
  };

  const handleExecuteImport = async () => {
    if (!previewRows || previewRows.valid.length === 0 || isImporting) return;
    setIsImporting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const item of previewRows.valid) {
        const memberNumber = `KOP-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
        const notes = item.domicile ? `Domisili: ${item.domicile}` : null;

        const payload = {
          member_number: memberNumber,
          full_name: item.fullName,
          phone: item.phone || null,
          status: "calon",
          join_date: new Date().toISOString().split("T")[0],
          notes,
        };

        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      setImportSummary({ success: successCount, failed: failedCount });
      setPreviewRows(null);
      setImportText("");

      if (successCount > 0) {
        showToast(
          "success",
          "Impor Berhasil",
          `${successCount} anggota berhasil dicatat ke Supabase.`
        );
        onImportSuccess();
      } else {
        showToast("error", "Impor Gagal", "Tidak ada baris anggota yang berhasil disimpan.");
      }
    } catch (err) {
      showToast(
        "error",
        "Kendala Impor",
        err instanceof Error ? err.message : "Terjadi kendala saat menyimpan data."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Anggota dari CSV"
      description="Tempel data baris CSV untuk menambahkan banyak warga sekaligus ke database koperasi."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Format Kolom CSV:
          </label>
          <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
            Nama Lengkap, Nomor Telepon/WA, Domisili Jorong, NIK (opsional)
          </p>
        </div>

        <Textarea
          label="Teks Baris CSV"
          rows={5}
          placeholder={"Contoh:\nBudi Santoso, 081234567890, Jorong Barat\nSiti Aminah, 081398765432, Jorong Pincuran"}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreviewCsv}
            className="min-h-11 font-semibold"
          >
            Periksa Data CSV
          </Button>

          {previewRows && previewRows.valid.length > 0 && (
            <Button
              type="button"
              variant="primary"
              disabled={isImporting}
              onClick={handleExecuteImport}
              className="min-h-11 px-5 font-bold gap-1.5"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Mengimpor..." : `Impor ${previewRows.valid.length} Anggota`}
            </Button>
          )}
        </div>

        {/* Pratinjau Hasil Pemeriksaan */}
        {previewRows && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" /> {previewRows.valid.length} baris valid
              </span>
              {previewRows.errors.length > 0 && (
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <AlertCircle className="h-4 w-4" /> {previewRows.errors.length} baris galat
                </span>
              )}
            </div>

            {previewRows.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-1">
                {previewRows.errors.slice(0, 5).map((e, idx) => (
                  <p key={idx}>Baris {e.row}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ringkasan Akhir Impor */}
        {importSummary && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200">
            ✓ Berhasil mengimpor {importSummary.success} anggota ke Supabase.
            {importSummary.failed > 0 && ` (${importSummary.failed} gagal)`}
          </div>
        )}

        <div className="pt-3 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="min-h-11">
            Tutup
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
