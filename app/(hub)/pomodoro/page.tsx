import { createClient } from "@/lib/supabase/server";
import { PomodoroTimer } from "@/modules/pomodoro/PomodoroTimer";
import { PomodoroStats } from "@/modules/pomodoro/PomodoroStats";
import type { PomodoroSession } from "@/modules/pomodoro/types";

export const metadata = { title: "Pomodoro" };

export default async function PomodoroPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(todayStart.getUTCDate() - 6); // last 7 days

  const [{ data: pendingTasksRaw }, { data: todaySessionsRaw }, { data: weekSessionsRaw }] =
    await Promise.all([
      supabase
        .from("eisenhower_tasks")
        .select("id, title")
        .eq("is_completed", false)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("pomodoro_sessions")
        .select("*")
        .gte("started_at", todayStart.toISOString())
        .order("started_at", { ascending: false }),
      supabase
        .from("pomodoro_sessions")
        .select("*")
        .gte("started_at", weekStart.toISOString())
        .order("started_at", { ascending: false }),
    ]);

  const pendingTasks = (pendingTasksRaw ?? []) as { id: string; title: string }[];
  const todaySessions = (todaySessionsRaw ?? []) as PomodoroSession[];
  const weekSessions = (weekSessionsRaw ?? []) as PomodoroSession[];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Pomodoro</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sessões de foco com intervalos programados. +25 XP por sessão concluída.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <PomodoroTimer pendingTasks={pendingTasks} />
      </div>

      <PomodoroStats todaySessions={todaySessions} weekSessions={weekSessions} />
    </div>
  );
}
