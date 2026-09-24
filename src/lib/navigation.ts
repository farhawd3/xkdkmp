import { NAVIGATION_GROUPS } from "./constants";

/** Rute produksi yang aktif dan terintegrasi dengan validasi otorisasi server Supabase. */
export const PRODUCTION_READY_ROUTES = new Set([
  "/dashboard",
  "/meja-kerja",
  "/pekerjaan",
  "/monitoring",
  "/kinerja-gerai",
  "/unit-usaha",
  "/stok",
  "/keuangan",
  "/laporan",
  "/anggota",
  "/persiapan",
  "/tata-kelola",
  "/pengaturan",
  "/bantuan",
]);

/** Satu sumber untuk sidebar dan pencarian, termasuk modul baru. */
export const SEARCH_MODULES = NAVIGATION_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, desc: group.groupName }))
);

export function getActiveNavigationHref(pathname: string): string | undefined {
  return SEARCH_MODULES.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
