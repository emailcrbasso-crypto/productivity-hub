import { createClient } from "@/lib/supabase/server";
import { PomodoroTimer } from "@/modules/pomodoro/PomodoroTimer";
import { PomodoroStats } from "@/modules/pomodoro/PomodoroStats";
import { ModuleHeader, PomodoroLogo } from "@/components/module-header";
import { startOfLocalDayUTC, startOfLocalDayDaysAgoUTC } from "@/lib/time";
import type { PomodoroSession } from "@/modules/pomodoro/types";

export const metadata = { title: "Pomodoro" };

type Props = {
  searchParams: Promise<{ block?: string }>;
};

export default async function PomodoroPage({ searchParams }: Props) {
  const params = await searchParams;
  const blockContext = params.block ? decodeURIComponent(params.block) : null;

  const supabase = await createClient();

  const todayStart = startOfLocalDayUTC();
  const weekStart = startOfLocalDayDaysAgoUTC(6);

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
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <ModuleHeader
        logo={<PomodoroLogo />}
        title="Pomodoro"
        subtitle="Sessões de foco com intervalos programados. +25 XP por sessão concluída."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Timer — takes 3 columns */}
        <div className="lg:col-span-3">
          <PomodoroTimer pendingTasks={pendingTasks} blockContext={blockContext} />
        </div>

        {/* Task list panel — takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Tarefas pendentes
              </h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                Vincule uma tarefa do Eisenhower ao iniciar o foco.
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs italic text-zinc-400">
                  Nenhuma tarefa pendente no Eisenhower.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {pendingTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      <span className="truncate">{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <PomodoroStats todaySessions={todaySessions} weekSessions={weekSessions} />
    </div>
  );
}
