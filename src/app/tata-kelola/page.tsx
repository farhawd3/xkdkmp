"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileText,
  ShieldAlert,
  Users,
  Plus,
  FileCheck,
  AlertTriangle,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMetric,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { PageHeader } from "@/components/layout";
import { useToast } from "@/components/ui/Toast";
import { preparationRepository } from "@/lib/repository";
import { GovernanceDocument, RiskItem, RiskCategory } from "@/types";

// Schema Tambah Dokumen
const docSchema = z.object({
  title: z.string().min(5, "Nama dokumen minimal 5 karakter"),
  docType: z.enum(["ad_art", "legalitas", "sop", "notulen", "keputusan"]),
  version: z.string().min(1, "Versi dokumen wajib diisi"),
  ownerName: z.string().min(3, "Nama PIC / Penanggung jawab minimal 3 karakter"),
  date: z.string().min(1, "Tanggal dokumen wajib diisi"),
  notes: z.string().optional(),
});

type DocFormData = z.infer<typeof docSchema>;

// Schema Tambah Risiko
const riskSchema = z.object({
  title: z.string().min(5, "Deskripsi risiko minimal 5 karakter"),
  category: z.enum(["kepatuhan", "manajemen", "bisnis", "operasional", "tata_kelola"]),
  impact: z.enum(["tinggi", "sedang", "rendah"]),
  likelihood: z.enum(["tinggi", "sedang", "rendah"]),
  mitigationPlan: z.string().min(10, "Rencana mitigasi minimal 10 karakter"),
  ownerName: z.string().min(3, "Nama pemilik risiko minimal 3 karakter"),
});

type RiskFormData = z.infer<typeof riskSchema>;

export default function TataKelolaPage() {
  const [activeTab, setActiveTab] = useState<"dokumen" | "notula" | "risiko">("dokumen");
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>("all");

  // State Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [selectedDocDetail, setSelectedDocDetail] = useState<GovernanceDocument | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState<string>("");
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const {
    register: registerDoc,
    handleSubmit: handleSubmitDoc,
    reset: resetDoc,
    formState: { errors: errorsDoc },
  } = useForm<DocFormData>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      docType: "ad_art",
      version: "v1.0 (Draf)",
      ownerName: "Abdul Halim",
      date: "2026-09-22",
    },
  });

  const {
    register: registerRisk,
    handleSubmit: handleSubmitRisk,
    reset: resetRisk,
    formState: { errors: errorsRisk },
  } = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      category: "kepatuhan",
      impact: "tinggi",
      likelihood: "sedang",
      ownerName: "Abdul Halim",
      mitigationPlan: "Koordinasi berkala dengan Wali Nagari dan Notaris Koperasi",
    },
  });

  const loadData = async () => {
    const [docs, r] = await Promise.all([
      preparationRepository.getGovernanceDocuments(),
      preparationRepository.getRisks(),
    ]);
    setDocuments(docs);
    setRisks(r);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Simulasi Upload Berkas dengan Validasi Format File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Tolak file biner yang berpotensi berbahaya (.exe, .bat, .sh, dll.)
    const dangerousExtensions = [".exe", ".bat", ".sh", ".cmd", ".vbs", ".msi", ".dll"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (dangerousExtensions.includes(fileExt)) {
      setFileUploadError(`Ekstensi file ${fileExt} dilarang karena alasan keamanan sistem.`);
      setSimulatedFileName("");
      return;
    }

    // Hanya menerima berkas dokumen yang sah
    const validExtensions = [".pdf", ".docx", ".doc", ".xlsx", ".odt", ".jpg", ".png"];
    if (!validExtensions.includes(fileExt)) {
      setFileUploadError("Format file tidak didukung. Harap unggah berkas PDF atau dokumen resmi.");
      setSimulatedFileName("");
      return;
    }

    setSimulatedFileName(file.name);
  };

  // Submit Tambah Dokumen
  const onSubmitDoc = async (data: DocFormData) => {
    setIsSubmitting(true);
    try {
      await preparationRepository.addGovernanceDocument({
        title: data.title,
        docType: data.docType,
        version: data.version,
        ownerName: data.ownerName,
        date: data.date,
        status: "peninjauan",
        attachmentFileName: simulatedFileName || "Draf-Dokumen-Persiapan.pdf",
        notes: data.notes || "Dokumen peninjauan persiapan legalitas koperasi.",
      });

      showToast(
        "success",
        "Dokumen Terdaftar",
        `Dokumen "${data.title}" berhasil diarsipkan dalam status peninjauan.`
      );
      setIsDocModalOpen(false);
      resetDoc();
      setSimulatedFileName("");
      setFileUploadError(null);
      await loadData();
    } catch {
      showToast("error", "Gagal", "Terjadi kesalahan saat menyimpan dokumen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Tambah Risiko
  const onSubmitRisk = async (data: RiskFormData) => {
    setIsSubmitting(true);
    try {
      await preparationRepository.addRisk({
        title: data.title,
        category: data.category,
        impact: data.impact,
        likelihood: data.likelihood,
        mitigationPlan: data.mitigationPlan,
        ownerName: data.ownerName,
        followUpStatus: "dalam_mitigasi",
        proofNotes: "Identifikasi berkala persiapan awal.",
      });

      showToast("success", "Risiko Dicatat", `Item risiko baru berhasil ditambahkan ke matriks.`);
      setIsRiskModalOpen(false);
      resetRisk();
      await loadData();
    } catch {
      showToast("error", "Gagal", "Gagal menyimpan item risiko.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Risks
  const filteredRisks = risks.filter((r) => {
    if (selectedRiskCategory === "all") return true;
    return r.category === selectedRiskCategory;
  });

  const validDocsCount = documents.filter((d) => d.status === "disahkan").length;
  const highImpactRiskCount = risks.filter(
    (r) => r.impact === "tinggi" || r.likelihood === "tinggi"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Terstandarisasi */}
      <PageHeader
        breadcrumbItems={[
          { label: "Manajemen" },
          { label: "Tata Kelola, Dokumen & Risiko", active: true },
        ]}
        title="Tata Kelola, Dokumen & Matriks Risiko"
        badgeText="Mode Persiapan"
        badgeVariant="crimson"
        description="Arsip legalitas AD/ART, risalah rapat persiapan, dan peta mitigasi kepatuhan operasional."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === "dokumen" && (
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsDocModalOpen(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Unggah / Daftarkan Dokumen
              </Button>
            )}
            {activeTab === "risiko" && (
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsRiskModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Identifikasi Risiko Baru
              </Button>
            )}
          </div>
        }
      />

      {/* 3 Kartu Metrik Ringkasan Tata Kelola (Gaya /persiapan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardMetric
          title="Dokumen Kelembagaan"
          value={documents.length.toString()}
          subtitle={`${validDocsCount} instrumen berstatus berlaku`}
          icon={<FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          trend={{ label: "Arsip Hukum", positive: true }}
          accentColor="sky"
         action={{ label: "Buka dokumen", onClick: () => { setActiveTab("dokumen"); } }}/>
        <CardMetric
          title="Peta Risiko Organisasi"
          value={risks.length.toString()}
          subtitle={`${highImpactRiskCount} risiko berdampak signifikan`}
          icon={<ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          trend={{
            label: highImpactRiskCount > 0 ? "Perlu Mitigasi" : "Risiko Terkendali",
            positive: highImpactRiskCount === 0,
          }}
          accentColor="amber"
         action={{ label: "Tinjau risiko", onClick: () => { setActiveTab("risiko"); } }}/>
        <CardMetric
          title="Kepatuhan Regulasi"
          value="Perlu peninjauan"
          subtitle="AD/ART & musyawarah desa"
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          trend={{ label: "Regulasi Kemenkop", positive: true }}
          accentColor="emerald"
         action={{ label: "Periksa checklist wajib", href: "/persiapan" }}/>
      </div>

      {/* Navigasi Sub-Tab */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("dokumen")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "dokumen"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          Dokumen Legal & AD/ART
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {documents.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("notula")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "notula"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Notula Rapat & Risalah
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {documents.filter((d) => d.docType === "notulen").length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("risiko")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "risiko"
              ? "border-primary-container text-primary-container dark:text-rose-400 dark:border-rose-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Matriks Risiko & Kepatuhan
          <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
            {risks.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DOKUMEN LEGAL & AD/ART                                             */}
      {/* ========================================================================= */}
      {activeTab === "dokumen" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 p-4 text-xs text-sky-900 dark:text-sky-300 flex items-start gap-3 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-900 dark:text-sky-200 mb-1">Integritas Dokumen Otentik</p>
              <p className="leading-relaxed text-sky-800 dark:text-sky-300/90">
                Teks hukum dan keabsahan legalitas wajib bersumber dari dokumen fisik yang sah
                (akta notaris, SK Kemenkumham, atau berita acara musyawarah nagari). Sistem{" "}
                <strong>tidak membuat klaim kepatuhan hukum otomatis</strong> tanpa pembuktian berkas fisik.
              </p>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Dokumen</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Versi</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4">Tanggal Arsip</th>
                    <th className="py-3 px-4">Status Pengesahan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {doc.docType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{doc.version}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{doc.ownerName}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{doc.date}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            doc.status === "disahkan"
                              ? "success"
                              : doc.status === "peninjauan"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDocDetail(doc)}
                            className="h-8 px-2 text-slate-700 dark:text-slate-300"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Lihat
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NOTULA & RISALAH RAPAT                                             */}
      {/* ========================================================================= */}
      {activeTab === "notula" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Batas Keabsahan RAT Persiapan</p>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300/90">
                Notula dan risalah di bawah ini mencatat musyawarah persiapan pengurus.{" "}
                <strong>Dilarang membuat keputusan RAT definitif atau penetapan SHU</strong> sebelum badan
                hukum resmi disahkan dan tahun buku operasional berjalan penuh.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {documents
              .filter((d) => d.docType === "notulen")
              .map((notul) => (
                <Card key={notul.id}>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Badge variant="info" size="sm">
                          Risalah Rapat
                        </Badge>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {notul.title}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Tanggal: <strong className="text-slate-700 dark:text-slate-200">{notul.date}</strong> | Notulis: <strong className="text-slate-700 dark:text-slate-200">{notul.ownerName}</strong>
                      </span>
                    </div>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {notul.notes}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-3 text-xs md:text-sm">
                    {/* Daftar Peserta */}
                    {notul.meetingAttendees && notul.meetingAttendees.length > 0 && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-2">
                          Daftar Hadir Musyawarah:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {notul.meetingAttendees.map((att, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs shadow-sm"
                            >
                              {att}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Butir Keputusan */}
                    {notul.meetingDecisions && notul.meetingDecisions.length > 0 && (
                      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-300 block mb-2">
                          Poin Kesepakatan & Keputusan:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                          {notul.meetingDecisions.map((dec, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {dec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATRIKS RISIKO & KEPATUHAN                                         */}
      {/* ========================================================================= */}
      {activeTab === "risiko" && (
        <div className="space-y-6">
          {/* Bar Filter Kategori Risiko */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
                Kategori Risiko:
              </span>
              {[
                { id: "all", label: "Semua" },
                { id: "kepatuhan", label: "Kepatuhan" },
                { id: "manajemen", label: "Manajemen" },
                { id: "bisnis", label: "Bisnis" },
                { id: "operasional", label: "Operasional" },
                { id: "tata_kelola", label: "Tata Kelola" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRiskCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRiskCategory === cat.id
                      ? "bg-slate-900 dark:bg-rose-700 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: <strong className="text-slate-800 dark:text-slate-200">{filteredRisks.length}</strong> Item Teridentifikasi
            </span>
          </div>

          {/* Tabel Matriks Risiko */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Deskripsi Risiko</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Dampak</th>
                    <th className="py-3 px-4">Kemungkinan</th>
                    <th className="py-3 px-4">Rencana Mitigasi</th>
                    <th className="py-3 px-4">Pemilik (PIC)</th>
                    <th className="py-3 px-4">Status Mitigasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRisks.map((rsk) => (
                    <tr key={rsk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-[220px]">
                        {rsk.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {rsk.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            rsk.impact === "tinggi"
                              ? "danger"
                              : rsk.impact === "sedang"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {rsk.impact}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            rsk.likelihood === "tinggi"
                              ? "danger"
                              : rsk.likelihood === "sedang"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {rsk.likelihood}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[260px] text-xs leading-relaxed">
                        {rsk.mitigationPlan}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{rsk.ownerName}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            rsk.followUpStatus === "terkendali"
                              ? "success"
                              : rsk.followUpStatus === "dalam_mitigasi"
                              ? "info"
                              : "danger"
                          }
                          size="sm"
                        >
                          {rsk.followUpStatus.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAFTARKAN DOKUMEN BARU (DENGAN VALIDASI FORMAT)                    */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false);
          setFileUploadError(null);
        }}
        title="Daftarkan Dokumen Legalitas / AD-ART"
        description="Pencatatan berkas hukum dan regulasi internal persiapan koperasi."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitDoc(onSubmitDoc)} className="space-y-4">
          <Input
            label="Nama / Judul Dokumen"
            placeholder="Contoh: Draf Anggaran Dasar & Rumah Tangga (AD/ART)"
            {...registerDoc("title")}
            error={errorsDoc.title?.message}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Jenis Dokumen"
              {...registerDoc("docType")}
              options={[
                { value: "ad_art", label: "Anggaran Dasar / ART" },
                { value: "legalitas", label: "SK & Legalitas Notaris" },
                { value: "sop", label: "Standar Operasional (SOP)" },
                { value: "notulen", label: "Notulen Rapat" },
                { value: "keputusan", label: "Surat Keputusan (SK)" },
              ]}
              error={errorsDoc.docType?.message}
            />

            <Input
              label="Nomor / Versi Berkas"
              placeholder="Contoh: v1.0 atau 001/SK-KOP/IX/2026"
              {...registerDoc("version")}
              error={errorsDoc.version?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Penanggung Jawab (PIC)"
              {...registerDoc("ownerName")}
              error={errorsDoc.ownerName?.message}
              required
            />
            <DateInput
              label="Tanggal Dokumen"
              {...registerDoc("date")}
              error={errorsDoc.date?.message}
              required
            />
          </div>

          {/* Area Simulasi Upload File dengan Validasi Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lampirkan Berkas Bukti (Simulasi Upload Demo)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
              <input
                type="file"
                id="docFileInput"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.xlsx,.jpg,.png"
              />
              <label
                htmlFor="docFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-medium text-rose-700 dark:text-rose-400 hover:underline">
                  {simulatedFileName ? (
                    <strong className="text-slate-900 dark:text-slate-100">{simulatedFileName}</strong>
                  ) : (
                    "Pilih berkas dari komputer (PDF, DOCX, JPG)"
                  )}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Label Demo: Berkas tersimpan di penyimpanan mock sesi.
                </span>
              </label>
            </div>
            {fileUploadError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{fileUploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Ringkasan Dokumen
            </label>
            <textarea
              {...registerDoc("notes")}
              rows={2}
              placeholder="Keterangan pasal penting atau kesepakatan pengurus..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDocModalOpen(false);
                setFileUploadError(null);
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Dokumen
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: IDENTIFIKASI RISIKO BARU                                           */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        title="Identifikasi Risiko & Rencana Mitigasi"
        description="Analisis kemungkinan hambatan kepatuhan hukum dan operasional."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitRisk(onSubmitRisk)} className="space-y-4">
          <Input
            label="Deskripsi Risiko"
            placeholder="Contoh: Keterlambatan penerbitan izin operasional ritel nagari"
            {...registerRisk("title")}
            error={errorsRisk.title?.message}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Kategori"
              {...registerRisk("category")}
              options={[
                { value: "kepatuhan", label: "Kepatuhan" },
                { value: "manajemen", label: "Manajemen" },
                { value: "bisnis", label: "Bisnis" },
                { value: "operasional", label: "Operasional" },
                { value: "tata_kelola", label: "Tata Kelola" },
              ]}
              error={errorsRisk.category?.message}
            />

            <Select
              label="Tingkat Dampak"
              {...registerRisk("impact")}
              options={[
                { value: "tinggi", label: "Tinggi" },
                { value: "sedang", label: "Sedang" },
                { value: "rendah", label: "Rendah" },
              ]}
              error={errorsRisk.impact?.message}
            />

            <Select
              label="Kemungkinan Terjadi"
              {...registerRisk("likelihood")}
              options={[
                { value: "tinggi", label: "Tinggi" },
                { value: "sedang", label: "Sedang" },
                { value: "rendah", label: "Rendah" },
              ]}
              error={errorsRisk.likelihood?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rencana Tindakan Mitigasi Konkret
            </label>
            <textarea
              {...registerRisk("mitigationPlan")}
              rows={3}
              placeholder="Jelaskan langkah nyata untuk mencegah atau mengurangi dampak risiko..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
            {errorsRisk.mitigationPlan && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errorsRisk.mitigationPlan.message}</p>
            )}
          </div>

          <Input
            label="Pemilik Risiko (PIC Penanggung Jawab)"
            placeholder="Contoh: Abdul Halim"
            {...registerRisk("ownerName")}
            error={errorsRisk.ownerName?.message}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRiskModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan Item Risiko
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL DOKUMEN                                                     */}
      {/* ========================================================================= */}
      {selectedDocDetail && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedDocDetail(null)}
          title="Detail Dokumen Tata Kelola"
          description="Informasi arsip dan pengesahan dokumen."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs md:text-sm">
            <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="info">{selectedDocDetail.docType.replace("_", " ")}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                {selectedDocDetail.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">{selectedDocDetail.notes || "Tidak ada catatan."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Versi / Nomor:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">{selectedDocDetail.version}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Tanggal Arsip:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedDocDetail.date}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Penanggung Jawab:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedDocDetail.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Status:</span>
                <Badge variant={selectedDocDetail.status === "disahkan" ? "success" : "warning"}>
                  {selectedDocDetail.status}
                </Badge>
              </div>
            </div>

            {selectedDocDetail.attachmentFileName && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {selectedDocDetail.attachmentFileName}
                  </span>
                </div>
                <Badge variant="neutral" size="sm">
                  Simulasi Demo
                </Badge>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedDocDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
