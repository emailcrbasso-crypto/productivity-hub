"use client";

import { useRef, useState, useTransition } from "react";
import { MoreVertical, Trash2, Pencil, ArrowRight, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QUADRANTS,
  metaOf,
  quadrantOf,
  type EisenhowerTask,
  type Quadrant,
} from "./types";
import { deleteTask, moveTask, toggleComplete } from "./actions";

type Props = {
  task: EisenhowerTask;
  onEdit: () => void;
  onAfterToggle?: (msg: string) => void;
  onSchedule?: () => void;
};

function formatDue(due: string | null) {
  if (!due) return null;
  const d = new Date(due + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
  if (diffDays < 0) return { text: `Venceu ${fmt}`, overdue: true };
  if (diffDays === 0) return { text: "Hoje", overdue: false };
  if (diffDays === 1) return { text: "Amanhã", overdue: false };
  return { text: fmt, overdue: false };
}

export function TaskItem({ task, onEdit, onAfterToggle, onSchedule }: Props) {
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = quadrantOf(task);
  const due = formatDue(task.due_date);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleComplete(task.id, !task.is_completed);
      if (result.awarded && onAfterToggle) {
        const parts = [`+${result.xpGained} XP`];
        if (result.leveledUp) parts.push("subiu de nível!");
        if (result.unlockedTitles.length > 0)
          parts.push(`🏆 ${result.unlockedTitles.join(", ")}`);
        onAfterToggle(parts.join(" · "));
      }
    });
  }

  function handleMove(quadrant: Quadrant) {
    setMenuOpen(false);
    startTransition(async () => {
      await moveTask(task.id, quadrant);
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (!confirm("Excluir esta tarefa?")) return;
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-md border border-zinc-200 bg-white p-2.5 text-sm shadow-xs transition-opacity dark:border-zinc-800 dark:bg-zinc-950",
        task.is_completed && "opacity-60",
        pending && "opacity-50",
      )}
    >
      <input
        type="checkbox"
        checked={task.is_completed}
        onChange={handleToggle}
        disabled={pending}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-600"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium text-zinc-900 dark:text-white",
            task.is_completed && "line-through",
          )}
        >
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {task.description}
          </p>
        ) : null}
        {due ? (
          <p
            className={cn(
              "mt-1 text-[11px] font-medium",
              due.overdue
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {due.text}
          </p>
        ) : null}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
          className="rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Mais opções"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-zinc-200 bg-white py-1 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Pencil size={12} /> Editar
            </button>
            {onSchedule && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  onSchedule();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
              >
                <CalendarPlus size={12} /> Agendar no Time Boxing
              </button>
            )}
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
            <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Mover para
            </p>
            {QUADRANTS.filter((q) => q.id !== current).map((q) => (
              <button
                key={q.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMove(q.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className={cn("h-2 w-2 rounded-full", metaOf(q.id).accent.dot)} />
                <ArrowRight size={12} className="text-zinc-400" /> {q.label}
              </button>
            ))}
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
