"use client";

import { useState } from "react";
import { Info, Plus } from "lucide-react";
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
  const [helpOpen, setHelpOpen] = useState(false);
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
          "relative flex items-center justify-between rounded-t-xl px-3 py-2",
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
            <button
              type="button"
              onClick={() => setHelpOpen((o) => !o)}
              className={cn(
                "rounded-full p-0.5 transition-colors hover:bg-white/60 dark:hover:bg-zinc-800",
                meta.accent.headerText,
              )}
              aria-label="Sobre este quadrante"
            >
              <Info size={13} />
            </button>
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

        {helpOpen ? (
          <>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              aria-label="Fechar"
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute left-3 right-3 top-full z-20 mt-1 rounded-lg border border-zinc-200 bg-white p-3 text-xs shadow-xl dark:border-zinc-700 dark:bg-zinc-900 md:left-auto md:right-3 md:w-72">
              <p className="text-zinc-700 dark:text-zinc-200">
                {meta.description}
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Exemplos
              </p>
              <ul className="mt-1 space-y-0.5 text-zinc-700 dark:text-zinc-200">
                {meta.examples.map((ex) => (
                  <li key={ex} className="flex gap-1.5">
                    <span className={cn("mt-1 h-1 w-1 rounded-full", meta.accent.dot)} />
                    {ex}
                  </li>
                ))}
              </ul>
              <p
                className={cn(
                  "mt-3 rounded-md p-2 text-[11px] italic",
                  meta.accent.headerBg,
                  meta.accent.headerText,
                )}
              >
                {meta.tip}
              </p>
            </div>
          </>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {sorted.length === 0 ? (
          <p className="m-auto px-4 py-6 text-center text-xs italic text-zinc-400 dark:text-zinc-600">
            {meta.emptyMessage}
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

      <button
        type="button"
        onClick={onAdd}
        className="m-2 mt-0 flex items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50/60 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
      >
        <Plus size={14} /> Adicionar tarefa
      </button>
    </section>
  );
}
