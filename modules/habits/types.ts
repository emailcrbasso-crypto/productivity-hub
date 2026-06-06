import { localDayKey } from "@/lib/time";

export type HabitColor =
  | "indigo"
  | "red"
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "pink"
  | "orange";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  color: HabitColor;
  icon: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  created_at: string;
};

/** Hábito + dados derivados para a UI. */
export type HabitWithStats = Habit & {
  doneToday: boolean;
  streak: number;
  last7: boolean[]; // 7 dias, do mais antigo (6 dias atrás) ao hoje
};

export const HABIT_COLORS: Record<HabitColor, { dot: string; bg: string; ring: string }> = {
  indigo: { dot: "bg-indigo-500", bg: "bg-indigo-500", ring: "ring-indigo-500" },
  red: { dot: "bg-red-500", bg: "bg-red-500", ring: "ring-red-500" },
  amber: { dot: "bg-amber-500", bg: "bg-amber-500", ring: "ring-amber-500" },
  emerald: { dot: "bg-emerald-500", bg: "bg-emerald-500", ring: "ring-emerald-500" },
  sky: { dot: "bg-sky-500", bg: "bg-sky-500", ring: "ring-sky-500" },
  violet: { dot: "bg-violet-500", bg: "bg-violet-500", ring: "ring-violet-500" },
  pink: { dot: "bg-pink-500", bg: "bg-pink-500", ring: "ring-pink-500" },
  orange: { dot: "bg-orange-500", bg: "bg-orange-500", ring: "ring-orange-500" },
};

export const COLOR_OPTIONS = Object.keys(HABIT_COLORS) as HabitColor[];

export const ICON_OPTIONS = [
  "✅", "💪", "📚", "🏃", "🧘", "💧", "🥗", "😴",
  "✍️", "🎯", "🧠", "☀️", "🚭", "💰", "🎸", "🙏",
];

const DAY_MS = 86_400_000;

/** Chave de dia local de N dias atrás (0 = hoje). */
export function dayKeyAgo(n: number): string {
  return localDayKey(new Date(Date.now() - n * DAY_MS));
}

/**
 * Calcula o streak (dias consecutivos até hoje) a partir de um conjunto de
 * datas concluídas. Permite que "ontem" seja o último dia (streak ainda vivo
 * mesmo que hoje não tenha sido marcado).
 */
export function computeStreak(doneDates: Set<string>): number {
  let streak = 0;
  // Se hoje não foi feito, o streak parte de ontem (não quebra durante o dia).
  let start = doneDates.has(dayKeyAgo(0)) ? 0 : 1;
  // Se nem hoje nem ontem, streak = 0.
  if (start === 1 && !doneDates.has(dayKeyAgo(1))) return 0;
  for (let i = start; ; i++) {
    if (doneDates.has(dayKeyAgo(i))) streak++;
    else break;
  }
  return streak;
}

export function buildHabitStats(habit: Habit, logDates: Set<string>): HabitWithStats {
  const last7: boolean[] = [];
  for (let i = 6; i >= 0; i--) last7.push(logDates.has(dayKeyAgo(i)));
  return {
    ...habit,
    doneToday: logDates.has(dayKeyAgo(0)),
    streak: computeStreak(logDates),
    last7,
  };
}
