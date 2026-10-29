import { createClient } from "@/lib/supabase/server";
import { Board } from "@/modules/eisenhower/Board";
import { ModuleHeader, EisenhowerLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
import type { EisenhowerTask } from "@/modules/eisenhower/types";

export const metadata = { title: "Eisenhower" };

type Props = {
  searchParams: Promise<{ goal?: string }>;
};

export default async function EisenhowerPage({ searchParams }: Props) {
  const params = await searchParams;
  const prefillTitle = params.goal ? decodeURIComponent(params.goal) : undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("eisenhower_tasks")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const tasks = (data ?? []) as EisenhowerTask[];

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <ModuleHeader
        logo={<EisenhowerLogo />}
        title="Matriz de Eisenhower"
        subtitle="Classifique suas tarefas por urgência e importância."
      />
      <ToolHelp
        benefit="Você para de apagar incêndio o dia todo e começa a trabalhar no que realmente faz diferença. O importante para de cair no esquecimento."
        steps={[
          "Pense em uma tarefa que está na sua cabeça agora e clique em + para adicioná-la.",
          "Ela é urgente? É importante? Coloque no quadrante que melhor representa essa combinação.",
          "Repita até esvaziar a lista. Comece sempre pelo vermelho (urgente e importante) e reserve tempo para o azul (importante, mas sem prazo imediato).",
        ]}
        examples={[
          "\"Responder cliente insatisfeito hoje\" vai para o vermelho. É urgente e importante, então é para fazer agora.",
          "\"Aprender uma nova habilidade para crescer na carreira\" vai para o azul. É importante mas não é para hoje, então agenda um horário fixo.",
          "\"Participar de reunião que poderia ser um e-mail\" vai para o amarelo. É urgente mas não é importante, então delega ou encurta.",
          "\"Ficar checando redes sociais sem objetivo\" vai para o cinza. Não é urgente nem importante, então elimina.",
          "\"Montar a apresentação de amanhã para o cliente\" é vermelho. Para tudo e faz agora.",
          "\"Planejar as metas do próximo trimestre\" é azul. Bloqueia um tempo na agenda esta semana.",
        ]}
      />
      <Board tasks={tasks} prefillTitle={prefillTitle} />
    </div>
  );
}
