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
  Lightbulb,
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
  example: string;
  /** Link para o artigo completo no blog (preencher quando publicado) */
  article?: string;
};

const METHODS: Method[] = [
  {
    icon: Grid2x2,
    color: "text-red-500",
    name: "Matriz de Eisenhower",
    href: "/eisenhower",
    what:
      "Classifica cada tarefa cruzando dois eixos — urgência e importância — gerando 4 quadrantes: Q1 Fazer agora (urgente + importante), Q2 Agendar (importante, não urgente), Q3 Delegar (urgente, não importante) e Q4 Eliminar (nem urgente, nem importante).",
    when:
      "Quando a lista de tarefas está grande e tudo parece prioridade. A matriz força você a separar o que realmente importa do que só parece urgente.",
    how:
      "Adicione cada tarefa no quadrante certo. O segredo do método: quem vive apagando incêndio no Q1 está negligenciando o Q2 — é no Q2 (planejamento, estudo, prevenção) que mora o crescimento de longo prazo.",
    example:
      "Bug em produção afetando clientes → Q1. Estudar uma nova ferramenta da área → Q2. Reunião que poderia ser um e-mail → Q3. Rolar o feed sem objetivo → Q4.",
  },
  {
    icon: Scale,
    color: "text-emerald-500",
    name: "Matriz Impacto × Esforço",
    href: "/impact-effort",
    what:
      "Prioriza pelo retorno sobre o investimento. Cruza o impacto (quanto a tarefa entrega) com o esforço (quanto custa), formando 4 zonas: Ganhos rápidos (alto impacto / baixo esforço), Grandes apostas (alto / alto), Preenchimento (baixo / baixo) e Evitar (baixo impacto / alto esforço).",
    when:
      "Quando você tem várias opções e energia limitada — e precisa escolher onde investir para gerar o maior resultado possível.",
    how:
      "Ataque primeiro os Ganhos rápidos (vitórias baratas que geram momentum). Planeje e fatie as Grandes apostas em etapas. Faça o Preenchimento nas brechas e questione tudo que cair em Evitar.",
    example:
      "Automatizar um relatório manual de 1h/semana → ganho rápido. Reestruturar todo o processo de vendas → grande aposta. Organizar a pasta de arquivos → preenchimento. Polir um slide que quase ninguém vê → evitar.",
  },
  {
    icon: Timer,
    color: "text-amber-500",
    name: "Pomodoro",
    href: "/pomodoro",
    what:
      "Divide o trabalho em ciclos de foco cronometrados. O padrão clássico: 25 minutos de foco total + 5 de pausa curta; a cada 4 ciclos, uma pausa longa (15–30 min). A ideia é que o cérebro rende mais em sprints curtos do que em maratonas.",
    when:
      "Para tarefas que exigem concentração e onde a distração é a inimiga (escrever, estudar, programar, analisar).",
    how:
      "Inicie o timer (você pode vincular uma tarefa do Eisenhower, Impacto×Esforço ou Time Boxing). Trabalhe sem interrupções até o alarme, descanse na pausa e repita. O timer é preciso mesmo com a aba em segundo plano e toca um som ao terminar.",
    example:
      "Escrever uma proposta: 25 min sem checar celular/e-mail → pausa de 5 → repita. Em ~4 pomodoros (2h) você entrega com a mente ainda fresca.",
  },
  {
    icon: Calendar,
    color: "text-sky-500",
    name: "Time Boxing",
    href: "/timeboxing",
    what:
      "Em vez de uma lista solta, cada atividade recebe um horário fixo na agenda do dia (uma “caixa de tempo”). Aproveita a Lei de Parkinson: o trabalho tende a se expandir para ocupar todo o tempo disponível — então você define o limite de antemão.",
    when:
      "Para planejar o dia com intenção e proteger blocos de tempo contra interrupções e reuniões aleatórias.",
    how:
      "Clique em qualquer horário da linha do tempo para criar um bloco. Quando o bloco termina, aquela atividade acabou (ou vira um novo bloco). Use o botão “Foco” do bloco para abrir o Pomodoro já naquele contexto.",
    example:
      "Em vez de “responder e-mails” na lista, reserve 09:00–09:30 para e-mails e 14:00–15:30 para trabalho focado no relatório. O dia ganha forma.",
  },
  {
    icon: CalendarDays,
    color: "text-violet-500",
    name: "Plano Semanal",
    href: "/weekly-plan",
    what:
      "Une dois rituais: a definição de metas no começo da semana e uma revisão (retrospectiva) no fim. Sobe um nível acima do dia a dia — é a camada tática que dá direção para os outros métodos.",
    when:
      "No início da semana para planejar; na sexta (ou domingo) para revisar e aprender com o que passou.",
    how:
      "Defina de 3 a 5 metas claras para a semana. Marque as concluídas conforme avança. No fim, preencha a revisão: o que foi bem, o que melhorar e o foco da próxima semana.",
    example:
      "Metas da semana: “finalizar proposta do cliente X”, “publicar 2 artigos”, “fechar o fechamento contábil”. Na sexta: revisar o que avançou e o que travou.",
  },
  {
    icon: Repeat,
    color: "text-orange-500",
    name: "Hábitos",
    href: "/habits",
    what:
      "Acompanha hábitos diários e mantém viva a sua sequência (streak). Baseia-se no princípio “não quebre a corrente”: o que importa é a consistência (todo dia), não a intensidade.",
    when:
      "Para construir comportamentos recorrentes — ler, se exercitar, beber água, estudar, planejar o dia.",
    how:
      "Crie um hábito (com ícone e cor), marque sempre que cumprir e veja a sequência crescer. Cada hábito tem seu próprio streak, e marcos como 7 ou 30 dias viram conquistas.",
    example:
      "Hábito “ler 10 páginas”. Marque todos os dias. Ver a sequência chegar a 7, depois 30 dias cria o impulso de não interromper a corrente.",
  },
];

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <ModuleHeader
        logo={<HelpLogo />}
        title="Como usar"
        subtitle="Guia técnico de cada método, com exemplos práticos."
      />

      <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        O <strong className="text-zinc-900 dark:text-white">Hub CR BASSO</strong>{" "}
        reúne 6 métodos consagrados de produtividade num só lugar. Você não
        precisa usar todos — comece pelos que combinam com a sua rotina. E cada
        conclusão rende{" "}
        <strong className="text-indigo-600 dark:text-indigo-400">XP</strong>, então
        se organizar também faz você evoluir. 🚀
      </p>

      {/* Métodos */}
      <div className="space-y-4">
        {METHODS.map(
          ({ icon: Icon, color, name, href, what, when, how, example, article }) => (
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
                  <dt className="w-24 shrink-0 font-semibold text-zinc-400">O que é</dt>
                  <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{what}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-zinc-400">Quando usar</dt>
                  <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{when}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-semibold text-zinc-400">No hub</dt>
                  <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{how}</dd>
                </div>
              </dl>

              {/* Exemplo */}
              <div className="mt-3 flex gap-2 rounded-lg bg-amber-50/70 p-3 dark:bg-amber-950/20">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    Exemplo:{" "}
                  </span>
                  {example}
                </p>
              </div>

              {article && (
                <a
                  href={article}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Ler o artigo completo no blog →
                </a>
              )}
            </div>
          ),
        )}
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
              hábito concluído rende XP. O nível sobe conforme o XP acumulado
              (cada nível exige um pouco mais que o anterior).
            </span>
          </li>
          <li className="flex gap-2">
            <Flame size={14} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              <strong>Sequência (streak):</strong> usar o hub em dias seguidos
              mantém sua sequência viva — o melhor combustível para criar o hábito
              de se organizar.
            </span>
          </li>
          <li className="flex gap-2">
            <Trophy size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>Conquistas:</strong> marcos que você desbloqueia ao longo do
              caminho (XP, níveis, sequências e hábitos). Veja todas no seu{" "}
              <Link
                href="/profile"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
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
        <a href="mailto:crbasso@crbasso.com.br" className="underline">
          crbasso@crbasso.com.br
        </a>
      </p>
    </div>
  );
}
