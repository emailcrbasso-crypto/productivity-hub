import {
  LayoutDashboard,
  Grid2x2,
  Scale,
  Timer,
  Calendar,
  CalendarDays,
  Repeat,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Rótulo curto para a barra inferior (mobile) */
  shortLabel?: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Início", icon: LayoutDashboard },
  { href: "/eisenhower", label: "Eisenhower", icon: Grid2x2 },
  { href: "/impact-effort", label: "Impacto × Esforço", shortLabel: "Impacto", icon: Scale },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/timeboxing", label: "Time Boxing", shortLabel: "Blocos", icon: Calendar },
  { href: "/weekly-plan", label: "Plano Semanal", shortLabel: "Semana", icon: CalendarDays },
  { href: "/habits", label: "Hábitos", icon: Repeat },
  { href: "/reports", label: "Relatórios", shortLabel: "Stats", icon: BarChart3 },
];

/** Itens em destaque na barra inferior (mobile); o restante vai para "Mais". */
export const BOTTOM_NAV_PRIMARY = 4;
