export type FiveW2HPlan = {
  id: string;
  user_id: string;
  title: string;
  what: string;
  why: string;
  where_field: string;
  when_field: string;
  who: string;
  how: string;
  how_much: string | null;
  is_completed: boolean;
  xp_awarded: boolean;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type PlanField = {
  key: keyof Pick<FiveW2HPlan, "what" | "why" | "where_field" | "when_field" | "who" | "how" | "how_much">;
  label: string;
  question: string;
  placeholder: string;
  required: boolean;
};

export const PLAN_FIELDS: PlanField[] = [
  { key: "what", label: "O quê?", question: "O que será feito?", placeholder: "Descreva a ação ou projeto", required: true },
  { key: "why", label: "Por quê?", question: "Por que isso será feito?", placeholder: "Qual o objetivo ou justificativa", required: true },
  { key: "where_field", label: "Onde?", question: "Onde será feito?", placeholder: "Local ou contexto", required: true },
  { key: "when_field", label: "Quando?", question: "Quando será feito?", placeholder: "Prazo ou data", required: true },
  { key: "who", label: "Quem?", question: "Quem será responsável?", placeholder: "Pessoa ou equipe responsável", required: true },
  { key: "how", label: "Como?", question: "Como será feito?", placeholder: "Método, etapas ou ferramentas", required: true },
  { key: "how_much", label: "Quanto custa?", question: "Quanto vai custar?", placeholder: "Orçamento, horas ou recursos (opcional)", required: false },
];
