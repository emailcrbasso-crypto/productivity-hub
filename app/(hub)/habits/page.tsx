import { createClient } from "@/lib/supabase/server";
import { HabitList } from "@/modules/habits/HabitList";
import { ModuleHeader, HabitsLogo } from "@/components/module-header";
import { localDayKey } from "@/lib/time";
import type { Habit } from "@/modules/habits/types";

export const metadata = { title: "Hábitos" };

export default async function HabitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Logs do último ano são suficientes para streak + visão dos 7 dias.
  const since = localDayKey(new Date(Date.now() - 365 * 86_400_000));

  const [{ data: habitsRaw }, { data: logsRaw }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("is_archived", false)
      .order("position", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("habit_id, log_date")
      .gte("log_date", since),
  ]);

  const habits = (habitsRaw ?? []) as Habit[];
  const logs = (logsRaw ?? []) as { habit_id: string; log_date: string }[];

  const datesByHabit = new Map<string, string[]>();
  for (const l of logs) {
    const arr = datesByHabit.get(l.habit_id) ?? [];
    arr.push(l.log_date);
    datesByHabit.set(l.habit_id, arr);
  }

  const initial = habits.map((habit) => ({
    habit,
    dates: datesByHabit.get(habit.id) ?? [],
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
      <ModuleHeader
        logo={<HabitsLogo />}
        title="Hábitos"
        subtitle="Construa consistência. Marque todo dia e mantenha sua sequência viva. +10 XP por check."
      />
      <HabitList initial={initial} />
    </div>
  );
}
