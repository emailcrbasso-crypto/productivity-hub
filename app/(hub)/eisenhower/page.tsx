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
        benefit="Você para de apagar incêndio o dia todo e começa a trabalhar no que realmente faz diferença — sem deixar o importante cair no esquecimento."
        steps={[
          "Pense em uma tarefa que está na sua cabeça agora e clique em + para adicioná-la.",
          "Pergunte: ela é urgente? É importante? Coloque no quadrante que representa melhor essa combinação.",
          "Repita até esvaziar a lista. Comece sempre pelo vermelho (urgente + importante) e reserve tempo para o azul (importante, mas sem prazo imediato).",
        ]}
        examples={[
          "\"Responder cliente insatisfeito hoje\" → vermelho (urgente + importante): fazer agora.",
          "\"Aprender uma nova habilidade para crescer na carreira\" → azul (importante, sem urgência): agendar um horário fixo.",
          "\"Participar de reunião que poderia ser um e-mail\" → amarelo (urgente, mas pouco importante): delegar ou encurtar.",
          "\"Ficar checando redes sociais sem objetivo\" → cinza (nem urgente, nem importante): eliminar.",
          "\"Montar a apresentação de amanhã para o cliente\" → vermelho: parar tudo e fazer agora.",
          "\"Planejar as metas do próximo trimestre\" → azul: bloquear tempo na agenda esta semana.",
        ]}
      />
      <Board tasks={tasks} prefillTitle={prefillTitle} />
    </div>
  );
}
