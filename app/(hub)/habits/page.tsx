import { createClient } from "@/lib/supabase/server";
import { HabitList } from "@/modules/habits/HabitList";
import { ModuleHeader, HabitsLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
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
      <ToolHelp
        benefit="Você transforma intenções em rotina real e vê, dia após dia, o quanto está evoluindo. A sequência crescendo é o combustível para não parar."
        steps={[
          "Clique em Novo hábito, dê um nome, escolha um ícone e uma cor que representem bem aquele comportamento.",
          "Todo dia que cumprir o hábito, clique no círculo para marcar. É simples assim.",
          "Não quebre a sequência. 7 dias seguidos já viram uma conquista no seu perfil e 30 dias é um marco que muda comportamentos de verdade.",
        ]}
        examples={[
          "\"Ler 10 páginas\" marcado todo dia antes de dormir. Em 1 mês você leu um livro inteiro.",
          "\"Beber 2 litros de água\" marcado assim que atingir a meta diária.",
          "\"Planejar o dia\" marcado toda manhã nos primeiros 10 minutos de trabalho.",
          "\"30 minutos de exercício\" marcado logo após cada treino, ainda com a roupa de academia.",
          "\"Estudar inglês\" marcado após 15 minutos de prática. Em 30 dias são 7 horas e meia de estudo sem perceber.",
          "\"Revisar as finanças\" marcado toda segunda ao abrir o dia. Em 1 mês a conta bancária começa a fazer muito mais sentido.",
        ]}
      />
      <HabitList initial={initial} />
    </div>
  );
}
