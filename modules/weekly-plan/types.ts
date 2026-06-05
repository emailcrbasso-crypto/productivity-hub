export type GoalCategory = "trabalho" | "pessoal" | "saude" | "estudo" | "outro";

export const GOAL_CATEGORIES: Record<
  GoalCategory,
  { label: string; dot: string; badge: string }
> = {
  trabalho: {
    label: "Trabalho",
    dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  pessoal: {
    label: "Pessoal",
    dot: "bg-pink-500",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  },
  saude: {
    label: "Saúde",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  estudo: {
    label: "Estudo",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  outro: {
    label: "Outro",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

export const GOAL_CATEGORY_OPTIONS = Object.keys(GOAL_CATEGORIES) as GoalCategory[];

export type WeeklyGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory | null;
  week_start: string; // YYYY-MM-DD (Monday)
  is_completed: boolean;
  completed_at: string | null;
  xp_awarded: boolean;
  position: number;
  created_at: string;
};

export type WeeklyReview = {
  id: string;
  user_id: string;
  week_start: string;
  what_went_well: string | null;
  what_to_improve: string | null;
  next_week_focus: string | null;
  xp_awarded: boolean;
  created_at: string;
  updated_at: string;
};

/** Returns the ISO date of the Monday of the week containing `date`. */
export function getMondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function offsetWeek(mondayISO: string, weeks: number): string {
  const d = new Date(mondayISO + "T00:00:00");
  d.setDate(d.getDate() + weeks * 7);
  return toISO(d);
}

export function currentWeekStart(): string {
  return getMondayOf(new Date());
}

/** "25/11 – 01/12" */
export function weekRangeLabel(mondayISO: string): string {
  const mon = new Date(mondayISO + "T00:00:00");
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export function weekLabel(mondayISO: string): string {
  const thisWeek = currentWeekStart();
  const nextWeek = offsetWeek(thisWeek, 1);
  const lastWeek = offsetWeek(thisWeek, -1);
  if (mondayISO === thisWeek) return "Esta semana";
  if (mondayISO === nextWeek) return "Próxima semana";
  if (mondayISO === lastWeek) return "Semana passada";
  return `Semana ${weekRangeLabel(mondayISO)}`;
}

export function isFutureWeek(mondayISO: string): boolean {
  return mondayISO > currentWeekStart();
}
