import Link from "next/link";
import {
  CheckCircle2,
  Timer,
  Boxes,
  Star,
  Flame,
  Zap,
  Trophy,
  ArrowRight,
  CalendarClock,
  ListTodo,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { xpForLevel } from "@/lib/gamification/xp-rules";
import { startOfLocalDayUTC, localDayKey } from "@/lib/time";
import { currentWeekStart } from "@/modules/weekly-plan/types";

export const metadata = { title: "Dashboard" };

const SOURCE_META: Record<string, { label: string; color: string }> = {
  eisenhower: { label: "Eisenhower", color: "bg-red-400" },
  pomodoro: { label: "Pomodoro", color: "bg-amber-400" },
  timeboxing: { label: "Time Boxing", color: "bg-sky-400" },
  weekly_plan: { label: "Plano Semanal", color: "bg-emerald-400" },
  hub: { label: "Hub", color: "bg-indigo-400" },
};

const BLOCK_DOT: Record<string, string> = {
  indigo: "bg-indigo-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
};

function fmtTime(t: string) {
  return t.slice(0, 5); // "HH:MM:SS" → "HH:MM"
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const todayStart = startOfLocalDayUTC();
  const todayDateISO = localDayKey();
  const weekStart = currentWeekStart();

  const [
    { data: profile },
    { data: todayTasks },
    { data: todaySessions },
    { data: todayBlocks },
    { data: weekGoals },
    { data: recentAchievements },
    { data: todayXpEvents },
    { data: upcomingBlocks },
    { data: q1Tasks },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, total_xp, current_level, current_streak, longest_streak")
      .eq("id", user.id)
      .single(),
    supabase
      .from("eisenhower_tasks")
      .select("id")
      .eq("is_completed", true)
      .gte("completed_at", todayStart.toISOString()),
    supabase
      .from("pomodoro_sessions")
      .select("actual_duration_seconds, planned_duration_seconds")
      .eq("type", "focus")
      .eq("status", "completed")
      .gte("started_at", todayStart.toISOString()),
    supabase
      .from("timeboxing_blocks")
      .select("id")
      .eq("is_completed", true)
      .gte("completed_at", todayStart.toISOString()),
    supabase
      .from("weekly_goals")
      .select("is_completed")
      .eq("week_start", weekStart),
    supabase
      .from("user_achievements")
      .select("unlocked_at, achievements(title, description, icon, xp_reward)")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false })
      .limit(4),
    supabase
      .from("xp_events")
      .select("source, xp_amount")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString()),
    // NEW: hoje's non-completed blocks ordered by start_time
    supabase
      .from("timeboxing_blocks")
      .select("id, title, start_time, end_time, color")
      .eq("date", todayDateISO)
      .eq("is_completed", false)
      .order("start_time", { ascending: true })
      .limit(5),
    // NEW: Q1 (urgent + important) pending tasks
    supabase
      .from("eisenhower_tasks")
      .select("id, title")
      .eq("is_urgent", true)
      .eq("is_important", true)
      .eq("is_completed", false)
      .order("position", { ascending: true })
      .limit(5),
  ]);

  const level = profile?.current_level ?? 1;
  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const xpInLevel = totalXp - xpForLevel(level);
  const xpRange = xpForLevel(level + 1) - xpForLevel(level);
  const progressPct = Math.min(100, Math.round((xpInLevel / xpRange) * 100));

  const tasksToday = (todayTasks ?? []).length;
  const pomodoroCount = (todaySessions ?? []).length;
  const focusMinutes = Math.round(
    (todaySessions ?? []).reduce(
      (acc, s) => acc + (s.actual_duration_seconds ?? s.planned_duration_seconds),
      0,
    ) / 60,
  );
  const blocksToday = (todayBlocks ?? []).length;
  const totalGoals = (weekGoals ?? []).length;
  const doneGoals = (weekGoals ?? []).filter((g) => g.is_completed).length;

  const xpBySource = (todayXpEvents ?? []).reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.source] = (acc[e.source] ?? 0) + (e.xp_amount ?? 0);
      return acc;
    },
    {},
  );
  const totalXpToday = Object.values(xpBySource).reduce((a, b) => a + b, 0);
  const xpEntries = Object.entries(xpBySource)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const firstName = (profile?.full_name ?? "você").split(" ")[0];
  const hasSchedule = (upcomingBlocks ?? []).length > 0;
  const hasQ1 = (q1Tasks ?? []).length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Olá, {firstName} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Aqui está um resumo do seu progresso.
        </p>
      </div>

      {/* XP + Streak */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* XP Card */}
        <div className="col-span-1 sm:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  NV {level}
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {totalXp.toLocaleString("pt-BR")} XP total
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {xpInLevel} / {xpRange} XP para o nível {level + 1}
              </p>
            </div>
            {totalXpToday > 0 && (
              <div className="text-right">
                <p className="text-[11px] text-zinc-400">Hoje</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  +{totalXpToday} XP
                </p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-zinc-400">
              <span>NV {level}</span>
              <span>{progressPct}%</span>
              <span>NV {level + 1}</span>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Sequência
            </span>
          </div>
          <p className="mt-3 text-4xl font-bold text-zinc-900 dark:text-white">
            {streak}
            <span className="ml-1 text-base font-normal text-zinc-400">dias</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">Recorde: {longestStreak} dias</p>
        </div>
      </div>

      {/* ── NOVO: Seu dia ── */}
      {(hasSchedule || hasQ1) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Próximos blocos */}
          {hasSchedule && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <CalendarClock size={14} className="text-sky-500" />
                  Blocos de hoje
                </h3>
                <Link
                  href="/timeboxing"
                  className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Ver todos →
                </Link>
              </div>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(upcomingBlocks ?? []).map((block) => (
                  <li key={block.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${BLOCK_DOT[block.color] ?? "bg-zinc-400"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-900 dark:text-white">
                        {block.title}
                      </p>
                      <p className="text-[11px] tabular-nums text-zinc-400">
                        {fmtTime(block.start_time)} – {fmtTime(block.end_time)}
                      </p>
                    </div>
                    <Link
                      href={`/pomodoro?block=${encodeURIComponent(block.title)}`}
                      className="flex shrink-0 items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:hover:bg-sky-950/50"
                    >
                      <Timer size={10} /> Foco
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Q1 — Urgente + Importante */}
          {hasQ1 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <ListTodo size={14} className="text-red-500" />
                  Urgente &amp; importante
                </h3>
                <Link
                  href="/eisenhower"
                  className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Ver todas →
                </Link>
              </div>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(q1Tasks ?? []).map((task) => (
                  <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-900 dark:text-white">
                      {task.title}
                    </p>
                    <Link
                      href="/eisenhower"
                      className="shrink-0 text-zinc-300 transition-colors hover:text-zinc-500 dark:text-zinc-700"
                    >
                      <ArrowRight size={13} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Today stats */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Hoje
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              {
                icon: CheckCircle2,
                color: "text-red-500",
                label: "Tarefas",
                value: tasksToday,
                sub: "concluídas hoje",
                href: "/eisenhower",
              },
              {
                icon: Timer,
                color: "text-amber-500",
                label: "Pomodoros",
                value: pomodoroCount,
                sub: `${focusMinutes} min focados`,
                href: "/pomodoro",
              },
              {
                icon: Boxes,
                color: "text-sky-500",
                label: "Blocos",
                value: blocksToday,
                sub: "concluídos hoje",
                href: "/timeboxing",
              },
              {
                icon: Star,
                color: "text-emerald-500",
                label: "Metas",
                value: `${doneGoals}/${totalGoals}`,
                sub: "esta semana",
                href: "/weekly-plan",
              },
            ] as const
          ).map(({ icon: Icon, color, label, value, sub, href }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <Icon size={15} className={color} />
                <ArrowRight
                  size={12}
                  className="text-zinc-200 transition-colors group-hover:text-zinc-400 dark:text-zinc-700"
                />
              </div>
              <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
              <p className="text-[11px] text-zinc-400">{sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* XP breakdown + Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* XP breakdown */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
            <Zap size={14} className="text-indigo-500" />
            XP ganhos hoje
          </h3>
          {xpEntries.length === 0 ? (
            <p className="mt-4 text-xs italic text-zinc-400">
              Nenhuma atividade registrada hoje ainda.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {xpEntries.map(([source, amount]) => {
                const meta = SOURCE_META[source] ?? { label: source, color: "bg-zinc-400" };
                const pct = Math.round((amount / totalXpToday) * 100);
                return (
                  <div key={source}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{meta.label}</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        +{amount} XP
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${meta.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="pt-1 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Total: +{totalXpToday} XP
              </p>
            </div>
          )}
        </div>

        {/* Quick access */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
            Acesso rápido
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  label: "Eisenhower",
                  href: "/eisenhower",
                  icon: CheckCircle2,
                  bg: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
                  desc: "Organizar tarefas",
                },
                {
                  label: "Pomodoro",
                  href: "/pomodoro",
                  icon: Timer,
                  bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
                  desc: "Sessão de foco",
                },
                {
                  label: "Time Boxing",
                  href: "/timeboxing",
                  icon: Boxes,
                  bg: "bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400",
                  desc: "Alocar blocos",
                },
                {
                  label: "Plano Semanal",
                  href: "/weekly-plan",
                  icon: Star,
                  bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
                  desc: "Ver metas",
                },
              ] as const
            ).map(({ label, href, icon: Icon, bg, desc }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className={`shrink-0 rounded-lg p-2 ${bg}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-900 dark:text-white">
                    {label}
                  </p>
                  <p className="truncate text-[10px] text-zinc-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent achievements */}
      {(recentAchievements ?? []).length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            <Trophy size={12} /> Conquistas recentes
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(recentAchievements ?? []).map((ua, i) => {
              const ach = ua.achievements as unknown as {
                title: string;
                description: string;
                icon: string;
                xp_reward: number;
              } | null;
              if (!ach) return null;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-900/30 dark:bg-amber-950/20"
                >
                  <span className="text-2xl leading-none">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                      {ach.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {ach.description}
                    </p>
                    {ach.xp_reward > 0 && (
                      <p className="mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        +{ach.xp_reward} XP
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
