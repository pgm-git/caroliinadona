import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Scale,
  FileCode,
  BarChart3,
  Settings,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "coordinator", "lawyer", "intern"],
  },
  {
    label: "Casos",
    href: "/cases",
    icon: Briefcase,
    roles: ["admin", "coordinator", "lawyer", "intern"],
  },
  {
    label: "Documentos",
    href: "/documents",
    icon: FileText,
    roles: ["admin", "coordinator", "lawyer", "intern"],
  },
  {
    label: "Fila de Entrada",
    href: "/queue",
    icon: Inbox,
    roles: ["admin", "coordinator", "lawyer", "intern"],
  },
  {
    label: "Petições",
    href: "/petitions",
    icon: Scale,
    roles: ["admin", "coordinator", "lawyer"],
  },
  {
    label: "Templates",
    href: "/templates",
    icon: FileCode,
    roles: ["admin", "coordinator"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "coordinator"],
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function getNavItemsForRole(role: Role): NavItem[] {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  cases: "Casos",
  documents: "Documentos",
  petitions: "Petições",
  templates: "Templates",
  reports: "Relatórios",
  queue: "Fila de Entrada",
  settings: "Configurações",
  team: "Equipe",
  profile: "Perfil",
  new: "Novo",
  edit: "Editar",
};
