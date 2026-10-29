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
        what="Classifica cada tarefa cruzando dois eixos — urgência e importância — gerando 4 quadrantes: Q1 Fazer agora (urgente + importante), Q2 Agendar (importante, não urgente), Q3 Delegar (urgente, não importante) e Q4 Eliminar (nem urgente, nem importante)."
        when="Quando a lista de tarefas está grande e tudo parece prioridade. A matriz força você a separar o que realmente importa do que só parece urgente."
        how="Adicione cada tarefa no quadrante certo. O segredo do método: quem vive apagando incêndio no Q1 está negligenciando o Q2 — é no Q2 (planejamento, estudo, prevenção) que mora o crescimento de longo prazo."
        example="Bug em produção afetando clientes → Q1. Estudar uma nova ferramenta da área → Q2. Reunião que poderia ser um e-mail → Q3. Rolar o feed sem objetivo → Q4."
      />
      <Board tasks={tasks} prefillTitle={prefillTitle} />
    </div>
  );
}
