import {
  LayoutDashboard,
  Grid2x2,
  Scale,
  Timer,
  Calendar,
  CalendarDays,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/eisenhower", label: "Eisenhower", icon: Grid2x2 },
  { href: "/impact-effort", label: "Impacto × Esforço", icon: Scale },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/timeboxing", label: "Time Boxing", icon: Calendar },
  { href: "/weekly-plan", label: "Plano Semanal", icon: CalendarDays },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
];
