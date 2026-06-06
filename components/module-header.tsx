import { Star, TrendingUp, Repeat } from "lucide-react";

/** Tile base — estilo "ícone de app" */
const TILE =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10";

export function EisenhowerLogo() {
  return (
    <div className={`${TILE} bg-white dark:bg-zinc-800`}>
      <div className="grid grid-cols-2 gap-[3px]">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-sky-500" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-amber-500" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-zinc-400" />
      </div>
    </div>
  );
}

export function PomodoroLogo() {
  return (
    <div className={`${TILE} bg-red-50 text-2xl dark:bg-red-950/40`}>
      <span aria-hidden>🍅</span>
    </div>
  );
}

export function TimeBoxingLogo() {
  return (
    <div className={`${TILE} flex-col gap-[3px] bg-sky-50 px-2.5 dark:bg-sky-950/40`}>
      <span className="h-1.5 w-full rounded-full bg-indigo-400" />
      <span className="h-1.5 w-2/3 self-start rounded-full bg-sky-400" />
      <span className="h-1.5 w-full rounded-full bg-emerald-400" />
    </div>
  );
}

export function ImpactEffortLogo() {
  return (
    <div className={`${TILE} bg-emerald-50 dark:bg-emerald-950/40`}>
      <TrendingUp size={24} className="text-emerald-500" />
    </div>
  );
}

export function HabitsLogo() {
  return (
    <div className={`${TILE} bg-orange-50 dark:bg-orange-950/40`}>
      <Repeat size={24} className="text-orange-500" />
    </div>
  );
}

export function WeeklyPlanLogo() {
  return (
    <div className={`${TILE} bg-amber-50 dark:bg-amber-950/40`}>
      <Star size={24} className="fill-amber-400 text-amber-500" />
    </div>
  );
}

type Props = {
  logo: React.ReactNode;
  title: string;
  subtitle: string;
};

export function ModuleHeader({ logo, title, subtitle }: Props) {
  return (
    <div className="flex items-center gap-3">
      {logo}
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
    </div>
  );
}
