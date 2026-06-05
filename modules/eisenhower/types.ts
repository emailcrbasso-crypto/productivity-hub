export type EisenhowerTask = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_urgent: boolean;
  is_important: boolean;
  is_completed: boolean;
  xp_awarded: boolean;
  completed_at: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Quadrant = "q1" | "q2" | "q3" | "q4";

export type QuadrantMeta = {
  id: Quadrant;
  label: string;
  short: string;
  hint: string;
  is_urgent: boolean;
  is_important: boolean;
  /** Tailwind classes for accent (border, header bg) */
  accent: {
    border: string;
    headerBg: string;
    headerText: string;
    dot: string;
  };
};

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "q1",
    label: "Fazer agora",
    short: "Urgente + Importante",
    hint: "Crises, prazos críticos",
    is_urgent: true,
    is_important: true,
    accent: {
      border: "border-red-200 dark:border-red-900",
      headerBg: "bg-red-50 dark:bg-red-950/40",
      headerText: "text-red-700 dark:text-red-300",
      dot: "bg-red-500",
    },
  },
  {
    id: "q2",
    label: "Agendar",
    short: "Importante, não urgente",
    hint: "Planejamento, projetos estratégicos",
    is_urgent: false,
    is_important: true,
    accent: {
      border: "border-amber-200 dark:border-amber-900",
      headerBg: "bg-amber-50 dark:bg-amber-950/40",
      headerText: "text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500",
    },
  },
  {
    id: "q3",
    label: "Delegar",
    short: "Urgente, não importante",
    hint: "Interrupções, reuniões evitáveis",
    is_urgent: true,
    is_important: false,
    accent: {
      border: "border-sky-200 dark:border-sky-900",
      headerBg: "bg-sky-50 dark:bg-sky-950/40",
      headerText: "text-sky-700 dark:text-sky-300",
      dot: "bg-sky-500",
    },
  },
  {
    id: "q4",
    label: "Eliminar",
    short: "Nem urgente, nem importante",
    hint: "Distrações, perda de tempo",
    is_urgent: false,
    is_important: false,
    accent: {
      border: "border-zinc-200 dark:border-zinc-800",
      headerBg: "bg-zinc-50 dark:bg-zinc-900",
      headerText: "text-zinc-700 dark:text-zinc-300",
      dot: "bg-zinc-400",
    },
  },
];

export function quadrantOf(task: Pick<EisenhowerTask, "is_urgent" | "is_important">): Quadrant {
  if (task.is_urgent && task.is_important) return "q1";
  if (!task.is_urgent && task.is_important) return "q2";
  if (task.is_urgent && !task.is_important) return "q3";
  return "q4";
}

export function metaOf(quadrant: Quadrant): QuadrantMeta {
  return QUADRANTS.find((q) => q.id === quadrant)!;
}
