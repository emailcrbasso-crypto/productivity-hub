import Link from "next/link";
import { BarChart3, Zap, Timer, CheckCircle2, Boxes, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleHeader } from "@/components/module-header";
import { localDayKey } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata = { title: "Relatórios" };

function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

const SOURCE_META: Record<string, { label: string; bar: string }> = {
  eisenhower: { label: "Eisenhower", bar: "bg-red-400" },
  pomodoro: { label: "Pomodoro", bar: "bg-amber-400" },
  timeboxing: { label: "Time Boxing", bar: "bg-sky-400" },
  weekly_plan: { label: "Plano Semanal", bar: "bg-emerald-400" },
  impact_effort: { label: "Impacto × Esforço", bar: "bg-teal-400" },
  habits: { label: "Hábitos", bar: "bg-orange-400" },
  hub: { label: "Conquistas", bar: "bg-indigo-400" },
};

function ReportsLogo() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 shadow-sm ring-1 ring-black/5 dark:bg-violet-950/40 dark:ring-white/10">
      <BarChart3 size={24} className="text-violet-500" />
    </div>
  );
}

type Props = { searchParams: Promise<{ days?: string }> };

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const days = params.days === "30" ? 30 : 7;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [
    { data: xpEvents },
    { data: focusSessions },
    { data: tasks },
    { data: blocks },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from("xp_events")
      .select("source, xp_amount, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since),
    supabase
      .from("pomodoro_sessions")
      .select("actual_duration_seconds, planned_duration_seconds, started_at")
      .eq("type", "focus")
      .eq("status", "completed")
      .gte("started_at", since),
    supabase
      .from("eisenhower_tasks")
      .select("id")
      .eq("is_completed", true)
      .gte("completed_at", since),
    supabase
      .from("timeboxing_blocks")
      .select("id")
      .eq("is_completed", true)
      .gte("completed_at", since),
    supabase
      .from("weekly_goals")
      .select("id")
      .eq("is_completed", true)
      .gte("completed_at", since),
  ]);

  // Buckets de dias (do mais antigo ao mais recente)
  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dayKeys.push(localDayKey(new Date(Date.now() - i * 86_400_000)));
  }

  // XP por dia + por fonte
  const xpByDay = new Map<string, number>(dayKeys.map((k) => [k, 0]));
  const xpBySource = new Map<string, number>();
  for (const e of xpEvents ?? []) {
    const key = localDayKey(new Date(e.created_at));
    if (xpByDay.has(key)) xpByDay.set(key, (xpByDay.get(key) ?? 0) + (e.xp_amount ?? 0));
    xpBySource.set(e.source, (xpBySource.get(e.source) ?? 0) + (e.xp_amount ?? 0));
  }

  // Foco (min) por dia
  const focusByDay = new Map<string, number>(dayKeys.map((k) => [k, 0]));
  let totalFocusSec = 0;
  for (const s of focusSessions ?? []) {
    const secs = s.actual_duration_seconds ?? s.planned_duration_seconds ?? 0;
    totalFocusSec += secs;
    const key = localDayKey(new Date(s.started_at));
    if (focusByDay.has(key)) focusByDay.set(key, (focusByDay.get(key) ?? 0) + secs);
  }

  const totalXp = [...xpBySource.values()].reduce((a, b) => a + b, 0);
  const totalFocusMin = Math.round(totalFocusSec / 60);
  const pomodoroCount = (focusSessions ?? []).length;
  const tasksCount = (tasks ?? []).length;
  const blocksCount = (blocks ?? []).length;
  const goalsCount = (goals ?? []).length;
  const activeDays = dayKeys.filter((k) => (xpByDay.get(k) ?? 0) > 0).length;

  const xpDayMax = Math.max(1, ...dayKeys.map((k) => xpByDay.get(k) ?? 0));
  const focusDayMax = Math.max(1, ...dayKeys.map((k) => focusByDay.get(k) ?? 0));

  const sourceEntries = [...xpBySource.entries()]
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  // Mostra rótulo do eixo X com espaçamento maior no período de 30 dias
  const labelEvery = days <= 7 ? 1 : 5;

  const summary = [
    { icon: Zap, color: "text-indigo-500", label: "XP no período", value: totalXp.toLocaleString("pt-BR") },
    { icon: Timer, color: "text-amber-500", label: "Tempo focado", value: totalFocusMin >= 60 ? `${Math.floor(totalFocusMin / 60)}h ${totalFocusMin % 60}m` : `${totalFocusMin}m` },
    { icon: CheckCircle2, color: "text-red-500", label: "Pomodoros", value: pomodoroCount },
    { icon: Star, color: "text-emerald-500", label: "Dias ativos", value: `${activeDays}/${days}` },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <ModuleHeader
        logo={<ReportsLogo />}
        title="Relatórios"
        subtitle="Acompanhe sua produtividade ao longo do tempo."
      />

      {/* Period toggle */}
      <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
        {[
          { d: 7, label: "7 dias" },
          { d: 30, label: "30 dias" },
        ].map(({ d, label }) => (
          <Link
            key={d}
            href={`/reports?days=${d}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              days === d
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map(({ icon: Icon, color, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Icon size={15} className={color} />
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      {/* XP por dia */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Zap size={14} className="text-indigo-500" /> XP por dia
        </h3>
        {totalXp === 0 ? (
          <p className="py-8 text-center text-xs italic text-zinc-400">
            Sem atividade no período.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {dayKeys.map((k, i) => {
              const v = xpByDay.get(k) ?? 0;
              const h = Math.round((v / xpDayMax) * 100);
              return (
                <div key={k} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t bg-indigo-500 transition-all dark:bg-indigo-400"
                      style={{ height: `${Math.max(v > 0 ? 4 : 0, h)}%` }}
                      title={`${dayLabel(k)}: ${v} XP`}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400">
                    {i % labelEvery === 0 ? dayLabel(k) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Foco por dia */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Timer size={14} className="text-amber-500" /> Minutos de foco por dia
        </h3>
        {totalFocusMin === 0 ? (
          <p className="py-8 text-center text-xs italic text-zinc-400">
            Nenhuma sessão de foco concluída no período.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {dayKeys.map((k, i) => {
              const mins = Math.round((focusByDay.get(k) ?? 0) / 60);
              const h = Math.round(((focusByDay.get(k) ?? 0) / focusDayMax) * 100);
              return (
                <div key={k} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t bg-amber-500 transition-all dark:bg-amber-400"
                      style={{ height: `${Math.max(mins > 0 ? 4 : 0, h)}%` }}
                      title={`${dayLabel(k)}: ${mins} min`}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400">
                    {i % labelEvery === 0 ? dayLabel(k) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* XP por módulo + Conclusões */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
            XP por módulo
          </h3>
          {sourceEntries.length === 0 ? (
            <p className="text-xs italic text-zinc-400">Sem dados.</p>
          ) : (
            <div className="space-y-3">
              {sourceEntries.map(([source, amount]) => {
                const meta = SOURCE_META[source] ?? { label: source, bar: "bg-zinc-400" };
                const pct = Math.round((amount / totalXp) * 100);
                return (
                  <div key={source}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{meta.label}</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {amount} XP
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
            Conclusões no período
          </h3>
          <ul className="space-y-3">
            {[
              { icon: CheckCircle2, color: "text-red-500", label: "Tarefas (Eisenhower)", value: tasksCount },
              { icon: Timer, color: "text-amber-500", label: "Pomodoros de foco", value: pomodoroCount },
              { icon: Boxes, color: "text-sky-500", label: "Blocos (Time Boxing)", value: blocksCount },
              { icon: Star, color: "text-emerald-500", label: "Metas semanais", value: goalsCount },
            ].map(({ icon: Icon, color, label, value }) => (
              <li key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Icon size={14} className={color} /> {label}
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
