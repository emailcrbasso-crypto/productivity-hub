import { Flame } from "lucide-react";

type Props = {
  level: number;
  totalXp: number;
  streak: number;
};

// XP needed to reach the *next* level using level = floor(sqrt(xp/100)) + 1
// → xp_for_level(n) = (n - 1)^2 * 100
function xpForLevel(level: number) {
  return (level - 1) ** 2 * 100;
}

export function XPStatusBar({ level, totalXp, streak }: Props) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const progressInLevel = Math.max(0, totalXp - currentLevelXp);
  const pct = Math.min(100, Math.round((progressInLevel / span) * 100));

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block">
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
            LV {level}
          </span>
          <span className="font-medium tabular-nums">
            {progressInLevel} / {span} XP
          </span>
        </div>
        <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-zinc-900 transition-[width] dark:bg-white"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
        <Flame size={14} />
        <span className="tabular-nums">{streak}</span>
      </div>
    </div>
  );
}
