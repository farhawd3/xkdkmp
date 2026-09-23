import { UserRole } from "@/types";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole | null;
  unitId?: string | null;
}

/**
 * Profil manajer aplikasi pribadi — Abdul Halim.
 */
export const PERSONAL_MANAGER_USER: AuthenticatedUser = {
  id: "manager-abdul-halim",
  email: "manajer@kopdes-ladanglaweh.id",
  fullName: "Abdul Halim",
  roles: ["admin", "manajer"],
  primaryRole: "manajer",
  unitId: null,
};

/**
 * Mengembalikan profil manajer aktif untuk penggunaan aplikasi pribadi.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  return { ...PERSONAL_MANAGER_USER, roles: [...PERSONAL_MANAGER_USER.roles] };
}

/**
 * Guard server warisan: dalam aplikasi pribadi, selalu mengembalikan manajer aktif.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  return { ...PERSONAL_MANAGER_USER, roles: [...PERSONAL_MANAGER_USER.roles] };
}

/**
 * Guard peran warisan: manajer pribadi memiliki akses penuh ke seluruh modul.
 */
export async function requireRole(_allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  return { ...PERSONAL_MANAGER_USER, roles: [...PERSONAL_MANAGER_USER.roles] };
}

/**
 * Guard cakupan unit warisan: manajer pribadi memiliki hak wewenang lintas gerai.
 */
export async function requireUnitScope(_targetUnitId: string): Promise<AuthenticatedUser> {
  return { ...PERSONAL_MANAGER_USER, roles: [...PERSONAL_MANAGER_USER.roles] };
}

export { sanitizeAuthError } from "./utils";
