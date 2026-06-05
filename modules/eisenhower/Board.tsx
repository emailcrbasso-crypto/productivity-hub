"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuadrantCard } from "./QuadrantCard";
import { TaskFormDialog } from "./TaskFormDialog";
import {
  QUADRANTS,
  quadrantOf,
  type EisenhowerTask,
  type Quadrant,
} from "./types";

type Props = {
  tasks: EisenhowerTask[];
};

export function Board({ tasks }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant>("q1");
  const [editing, setEditing] = useState<EisenhowerTask | null>(null);
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

  function openEdit(task: EisenhowerTask) {
    setEditing(task);
    setDefaultQuadrant(quadrantOf(task));
    setDialogOpen(true);
  }

  const byQuadrant: Record<Quadrant, EisenhowerTask[]> = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  };
  for (const t of tasks) byQuadrant[quadrantOf(t)].push(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer accent-indigo-600"
          />
          Mostrar concluídas
        </label>
        <Button size="sm" onClick={() => openCreate("q1")}>
          <Plus size={14} /> Nova tarefa
        </Button>
      </div>

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
