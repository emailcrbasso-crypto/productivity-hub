import { createClient } from "@/lib/supabase/server";
import { Timeline } from "@/modules/timeboxing/Timeline";
import { todayISO } from "@/modules/timeboxing/types";
import type { TimeboxBlock } from "@/modules/timeboxing/types";

export const metadata = { title: "Time Boxing" };

export default async function TimeBoxingPage() {
  const supabase = await createClient();
  const today = todayISO();

  const { data } = await supabase
    .from("timeboxing_blocks")
    .select("*")
    .eq("date", today)
    .order("start_time", { ascending: true });

  const blocks = (data ?? []) as TimeboxBlock[];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Time Boxing</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Planeje seu dia alocando blocos de tempo para cada atividade. +15 XP por bloco concluído.
        </p>
      </div>
      <Timeline initialBlocks={blocks} initialDate={today} />
    </div>
  );
}
