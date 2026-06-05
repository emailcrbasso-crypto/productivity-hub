"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { debugAwardXp } from "./actions";
import type { AwardXpResult } from "@/lib/gamification";

export function DebugXpButton() {
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState<AwardXpResult | null>(null);

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Debug XP
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Adiciona 50 XP para testar a barra e achievements.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setLast(await debugAwardXp());
            })
          }
        >
          {pending ? "Aplicando..." : "+50 XP"}
        </Button>
      </div>

      {last ? (
        <div className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          <p>
            Ganhou <strong>{last.xpGained} XP</strong> · Total{" "}
            <strong>{last.totalXp}</strong> · Nível{" "}
            <strong>{last.currentLevel}</strong>
            {last.leveledUp ? " 🎉 subiu de nível!" : null}
          </p>
          {last.unlockedAchievements.length > 0 ? (
            <p className="text-orange-700 dark:text-orange-300">
              🏆 Conquistas desbloqueadas:{" "}
              {last.unlockedAchievements.map((a) => a.title).join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
