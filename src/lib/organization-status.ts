import type { OrganizationProfileData } from "@/lib/OrganizationContext";

export const BUSINESS_STATUS_LABEL: Record<OrganizationProfileData["business_status"], string> = {
  persiapan: "Mode Persiapan",
  siap_buka: "Siap Buka Fisik",
  aktif: "Operasional Aktif",
  ditutup_sementara: "Ditutup Sementara",
};

export function businessStatusLabel(status: OrganizationProfileData["business_status"]): string {
  return BUSINESS_STATUS_LABEL[status] || "Status belum diketahui";
}
