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
        benefit="Seu dia para de ser uma lista interminável sem fim e vira uma agenda real — você sabe exatamente o que faz em cada hora e sai do trabalho sem aquela sensação de que não fez nada."
        steps={[
          "Clique em qualquer horário da linha do tempo para criar um bloco de tempo para uma atividade.",
          "Dê um nome para o bloco, escolha uma cor e defina o horário de início e fim.",
          "Quando chegar a hora, foque só naquele bloco. Ao terminar, marque como concluído — ou clique em Foco para abrir o Pomodoro direto naquela tarefa.",
        ]}
        examples={[
          "08:00–09:00 → e-mails e mensagens do dia (só nesse horário, não o dia todo).",
          "09:00–11:00 → trabalho focado no projeto principal, sem atender ligações.",
          "11:00–11:30 → revisão de pendências e alinhamentos rápidos.",
          "14:00–15:30 → reuniões e ligações concentradas num único bloco.",
          "15:30–16:00 → planejamento do dia seguinte para sair do trabalho sem devendo nada.",
          "Quinta à tarde → bloco semanal de aprendizado ou desenvolvimento pessoal.",
        ]}
      />
      <Timeline initialBlocks={blocks} initialDate={today} />
    </div>
  );
}
