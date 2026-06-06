import { createClient } from "@/lib/supabase/server";
import { Timeline } from "@/modules/timeboxing/Timeline";
import { ModuleHeader, TimeBoxingLogo } from "@/components/module-header";
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
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <ModuleHeader
        logo={<TimeBoxingLogo />}
        title="Time Boxing"
        subtitle="Planeje seu dia alocando blocos de tempo para cada atividade. +15 XP por bloco concluído."
      />
      <Timeline initialBlocks={blocks} initialDate={today} />
    </div>
  );
}
