"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/constants";

export interface CurrentUserDisplay {
  name: string;
  roleLabel: string;
  role: UserRole | null;
  initials: string;
  isLoggedIn: boolean;
}

/**
 * Hook untuk membaca identitas pengguna aktif secara aman.
 * Menghindari pemalsuan nama 'Abdul Halim' saat belum terautentikasi resmi.
 */
export function useCurrentUser(): CurrentUserDisplay {
  const [userDisplay, setUserDisplay] = useState<CurrentUserDisplay>({
    name: "Tamu Sistem",
    roleLabel: "Belum Masuk",
    role: null,
    initials: "?",
    isLoggedIn: false,
  });

  useEffect(() => {
    // Cek apakah ada sesi login resmi dari Supabase Auth.
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        
        const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fullName =
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Staf Terverifikasi";
            const initials = fullName
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "ST";

            const { data: roles, error: rolesError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("is_active", true);

            const primaryRole = !rolesError && roles?.length ? roles[0].role as UserRole : null;
            setUserDisplay({
              name: fullName,
              roleLabel: primaryRole ? ROLE_LABELS[primaryRole] : "Peran belum diverifikasi",
              role: primaryRole,
              initials,
              isLoggedIn: true,
            });
          } else {
            setUserDisplay({
              name: "Tamu Sistem",
              roleLabel: "Belum Masuk",
              role: null,
              initials: "?",
              isLoggedIn: false,
            });
          }
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
          fetchUser();
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        // Fallback aman jika gagal koneksi
      }
    }
  }, []);

  return userDisplay;
}
