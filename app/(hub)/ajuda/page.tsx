import Link from "next/link";
import {
  HelpCircle,
  Grid2x2,
  Scale,
  Timer,
  Calendar,
  CalendarDays,
  Repeat,
  Zap,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { ModuleHeader } from "@/components/module-header";

export const metadata = { title: "Como usar" };

function HelpLogo() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm ring-1 ring-black/5 dark:bg-indigo-950/40 dark:ring-white/10">
      <HelpCircle size={24} className="text-indigo-500" />
    </div>
  );
}

type Method = {
  icon: LucideIcon;
  color: string;
  name: string;
  href: string;
  what: string;
  when: string;
  how: string;
};

const METHODS: Method[] = [
  {
    icon: Grid2x2,
    color: "text-red-500",
    name: "Matriz de Eisenhower",
    href: "/eisenhower",
    what: "Separa suas tarefas em 4 quadrantes cruzando urgência e importância.",
    when: "Quando você tem muitas tarefas e não sabe por onde começar.",
    how: "Adicione tarefas em cada quadrante. Foque no que é importante (Q1 e Q2). Toque no ícone (i) de cada quadrante para ver exemplos.",
  },
  {
    icon: Scale,
    color: "text-emerald-500",
    name: "Matriz Impacto × Esforço",
    href: "/impact-effort",
    what: "Prioriza pelo retorno: quanto a tarefa entrega (impacto) versus quanto custa (esforço).",
    when: "Para decidir onde investir sua energia e ter o melhor resultado.",
    how: "Comece pelos “Ganhos rápidos” (alto impacto, baixo esforço). Planeje as “Grandes apostas” e evite o quadrante de baixo retorno.",
  },
  {
    icon: Timer,
    color: "text-amber-500",
    name: "Pomodoro",
    href: "/pomodoro",
    what: "Ciclos de foco cronometrados (ex.: 25 min) com pausas curtas entre eles.",
    when: "Quando precisa concentrar de verdade e fugir das distrações.",
    how: "Inicie o timer (opcionalmente vincule uma tarefa). Trabalhe até tocar o alarme, descanse na pausa e repita. Funciona mesmo em segundo plano.",
  },
  {
    icon: Calendar,
    color: "text-sky-500",
    name: "Time Boxing",
    href: "/timeboxing",
    what: "Reserva blocos de tempo na agenda do dia para cada atividade.",
    when: "Para planejar o dia e proteger horários contra interrupções.",
    how: "Clique em qualquer horário da linha do tempo para criar um bloco. Use o botão “Foco” para abrir o Pomodoro já no contexto daquele bloco.",
  },
  {
    icon: CalendarDays,
    color: "text-violet-500",
    name: "Plano Semanal",
    href: "/weekly-plan",
    what: "Define as metas da semana e faz uma revisão ao final dela.",
    when: "No início da semana para planejar; na sexta para revisar.",
    how: "Crie suas metas, marque as concluídas e escreva a revisão semanal (o que foi bem, o que melhorar, foco da próxima).",
  },
  {
    icon: Repeat,
    color: "text-orange-500",
    name: "Hábitos",
    href: "/habits",
    what: "Acompanha hábitos diários e mantém viva sua sequência (streak).",
    when: "Para construir consistência em coisas que você quer fazer todo dia.",
    how: "Crie um hábito, marque sempre que cumprir e veja sua sequência crescer. Não quebre a corrente!",
  },
];

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <ModuleHeader
        logo={<HelpLogo />}
        title="Como usar"
        subtitle="Um guia rápido de cada método e da gamificação do hub."
      />

      <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        O <strong className="text-zinc-900 dark:text-white">Hub CR BASSO</strong>{" "}
        reúne 6 métodos de produtividade num só lugar. Você não precisa usar
        todos — escolha os que combinam com a sua rotina. E cada ação conclui
        rende <strong className="text-indigo-600 dark:text-indigo-400">XP</strong>,
        então organizar o dia também faz você evoluir. 🚀
      </p>

      {/* Métodos */}
      <div className="space-y-4">
        {METHODS.map(({ icon: Icon, color, name, href, what, when, how }) => (
          <div
            key={href}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Icon size={18} className={color} />
                {name}
              </h3>
              <Link
                href={href}
                className="shrink-0 text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Abrir →
              </Link>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-zinc-400">O que é</dt>
                <dd className="text-zinc-600 dark:text-zinc-300">{what}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-zinc-400">Quando usar</dt>
                <dd className="text-zinc-600 dark:text-zinc-300">{when}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-zinc-400">No hub</dt>
                <dd className="text-zinc-600 dark:text-zinc-300">{how}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Gamificação */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <Trophy size={18} className="text-amber-500" />
          Como funciona a gamificação
        </h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
          <li className="flex gap-2">
            <Zap size={14} className="mt-0.5 shrink-0 text-indigo-500" />
            <span>
              <strong>XP & Níveis:</strong> cada tarefa, sessão, bloco, meta ou
              hábito concluído rende XP. Acumule para subir de nível.
            </span>
          </li>
          <li className="flex gap-2">
            <Flame size={14} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              <strong>Sequência (streak):</strong> use o hub em dias seguidos para
              manter sua sequência viva — ótimo para criar o hábito de se organizar.
            </span>
          </li>
          <li className="flex gap-2">
            <Trophy size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>Conquistas:</strong> marcos especiais que você desbloqueia ao
              longo do caminho. Veja todas no seu{" "}
              <Link href="/profile" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Perfil
              </Link>
              .
            </span>
          </li>
        </ul>
      </div>

      {/* Dúvidas */}
      <p className="text-center text-xs text-zinc-400">
        Ainda com dúvidas? Fale com a gente:{" "}
        <a href="mailto:privacidade@crbasso.com.br" className="underline">
          privacidade@crbasso.com.br
        </a>
      </p>
    </div>
  );
}
