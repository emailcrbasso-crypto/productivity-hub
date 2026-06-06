"use client";

import { useState, useTransition } from "react";
import {
  Grid2x2,
  Scale,
  Timer,
  Calendar,
  CalendarDays,
  Repeat,
  Zap,
  Flame,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/app/(hub)/onboarding-actions";

type Slide = {
  emoji: string;
  title: string;
  body: string;
  content?: React.ReactNode;
};

const MODULES = [
  { icon: Grid2x2, color: "text-red-500", label: "Eisenhower", desc: "Priorize por urgência e importância" },
  { icon: Scale, color: "text-emerald-500", label: "Impacto × Esforço", desc: "Priorize pelo retorno do esforço" },
  { icon: Timer, color: "text-amber-500", label: "Pomodoro", desc: "Sessões de foco cronometradas" },
  { icon: Calendar, color: "text-sky-500", label: "Time Boxing", desc: "Aloque blocos de tempo no dia" },
  { icon: CalendarDays, color: "text-violet-500", label: "Plano Semanal", desc: "Defina e revise metas da semana" },
  { icon: Repeat, color: "text-orange-500", label: "Hábitos", desc: "Construa consistência com sequências" },
];

const GAMIFICATION = [
  { icon: Zap, color: "text-indigo-500", label: "XP & Níveis", desc: "Ganhe XP a cada conclusão" },
  { icon: Flame, color: "text-orange-500", label: "Sequência", desc: "Mantenha sua streak diária" },
  { icon: Trophy, color: "text-amber-500", label: "Conquistas", desc: "Desbloqueie marcos de progresso" },
];

const SLIDES: Slide[] = [
  {
    emoji: "⚡",
    title: "Bem-vindo ao Hub!",
    body: "Quatro métodos de produtividade num só lugar, com gamificação para manter você no ritmo.",
  },
  {
    emoji: "🧩",
    title: "Seus módulos",
    body: "Combine as ferramentas do jeito que funciona para você.",
    content: (
      <div className="mt-4 grid grid-cols-1 gap-2 text-left">
        {MODULES.map(({ icon: Icon, color, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-zinc-100 p-2.5 dark:border-zinc-800"
          >
            <Icon size={18} className={color} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    emoji: "🏆",
    title: "Evolua enquanto produz",
    body: "Cada ação conta pontos e te aproxima do próximo nível.",
    content: (
      <div className="mt-4 grid grid-cols-1 gap-2 text-left">
        {GAMIFICATION.map(({ icon: Icon, color, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-zinc-100 p-2.5 dark:border-zinc-800"
          >
            <Icon size={18} className={color} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [, startTransition] = useTransition();

  if (!open) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function finish() {
    setOpen(false);
    startTransition(() => {
      completeOnboarding();
    });
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl dark:bg-indigo-950/40">
          {slide.emoji}
        </div>

        <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
          {slide.title}
        </h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          {slide.body}
        </p>

        {slide.content}

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={
                i === step
                  ? "h-1.5 w-5 rounded-full bg-indigo-600 transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-zinc-200 transition-all dark:bg-zinc-700"
              }
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Pular
          </button>
          <Button onClick={next} size="sm">
            {isLast ? "Começar a usar" : "Próximo"}
            {!isLast && <ArrowRight size={14} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
