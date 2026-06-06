import { createClient } from "@/lib/supabase/server";
import { Board } from "@/modules/impact-effort/Board";
import { ModuleHeader, ImpactEffortLogo } from "@/components/module-header";
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
      <Board tasks={tasks} />
    </div>
  );
}
