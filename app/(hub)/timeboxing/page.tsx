import { createClient } from "@/lib/supabase/server";
import { Timeline } from "@/modules/timeboxing/Timeline";
import { ModuleHeader, TimeBoxingLogo } from "@/components/module-header";
import { ToolHelp } from "@/components/tool-help";
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
      <ToolHelp
        what={`Em vez de uma lista solta, cada atividade recebe um horário fixo na agenda do dia (uma "caixa de tempo"). Aproveita a Lei de Parkinson: o trabalho tende a se expandir para ocupar todo o tempo disponível — então você define o limite de antemão.`}
        when="Para planejar o dia com intenção e proteger blocos de tempo contra interrupções e reuniões aleatórias."
        how={`Clique em qualquer horário da linha do tempo para criar um bloco. Quando o bloco termina, aquela atividade acabou (ou vira um novo bloco). Use o botão "Foco" do bloco para abrir o Pomodoro já naquele contexto.`}
        example={`Em vez de "responder e-mails" na lista, reserve 09:00–09:30 para e-mails e 14:00–15:30 para trabalho focado no relatório. O dia ganha forma.`}
      />
      <Timeline initialBlocks={blocks} initialDate={today} />
    </div>
  );
}
