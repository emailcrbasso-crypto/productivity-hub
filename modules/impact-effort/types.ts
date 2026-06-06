export type ImpactEffortTask = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_high_impact: boolean;
  is_high_effort: boolean;
  is_completed: boolean;
  xp_awarded: boolean;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Quadrant = "ie1" | "ie2" | "ie3" | "ie4";

export type QuadrantMeta = {
  id: Quadrant;
  label: string;
  short: string;
  description: string;
  examples: string[];
  tip: string;
  emptyMessage: string;
  is_high_impact: boolean;
  is_high_effort: boolean;
  accent: {
    border: string;
    headerBg: string;
    headerText: string;
    dot: string;
  };
};

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "ie1",
    label: "Ganhos rápidos",
    short: "Alto impacto · baixo esforço",
    description:
      "O melhor retorno sobre o esforço. Resultados grandes com pouco trabalho — priorize estas.",
    examples: ["Automatizar um relatório manual", "Corrigir um atrito óbvio", "Responder um lead quente"],
    tip: "Faça primeiro. São as vitórias que geram momentum com o mínimo de custo.",
    emptyMessage: "Procure tarefas de alto impacto que custam pouco.",
    is_high_impact: true,
    is_high_effort: false,
    accent: {
      border: "border-emerald-200 dark:border-emerald-900",
      headerBg: "bg-emerald-50 dark:bg-emerald-950/40",
      headerText: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
  },
  {
    id: "ie2",
    label: "Grandes apostas",
    short: "Alto impacto · alto esforço",
    description:
      "Projetos transformadores que exigem investimento. Valem muito, mas precisam de planejamento.",
    examples: ["Lançar um novo produto", "Reestruturar um processo", "Migração de plataforma"],
    tip: "Planeje e quebre em etapas. Agende blocos — não tente fazer tudo de uma vez.",
    emptyMessage: "Reserve espaço para os projetos que movem o ponteiro.",
    is_high_impact: true,
    is_high_effort: true,
    accent: {
      border: "border-indigo-200 dark:border-indigo-900",
      headerBg: "bg-indigo-50 dark:bg-indigo-950/40",
      headerText: "text-indigo-700 dark:text-indigo-300",
      dot: "bg-indigo-500",
    },
  },
  {
    id: "ie3",
    label: "Preenchimento",
    short: "Baixo impacto · baixo esforço",
    description:
      "Tarefas rápidas de pouco valor. Úteis para encaixar nas brechas, mas não são prioridade.",
    examples: ["Organizar arquivos", "Pequenos ajustes", "Responder mensagens não urgentes"],
    tip: "Faça em lote, nos intervalos. Não deixe consumirem tempo nobre.",
    emptyMessage: "Nada de pequeno por aqui agora.",
    is_high_impact: false,
    is_high_effort: false,
    accent: {
      border: "border-sky-200 dark:border-sky-900",
      headerBg: "bg-sky-50 dark:bg-sky-950/40",
      headerText: "text-sky-700 dark:text-sky-300",
      dot: "bg-sky-500",
    },
  },
  {
    id: "ie4",
    label: "Evitar",
    short: "Baixo impacto · alto esforço",
    description:
      "Muito trabalho para pouco resultado. Evite, adie ou questione se precisam existir.",
    examples: ["Relatórios que ninguém lê", "Reuniões longas sem decisão", "Polimento excessivo"],
    tip: "Elimine ou simplifique. É o quadrante que mais drena energia sem retorno.",
    emptyMessage: "Ótimo — nada sugando seu esforço à toa.",
    is_high_impact: false,
    is_high_effort: true,
    accent: {
      border: "border-zinc-200 dark:border-zinc-800",
      headerBg: "bg-zinc-50 dark:bg-zinc-900",
      headerText: "text-zinc-700 dark:text-zinc-300",
      dot: "bg-zinc-400",
    },
  },
];

export function quadrantOf(
  task: Pick<ImpactEffortTask, "is_high_impact" | "is_high_effort">,
): Quadrant {
  if (task.is_high_impact && !task.is_high_effort) return "ie1";
  if (task.is_high_impact && task.is_high_effort) return "ie2";
  if (!task.is_high_impact && !task.is_high_effort) return "ie3";
  return "ie4";
}

export function metaOf(quadrant: Quadrant): QuadrantMeta {
  return QUADRANTS.find((q) => q.id === quadrant)!;
}
