import { createClient } from "@/lib/supabase/server";
import { Board } from "@/modules/eisenhower/Board";
import { ModuleHeader, EisenhowerLogo } from "@/components/module-header";
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
      <Board tasks={tasks} prefillTitle={prefillTitle} />
    </div>
  );
}
