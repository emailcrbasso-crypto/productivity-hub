"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuadrantCard } from "./QuadrantCard";
import { TaskFormDialog } from "./TaskFormDialog";
import { QUADRANTS, quadrantOf, type ImpactEffortTask, type Quadrant } from "./types";

type Props = {
  tasks: ImpactEffortTask[];
};

function isToday(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function Board({ tasks }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant>("ie1");
  const [editing, setEditing] = useState<ImpactEffortTask | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function openCreate(q: Quadrant) {
    setEditing(null);
    setDefaultQuadrant(q);
    setDialogOpen(true);
  }

  function openEdit(task: ImpactEffortTask) {
    setEditing(task);
    setDefaultQuadrant(quadrantOf(task));
    setDialogOpen(true);
  }

  const byQuadrant: Record<Quadrant, ImpactEffortTask[]> = {
    ie1: [],
    ie2: [],
    ie3: [],
    ie4: [],
  };
  for (const t of tasks) byQuadrant[quadrantOf(t)].push(t);

  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const completedToday = tasks.filter(
    (t) => t.is_completed && isToday(t.completed_at),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {QUADRANTS.map((q) => (
            <span key={q.id} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", q.accent.dot)} />
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{q.label}</span>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                {byQuadrant[q.id].filter((t) => !t.is_completed).length}
              </span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500 dark:text-zinc-400">
          <span>
            Hoje:{" "}
            <strong className="text-zinc-900 dark:text-white">{completedToday}</strong>{" "}
            concluídas
          </span>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-indigo-600"
            />
            Mostrar concluídas
          </label>
          <Button size="sm" onClick={() => openCreate("ie1")}>
            <Plus size={14} /> Nova tarefa
          </Button>
        </div>
      </div>

      {pendingCount === 0 ? (
        <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
          Nenhuma tarefa ativa.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANTS.map((meta) => (
          <QuadrantCard
            key={meta.id}
            meta={meta}
            tasks={byQuadrant[meta.id]}
            showCompleted={showCompleted}
            onAdd={() => openCreate(meta.id)}
            onEdit={openEdit}
            onAfterToggle={(msg) => setToast(msg)}
          />
        ))}
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        defaultQuadrant={defaultQuadrant}
        editing={editing}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg md:bottom-6"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
