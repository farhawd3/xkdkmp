"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { APP_CONFIG, CURRENT_USER } from "@/lib/constants";

export interface OrganizationProfileData {
  id?: string;
  display_name: string;
  legal_name?: string | null;
  business_status: "persiapan" | "siap_buka" | "aktif" | "ditutup_sementara";
  manager_name: string;
  manager_title: string;
  region: string;
  full_address?: string | null;
  fiscal_year: string;
  operational_target_date?: string | null;
  phone?: string | null;
  email?: string | null;
  legal_doc_status?: string | null;
  npwp_koperasi?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  notes?: string | null;
}

const DEFAULT_PROFILE_DATA: OrganizationProfileData = {
  display_name: APP_CONFIG.name,
  legal_name: null,
  business_status: "persiapan",
  manager_name: CURRENT_USER.name,
  manager_title: "Manajer Koperasi",
  region: "Nagari Ladang Laweh, Kec. Banuhampu, Agam",
  full_address: "Simpang Tiga Ladang Laweh, Kec. Banuhampu, Kab. Agam, Sumatera Barat",
  fiscal_year: "2026/2027",
  operational_target_date: null,
  phone: null,
  email: null,
  legal_doc_status: "belum_diunggah",
  npwp_koperasi: null,
  bank_name: null,
  bank_account_number: null,
  bank_account_holder: null,
  notes: null,
};

interface OrganizationContextType {
  profile: OrganizationProfileData;
  isLoading: boolean;
  error: string | null;
  reloadProfile: () => Promise<void>;
  setProfileData: (data: OrganizationProfileData) => void;
}

const OrganizationContext = createContext<OrganizationContextType>({
  profile: DEFAULT_PROFILE_DATA,
  isLoading: false,
  error: null,
  reloadProfile: async () => {},
  setProfileData: () => {},
});

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<OrganizationProfileData>(DEFAULT_PROFILE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/organization/profile", { cache: "no-store" });
      if (!res.ok) throw new Error("Profil koperasi belum dapat dimuat. Periksa koneksi lalu coba lagi.");
      const json = await res.json();
      if (!json.profile) throw new Error("Respons profil koperasi tidak lengkap.");
      setProfileState(json.profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat profil organisasi.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadProfile();
  }, []);

  const setProfileData = (data: OrganizationProfileData) => {
    setProfileState(data);
  };

  return (
    <OrganizationContext.Provider
      value={{
        profile,
        isLoading,
        error,
        reloadProfile,
        setProfileData,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export function useOrganizationProfile() {
  return useContext(OrganizationContext);
}
