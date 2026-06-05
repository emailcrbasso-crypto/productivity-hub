import { Timer, Target, Flame } from "lucide-react";
import type { PomodoroSession } from "./types";

type Props = {
  todaySessions: PomodoroSession[];
  weekSessions: PomodoroSession[];
};

function focusMinutes(sessions: PomodoroSession[]): number {
  return Math.round(
    sessions
      .filter((s) => s.type === "focus" && s.status === "completed")
      .reduce((acc, s) => acc + (s.actual_duration_seconds ?? s.planned_duration_seconds), 0) /
      60,
  );
}

function focusCount(sessions: PomodoroSession[]): number {
  return sessions.filter((s) => s.type === "focus" && s.status === "completed").length;
}

export function PomodoroStats({ todaySessions, weekSessions }: Props) {
  const todayCount = focusCount(todaySessions);
  const todayMinutes = focusMinutes(todaySessions);
  const weekCount = focusCount(weekSessions);
  const weekMinutes = focusMinutes(weekSessions);

  const stats = [
    {
      icon: <Target size={16} className="text-indigo-500" />,
      label: "Hoje",
      value: `${todayCount} ${todayCount === 1 ? "sessão" : "sessões"}`,
      sub: `${todayMinutes} min focados`,
    },
    {
      icon: <Flame size={16} className="text-orange-500" />,
      label: "Esta semana",
      value: `${weekCount} ${weekCount === 1 ? "sessão" : "sessões"}`,
      sub: `${weekMinutes} min focados`,
    },
    {
      icon: <Timer size={16} className="text-sky-500" />,
      label: "Média diária (semana)",
      value: weekCount > 0 ? `${Math.round(weekMinutes / 7)} min` : "—",
      sub: weekCount > 0 ? `${Math.round(weekCount / 7 * 10) / 10} sessões/dia` : "Nenhuma sessão ainda",
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Estatísticas</h3>
      </div>
      <div className="grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-start gap-3 p-4">
            <div className="mt-0.5 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
