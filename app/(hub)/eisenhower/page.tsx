import { createClient } from "@/lib/supabase/server";
import { Board } from "@/modules/eisenhower/Board";
import type { EisenhowerTask } from "@/modules/eisenhower/types";

export const metadata = { title: "Eisenhower" };

export default async function EisenhowerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("eisenhower_tasks")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const tasks = (data ?? []) as EisenhowerTask[];

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Matriz de Eisenhower
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Classifique suas tarefas por urgência e importância.
        </p>
      </div>
      <Board tasks={tasks} />
    </div>
  );
}
