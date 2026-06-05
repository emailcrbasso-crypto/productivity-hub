"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskItem } from "./TaskItem";
import type { EisenhowerTask, QuadrantMeta } from "./types";

type Props = {
  meta: QuadrantMeta;
  tasks: EisenhowerTask[];
  showCompleted: boolean;
  onAdd: () => void;
  onEdit: (task: EisenhowerTask) => void;
  onAfterToggle: (msg: string) => void;
};

export function QuadrantCard({
  meta,
  tasks,
  showCompleted,
  onAdd,
  onEdit,
  onAfterToggle,
}: Props) {
  const visible = showCompleted ? tasks : tasks.filter((t) => !t.is_completed);
  const sorted = [...visible].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return a.position - b.position;
  });
  const total = tasks.length;
  const done = tasks.filter((t) => t.is_completed).length;

  return (
    <section
      className={cn(
        "flex min-h-[260px] flex-col rounded-xl border bg-white dark:bg-zinc-950",
        meta.accent.border,
      )}
    >
      <header
        className={cn(
          "flex items-center justify-between rounded-t-xl px-3 py-2",
          meta.accent.headerBg,
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", meta.accent.dot)} />
            <h3
              className={cn(
                "truncate text-sm font-semibold",
                meta.accent.headerText,
              )}
            >
              {meta.label}
            </h3>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {done}/{total}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {meta.short}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "rounded-md p-1.5 transition-colors hover:bg-white/60 dark:hover:bg-zinc-800",
            meta.accent.headerText,
          )}
          aria-label="Adicionar tarefa"
        >
          <Plus size={16} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {sorted.length === 0 ? (
          <p className="m-auto px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
            Nenhuma tarefa aqui.
            <br />
            <button
              type="button"
              onClick={onAdd}
              className="mt-2 text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              Adicionar
            </button>
          </p>
        ) : (
          sorted.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={() => onEdit(task)}
              onAfterToggle={onAfterToggle}
            />
          ))
        )}
      </div>
    </section>
  );
}
