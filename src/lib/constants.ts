import { NavItem, UserProfile, UserRole } from "@/types";

export const APP_CONFIG = {
  name: "Kopdes Merah Putih — Ladang Laweh",
  shortName: "Kopdes Ladang Laweh",
  targetPeriod: "Awal 2027 (Tanggal Pasti: Belum Ditetapkan)",
  location: "Ladang Laweh",
  status: "Mode Persiapan",
};

export const CURRENT_USER: UserProfile = {
  id: "manager-abdul-halim",
  name: "Abdul Halim",
  email: "manajer@kopdes-ladanglaweh.id",
  role: "manajer",
  unitName: "Manajemen Koperasi",
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
    groupName: "Menu Utama",
    items: [
      {
        title: "Dashboard Manajer",
        href: "/dashboard",
        iconName: "LayoutDashboard",
      },
      {
        title: "Meja Kerja",
        href: "/meja-kerja",
        iconName: "Inbox",
      },
      {
        title: "Tugas & Agenda",
        href: "/pekerjaan",
        iconName: "ClipboardList",
      },
    ],
  },
  {
    groupName: "Operasional Gerai",
    items: [
      {
        title: "Pemantauan Gerai",
        href: "/monitoring",
        iconName: "Activity",
      },
      {
        title: "Kinerja Gerai",
        href: "/kinerja-gerai",
        iconName: "BarChart3",
      },
      {
        title: "Daftar & Edit Gerai",
        href: "/unit-usaha",
        iconName: "Store",
      },
      {
        title: "Barang & Stok",
        href: "/stok",
        iconName: "Package",
      },
    ],
  },
  {
    groupName: "Keuangan & Laporan",
    items: [
      {
        title: "Kas & Buku Besar",
        href: "/keuangan",
        iconName: "Wallet",
      },
      {
        title: "Neraca & SHU",
        href: "/laporan",
        iconName: "Scale",
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
      {
        title: "Kesiapan Buka",
        href: "/persiapan",
        iconName: "CheckSquare",
      },
      {
        title: "Tata Kelola & RAT",
        href: "/tata-kelola",
        iconName: "FileText",
      },
    ],
  },
  {
    groupName: "Sistem & Bantuan",
    items: [
      {
        title: "Pengaturan",
        href: "/pengaturan",
        iconName: "Settings",
      },
      {
        title: "Panduan Sistem",
        href: "/bantuan",
        iconName: "HelpCircle",
      },
    ],
  },

];
