import { createClient } from "@/lib/supabase/server";
import { WeeklyPlanBoard } from "@/modules/weekly-plan/WeeklyPlanBoard";
import { ModuleHeader, WeeklyPlanLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
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
      <ModuleHeader
        logo={<WeeklyPlanLogo />}
        title="Plano Semanal"
        subtitle="Defina suas metas semanais e faça uma revisão ao final. +30 XP por meta · +50 XP pela revisão."
      />
      <ToolHelp
        benefit="Você termina a semana sabendo exatamente o que conquistou e começa a próxima com direção. Nada de chegar na segunda no automático ou apagando incêndio."
        steps={[
          "Na segunda-feira (ou domingo à noite) escreva de 3 a 5 metas para a semana. Seja específico porque meta vaga não tem como ser concluída.",
          "Durante a semana conforme for avançando marque as metas como concluídas. Isso te dá clareza sobre o que ainda falta.",
          "Na sexta-feira preencha a revisão semanal. O que foi bem, o que travou e qual será o foco da próxima semana.",
        ]}
        examples={[
          "✓ Meta boa: \"Entregar a proposta do cliente X até quinta\". Específica e com prazo definido.",
          "✗ Meta ruim: \"Trabalhar mais\". Vaga demais e impossível de marcar como concluída.",
          "✓ Meta boa: \"Fazer 3 ligações de prospecção por dia\". Clara e mensurável.",
          "✓ Meta boa: \"Finalizar o fechamento contábil de outubro até sexta\". Tem entrega definida.",
          "✓ Meta boa: \"Ler 2 capítulos do livro de gestão\". Simples e verificável.",
          "Uma revisão de sexta ficaria assim: \"Consegui fechar 2 clientes. Perdi tempo com uma reunião desnecessária. Na próxima semana vou priorizar a prospecção.\"",
        ]}
      />
      <WeeklyPlanBoard
        initialGoals={goals}
        initialReview={review}
        initialWeekStart={weekStart}
      />
    </div>
  );
}
