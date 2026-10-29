import { createClient } from "@/lib/supabase/server";
import { Board } from "@/modules/impact-effort/Board";
import { ModuleHeader, ImpactEffortLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
import type { ImpactEffortTask } from "@/modules/impact-effort/types";

export const metadata = { title: "Impacto × Esforço" };

export default async function ImpactEffortPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("impact_effort_tasks")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const tasks = (data ?? []) as ImpactEffortTask[];

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <ModuleHeader
        logo={<ImpactEffortLogo />}
        title="Matriz Impacto × Esforço"
        subtitle="Priorize pelo retorno: foque nos ganhos rápidos, planeje as grandes apostas."
      />
      <ToolHelp
        benefit="Você para de gastar energia em coisas que pouco entregam e passa a focar onde o retorno é maior. Mais resultado com menos esforço."
        steps={[
          "Liste as tarefas ou projetos que você está em dúvida sobre por onde começar e clique em + para adicioná-los.",
          "Para cada um pense se o resultado seria grande e se o trabalho que vai dar é muito. Posicione no quadrante que melhor representa essa combinação.",
          "Comece sempre pelos Ganhos Rápidos (verde). Planeje bem as Grandes Apostas antes de iniciar. Faça o Preenchimento nas brechas. Evite o que cai no vermelho.",
        ]}
        examples={[
          "\"Criar um modelo de proposta que a equipe pode reutilizar\" é um ganho rápido. Pouco tempo para criar e economiza horas de todo mundo.",
          "\"Lançar um novo produto do zero\" é uma grande aposta. O resultado é enorme mas exige planejamento e fases bem definidas.",
          "\"Organizar as pastas do computador\" é preenchimento. Faça quando tiver 15 minutos sobrando.",
          "\"Refazer um relatório que ninguém lê\" é para evitar. Alto esforço e baixo resultado.",
          "\"Padronizar o processo de onboarding de clientes\" é um ganho rápido. Pouco tempo para criar e economiza horas todo mês.",
          "\"Fazer uma campanha de marketing completa do zero\" é uma grande aposta. Divida em etapas menores antes de começar.",
        ]}
      />
      <Board tasks={tasks} />
    </div>
  );
}
