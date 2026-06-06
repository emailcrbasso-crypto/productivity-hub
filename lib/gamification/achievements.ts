import type { SupabaseClient } from "@supabase/supabase-js";
import { localDayKey } from "@/lib/time";

type Criteria =
  | { type: "total_xp"; value: number }
  | { type: "level"; value: number }
  | { type: "streak"; value: number }
  | { type: "all_sources"; value: number }
  | { type: "habit_streak"; value: number }
  | { type: "habit_checks"; value: number }
  | { type: "habits_in_day"; value: number };

type HabitMetrics = {
  maxStreak: number;
  totalChecks: number;
  maxInDay: number;
};

const EMPTY_HABIT_METRICS: HabitMetrics = {
  maxStreak: 0,
  totalChecks: 0,
  maxInDay: 0,
};

type Achievement = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  criteria: Criteria;
};

type ProfileSnapshot = {
  total_xp: number;
  current_level: number;
  current_streak: number;
};

export type UnlockedAchievement = Pick<
  Achievement,
  "id" | "slug" | "title" | "description" | "icon" | "xp_reward"
>;

async function distinctSourcesCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("xp_events")
    .select("source")
    .eq("user_id", userId)
    .neq("source", "hub");

  if (!data) return 0;
  return new Set(data.map((r) => r.source as string)).size;
}

/** Streak (dias consecutivos até hoje) a partir de um conjunto de datas. */
function streakOf(dates: Set<string>): number {
  const key = (n: number) => localDayKey(new Date(Date.now() - n * 86_400_000));
  let start = dates.has(key(0)) ? 0 : 1;
  if (start === 1 && !dates.has(key(1))) return 0;
  let streak = 0;
  for (let i = start; ; i++) {
    if (dates.has(key(i))) streak++;
    else break;
  }
  return streak;
}

async function habitMetrics(
  supabase: SupabaseClient,
  userId: string,
): Promise<HabitMetrics> {
  const { data } = await supabase
    .from("habit_logs")
    .select("habit_id, log_date")
    .eq("user_id", userId);

  const logs = (data ?? []) as { habit_id: string; log_date: string }[];
  if (logs.length === 0) return EMPTY_HABIT_METRICS;

  const perDay = new Map<string, Set<string>>();
  const perHabit = new Map<string, Set<string>>();
  for (const l of logs) {
    if (!perDay.has(l.log_date)) perDay.set(l.log_date, new Set());
    perDay.get(l.log_date)!.add(l.habit_id);
    if (!perHabit.has(l.habit_id)) perHabit.set(l.habit_id, new Set());
    perHabit.get(l.habit_id)!.add(l.log_date);
  }

  let maxInDay = 0;
  for (const s of perDay.values()) maxInDay = Math.max(maxInDay, s.size);
  let maxStreak = 0;
  for (const dates of perHabit.values()) maxStreak = Math.max(maxStreak, streakOf(dates));

  return { totalChecks: logs.length, maxInDay, maxStreak };
}

function matches(
  criteria: Criteria,
  profile: ProfileSnapshot,
  distinctSources: number,
  habits: HabitMetrics,
): boolean {
  switch (criteria.type) {
    case "total_xp":
      return profile.total_xp >= criteria.value;
    case "level":
      return profile.current_level >= criteria.value;
    case "streak":
      return profile.current_streak >= criteria.value;
    case "all_sources":
      return distinctSources >= criteria.value;
    case "habit_streak":
      return habits.maxStreak >= criteria.value;
    case "habit_checks":
      return habits.totalChecks >= criteria.value;
    case "habits_in_day":
      return habits.maxInDay >= criteria.value;
  }
}

/**
 * Evaluate all achievements; insert unlocks + their reward events.
 * Does NOT recursively trigger another achievement check — single pass.
 */
export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileSnapshot,
): Promise<UnlockedAchievement[]> {
  const [allRes, ownedRes] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, slug, title, description, icon, xp_reward, criteria"),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
  ]);

  const all = (allRes.data ?? []) as Achievement[];
  const ownedIds = new Set(
    (ownedRes.data ?? []).map((r) => r.achievement_id as string),
  );

  // all_sources precisa de uma query extra
  const needsSources = all.some(
    (a) => !ownedIds.has(a.id) && a.criteria.type === "all_sources",
  );
  const sources = needsSources
    ? await distinctSourcesCount(supabase, userId)
    : 0;

  // Métricas de hábitos só são computadas se houver conquista pendente que use
  const HABIT_TYPES = ["habit_streak", "habit_checks", "habits_in_day"];
  const needsHabits = all.some(
    (a) => !ownedIds.has(a.id) && HABIT_TYPES.includes(a.criteria.type),
  );
  const habits = needsHabits
    ? await habitMetrics(supabase, userId)
    : EMPTY_HABIT_METRICS;

  const unlocked = all.filter(
    (a) => !ownedIds.has(a.id) && matches(a.criteria, profile, sources, habits),
  );

  if (unlocked.length === 0) return [];

  await supabase.from("user_achievements").insert(
    unlocked.map((a) => ({
      user_id: userId,
      achievement_id: a.id,
    })),
  );

  const rewarded = unlocked.filter((a) => a.xp_reward > 0);
  if (rewarded.length > 0) {
    await supabase.from("xp_events").insert(
      rewarded.map((a) => ({
        user_id: userId,
        source: "hub",
        action: "achievement_unlocked",
        xp_amount: a.xp_reward,
        metadata: { achievement_slug: a.slug },
      })),
    );
  }

  return unlocked.map(({ id, slug, title, description, icon, xp_reward }) => ({
    id,
    slug,
    title,
    description,
    icon,
    xp_reward,
  }));
}
