import { createClient } from "@/lib/supabase/server";
import { WeeklyPlanBoard } from "@/modules/weekly-plan/WeeklyPlanBoard";
import { currentWeekStart } from "@/modules/weekly-plan/types";
import type { WeeklyGoal, WeeklyReview } from "@/modules/weekly-plan/types";

export const metadata = { title: "Plano Semanal" };

export default async function WeeklyPlanPage() {
  const supabase = await createClient();
  const weekStart = currentWeekStart();

  const [{ data: goalsRaw }, { data: reviewRaw }] = await Promise.all([
    supabase
      .from("weekly_goals")
      .select("*")
      .eq("week_start", weekStart)
      .order("position", { ascending: true }),
    supabase
      .from("weekly_reviews")
      .select("*")
      .eq("week_start", weekStart)
      .single(),
  ]);

  const goals = (goalsRaw ?? []) as WeeklyGoal[];
  const review = (reviewRaw ?? null) as WeeklyReview | null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Plano Semanal</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Defina suas metas semanais e faça uma revisão ao final. +30 XP por meta · +50 XP pela revisão.
        </p>
      </div>
      <WeeklyPlanBoard
        initialGoals={goals}
        initialReview={review}
        initialWeekStart={weekStart}
      />
    </div>
  );
}
