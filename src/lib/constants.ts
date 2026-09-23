import { NavItem, UserProfile, UserRole } from "@/types";

export const APP_CONFIG = {
  name: "Kopdes Merah Putih — Ladang Laweh",
  shortName: "Kopdes Ladang Laweh",
  targetPeriod: "Awal 2027 (Tanggal Pasti: Belum Ditetapkan)",
  location: "Ladang Laweh",
  status: "Mode Persiapan",
};

export const CURRENT_USER: UserProfile = {
  id: "",
  name: "Tamu Sistem",
  email: "",
  role: "anggota",
  unitName: "Akses Belum Masuk",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator Sistem",
  manajer: "Manajer Persiapan",
  bendahara: "Bendahara Keuangan",
  pengurus: "Pengurus Koperasi",
  pengawas: "Badan Pengawas",
  operator: "Operator Unit",
  kasir: "Kasir Gerai Sembako",
  anggota: "Anggota Koperasi",
};

export const NAVIGATION_GROUPS: { groupName: string; items: NavItem[] }[] = [
  {
    groupName: "Ringkasan",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        iconName: "LayoutDashboard",
      },
      {
        title: "Kesiapan Buka",
        href: "/persiapan",
        iconName: "CheckSquare",
      },
    ],
  },
  {
    groupName: "Kelembagaan",
    items: [
      {
        title: "Data Anggota",
        href: "/anggota",
        iconName: "Users",
      },
    ],
  },
  {
    groupName: "Unit Usaha",
    items: [
      {
        title: "Unit Usaha",
        href: "/unit-usaha",
        iconName: "Store",
      },
      {
        title: "Barang & Stok",
        href: "/stok",
        iconName: "Package",
      },
      {
        title: "Mitra Pemasok",
        href: "/pemasok",
        iconName: "Truck",
      },
      {
        title: "Aset Tetap",
        href: "/aset",
        iconName: "Archive",
      },
      {
        title: "Pengadaan (PO)",
        href: "/pembelian",
        iconName: "ShoppingBag",
      },
      {
        title: "Kasir (POS)",
        href: "/penjualan",
        iconName: "CreditCard",
      },
    ],
  },
  {
    groupName: "Keuangan",
    items: [
      {
        title: "Kas & Simpanan",
        href: "/keuangan",
        iconName: "Wallet",
      },
      {
        title: "Buku Jurnal",
        href: "/keuangan/jurnal",
        iconName: "BookOpen",
      },
      {
        title: "Pusat Laporan",
        href: "/laporan",
        iconName: "BarChart3",
      },
    ],
  },
  {
    groupName: "Manajemen",
    items: [
      {
        title: "Tugas & Agenda",
        href: "/pekerjaan",
        iconName: "Calendar",
      },
      {
        title: "Tata Kelola & RAT",
        href: "/tata-kelola",
        iconName: "FileText",
      },
    ],
  },
  {
    groupName: "Sistem",
    items: [
      {
        title: "Pengaturan",
        href: "/pengaturan",
        iconName: "Settings",
      },
      {
        title: "Panduan & Bantuan",
        href: "/bantuan",
        iconName: "HelpCircle",
      },
    ],
  },
];
