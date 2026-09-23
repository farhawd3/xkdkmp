"use client";

import { UserRole } from "@/types";

export interface CurrentUserDisplay {
  name: string;
  roleLabel: string;
  role: UserRole | null;
  initials: string;
  isLoggedIn: boolean;
}

const PERSONAL_MANAGER_DISPLAY: CurrentUserDisplay = {
  name: "Abdul Halim",
  roleLabel: "Manajer Koperasi",
  role: "manajer",
  initials: "AH",
  isLoggedIn: true,
};

/**
 * Hook untuk membaca identitas manajer aplikasi pribadi (Abdul Halim).
 * Dalam model aplikasi pribadi, manajer selalu aktif secara langsung tanpa alur login.
 */
export function useCurrentUser(): CurrentUserDisplay {
  return PERSONAL_MANAGER_DISPLAY;
}
