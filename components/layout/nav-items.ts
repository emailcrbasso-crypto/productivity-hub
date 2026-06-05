import {
  LayoutDashboard,
  Grid2x2,
  Timer,
  Calendar,
  CalendarDays,
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
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/timeboxing", label: "Time Boxing", icon: Calendar },
  { href: "/weekly-plan", label: "Plano Semanal", icon: CalendarDays },
];
