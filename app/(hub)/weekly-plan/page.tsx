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
        what="Une dois rituais: a definição de metas no começo da semana e uma revisão (retrospectiva) no fim. Sobe um nível acima do dia a dia — é a camada tática que dá direção para os outros métodos."
        when="No início da semana para planejar; na sexta (ou domingo) para revisar e aprender com o que passou."
        how="Defina de 3 a 5 metas claras para a semana. Marque as concluídas conforme avança. No fim, preencha a revisão: o que foi bem, o que melhorar e o foco da próxima semana."
        example={`Metas da semana: "finalizar proposta do cliente X", "publicar 2 artigos", "fechar o fechamento contábil". Na sexta: revisar o que avançou e o que travou.`}
      />
      <WeeklyPlanBoard
        initialGoals={goals}
        initialReview={review}
        initialWeekStart={weekStart}
      />
    </div>
  );
}
