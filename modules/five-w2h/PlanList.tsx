"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, CheckCircle2, Circle, Pencil, Trash2, ChevronDown, ChevronUp, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FiveW2HPlan } from "./types";
import { PlanFormDialog } from "./PlanFormDialog";
import { deletePlan, toggleComplete } from "./actions";

type Props = {
  plans: FiveW2HPlan[];
};

type FieldBadge = {
  key: keyof Pick<FiveW2HPlan, "what" | "why" | "where_field" | "when_field" | "who" | "how" | "how_much">;
  label: string;
  group: "w" | "h";
};

const FIELD_BADGES: FieldBadge[] = [
  { key: "what", label: "O quê?", group: "w" },
  { key: "why", label: "Por quê?", group: "w" },
  { key: "where_field", label: "Onde?", group: "w" },
  { key: "when_field", label: "Quando?", group: "w" },
  { key: "who", label: "Quem?", group: "w" },
  { key: "how", label: "Como?", group: "h" },
  { key: "how_much", label: "Quanto?", group: "h" },
];

function filledCount(plan: FiveW2HPlan) {
  return FIELD_BADGES.filter((f) => !!plan[f.key]).length;
}

function XpToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg md:bottom-6">
      {message}
    </div>
  );
}

function ProgressDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex items-center gap-1" title={`${filled} de ${total} campos preenchidos`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < filled ? "bg-violet-400" : "bg-zinc-200 dark:bg-zinc-700",
          )}
        />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onToast,
}: {
  plan: FiveW2HPlan;
  onEdit: (p: FiveW2HPlan) => void;
  onToast: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  const filled = filledCount(plan);
  const total = FIELD_BADGES.length;

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleComplete(plan.id, !plan.is_completed);
      if (res.awarded) {
        const msg = res.leveledUp
          ? `+${res.xpGained} XP — Subiu para o nível seguinte!`
          : `+${res.xpGained} XP pelo plano concluído`;
        onToast(msg);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir este plano?")) return;
    startTransition(async () => {
      await deletePlan(plan.id);
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-all dark:bg-zinc-900",
        plan.is_completed
          ? "border-zinc-100 dark:border-zinc-800"
          : "border-zinc-200 shadow-sm dark:border-zinc-700",
      )}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          aria-label={plan.is_completed ? "Desmarcar conclusão" : "Marcar como concluído"}
          className="mt-0.5 shrink-0 text-zinc-400 transition-colors hover:text-indigo-600 disabled:opacity-50 dark:hover:text-indigo-400"
        >
          {plan.is_completed ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {/* Title + progress */}
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-semibold",
                plan.is_completed
                  ? "text-zinc-400 line-through dark:text-zinc-500"
                  : "text-zinc-900 dark:text-white",
              )}
            >
              {plan.title}
            </p>
            {!plan.is_completed && <ProgressDots filled={filled} total={total} />}
          </div>

          {/* O quê preview */}
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
            {plan.what}
          </p>

          {/* Quem + Quando chips */}
          {!plan.is_completed && (plan.who || plan.when_field) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.who && (
                <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  <User size={10} />
                  {plan.who}
                </span>
              )}
              {plan.when_field && (
                <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Calendar size={10} />
                  {plan.when_field}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            aria-label="Excluir"
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={expanded ? "Recolher" : "Ver detalhes"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 5W column */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">5W — Contexto</p>
              {FIELD_BADGES.filter((f) => f.group === "w").map((f) => {
                const val = plan[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="space-y-0.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                      {f.label}
                    </dt>
                    <dd className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{val}</dd>
                  </div>
                );
              })}
            </div>

            {/* 2H column */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">2H — Execução</p>
              {FIELD_BADGES.filter((f) => f.group === "h").map((f) => {
                const val = plan[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="space-y-0.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {f.label}
                    </dt>
                    <dd className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{val}</dd>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanList({ plans }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FiveW2HPlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(plan: FiveW2HPlan) {
    setEditing(plan);
    setDialogOpen(true);
  }

  const pending = plans.filter((p) => !p.is_completed);
  const completed = plans.filter((p) => p.is_completed);

  return (
    <>
      {toast && <XpToast message={toast} />}

      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {pending.length === 0
              ? "Nenhum plano em andamento"
              : `${pending.length} plano${pending.length !== 1 ? "s" : ""} em andamento`}
          </p>
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus size={15} />
            Novo plano
          </Button>
        </div>

        {/* Pending plans */}
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-2xl">📋</p>
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Nenhum plano ainda
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Clique em &quot;Novo plano&quot; para estruturar sua próxima iniciativa.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onToast={setToast} />
            ))}
          </div>
        )}

        {/* Completed toggle */}
        {completed.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowCompleted((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {completed.length} plano{completed.length !== 1 ? "s" : ""} concluído{completed.length !== 1 ? "s" : ""}
            </button>
            {showCompleted && (
              <div className="mt-3 space-y-3 opacity-60">
                {completed.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onToast={setToast} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PlanFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </>
  );
}
