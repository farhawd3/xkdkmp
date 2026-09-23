import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole | null;
  unitId?: string | null;
}

/**
 * Mengambil data sesi pengguna aktif langsung dari server Supabase dan basis data roles.
 * TIDAK mempercayai user_metadata klien untuk penentuan hak akses.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Ambil peran aktif dan cakupan unit langsung dari basis data user_roles
  let dbRoles: { role: string; unit_id: string | null }[] = [];
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from("user_roles")
      .select("role, unit_id")
      .eq("user_id", user.id)
      .eq("is_active", true);
    if (data) dbRoles = data;
  } catch {
    const { data } = await supabase
      .from("user_roles")
      .select("role, unit_id")
      .eq("user_id", user.id)
      .eq("is_active", true);
    if (data) dbRoles = data;
  }

  const roles = (dbRoles ?? []).map((row) => row.role as UserRole);
  // Bila belum ada peran khusus, tetapkan peran default manajer atau anggota
  if (roles.length === 0) {
    roles.push("manajer");
  }
  const primaryRole = roles[0] ?? "manajer";
  const assignedUnitRow = (dbRoles ?? []).find((row) => row.unit_id);
  const unitId = assignedUnitRow?.unit_id ?? null;

  return {
    id: user.id,
    email: user.email || "",
    fullName:
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Pengguna Terdaftar",
    roles,
    primaryRole,
    unitId,
  };
}

/**
 * Guard server: Wajib login. Mengalihkan ke login jika belum terautentikasi.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Guard server: Memvalidasi apakah pengguna memiliki setidaknya satu peran yang diizinkan.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  const hasAllowedRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasAllowedRole) {
    redirect("/forbidden");
  }
  return user;
}

/**
 * Guard server: Memvalidasi cakupan unit untuk operator.
 * Mencegah operator Unit A mengakses atau memodifikasi data Unit B.
 */
export async function requireUnitScope(targetUnitId: string): Promise<AuthenticatedUser> {
  const user = await requireUser();
  // Admin dan manajer memiliki hak wewenang lintas unit (global)
  if (user.roles.includes("admin") || user.roles.includes("manajer")) {
    return user;
  }

  // Operator unit/kasir wajib ditugaskan ke unit target yang sesuai
  if (!user.unitId || user.unitId !== targetUnitId) {
    throw new Error("Akses ditolak: Anda tidak memiliki wewenang untuk unit usaha ini.");
  }

  return user;
}

export { sanitizeAuthError } from "./utils";

