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
        benefit="Você para de gastar energia em coisas que pouco entregam e passa a focar onde o retorno é maior — fazendo mais com menos esforço."
        steps={[
          "Liste as tarefas ou projetos que você está em dúvida por onde começar e clique em + para adicioná-los.",
          "Para cada um, pergunte: o resultado é grande? O trabalho que dá é muito? Posicione no quadrante que representa melhor essa combinação.",
          "Comece sempre pelos Ganhos Rápidos (verde, alto impacto e pouco esforço). Planeje as Grandes Apostas. Faça o Preenchimento nas brechas. Evite o que cai no vermelho.",
        ]}
        examples={[
          "\"Criar um modelo de proposta que a equipe pode reutilizar\" → ganho rápido: resultado grande, pouco trabalho.",
          "\"Lançar um novo produto do zero\" → grande aposta: resultado enorme, mas exige planejamento e fases.",
          "\"Organizar as pastas do computador\" → preenchimento: faça quando tiver 15 minutos sobrando.",
          "\"Refazer um relatório que ninguém lê\" → evitar: alto esforço, baixo resultado.",
          "\"Padronizar o processo de onboarding de clientes\" → ganho rápido: pouco tempo para criar, economiza horas todo mês.",
          "\"Fazer uma campanha de marketing completa do zero\" → grande aposta: divida em etapas menores.",
        ]}
      />
      <Board tasks={tasks} />
    </div>
  );
}
