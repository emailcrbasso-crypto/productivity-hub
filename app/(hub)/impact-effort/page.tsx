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
        what="Prioriza pelo retorno sobre o investimento. Cruza o impacto (quanto a tarefa entrega) com o esforço (quanto custa), formando 4 zonas: Ganhos rápidos (alto impacto / baixo esforço), Grandes apostas (alto / alto), Preenchimento (baixo / baixo) e Evitar (baixo impacto / alto esforço)."
        when="Quando você tem várias opções e energia limitada — e precisa escolher onde investir para gerar o maior resultado possível."
        how="Ataque primeiro os Ganhos rápidos (vitórias baratas que geram momentum). Planeje e fatie as Grandes apostas em etapas. Faça o Preenchimento nas brechas e questione tudo que cair em Evitar."
        example="Automatizar um relatório manual de 1h/semana → ganho rápido. Reestruturar todo o processo de vendas → grande aposta. Organizar a pasta de arquivos → preenchimento. Polir um slide que quase ninguém vê → evitar."
      />
      <Board tasks={tasks} />
    </div>
  );
}
