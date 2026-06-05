"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Pencil,
  Trash2,
  BookOpen,
  Star,
  SquarePen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoal,
  saveReview,
  getGoalsForWeek,
  getReviewForWeek,
} from "./actions";
import {
  weekLabel,
  weekRangeLabel,
  offsetWeek,
  isFutureWeek,
  currentWeekStart,
  type WeeklyGoal,
  type WeeklyReview,
} from "./types";

type Props = {
  initialGoals: WeeklyGoal[];
  initialReview: WeeklyReview | null;
  initialWeekStart: string;
};

export function WeeklyPlanBoard({ initialGoals, initialReview, initialWeekStart }: Props) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [goals, setGoals] = useState<WeeklyGoal[]>(initialGoals);
  const [review, setReview] = useState<WeeklyReview | null>(initialReview);
  const [toast, setToast] = useState<string | null>(null);

  // Goal form state
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WeeklyGoal | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const goalDialogRef = useRef<HTMLDialogElement>(null);

  // Review state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [wellDraft, setWellDraft] = useState("");
  const [improveDraft, setImproveDraft] = useState("");
  const [focusDraft, setFocusDraft] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);

  const [, startTransition] = useTransition();
  const router = useRouter();

  // Sync review drafts when review loads
  useEffect(() => {
    setWellDraft(review?.what_went_well ?? "");
    setImproveDraft(review?.what_to_improve ?? "");
    setFocusDraft(review?.next_week_focus ?? "");
    setReviewSaved(false);
  }, [review]);

  // Dialog open/close
  useEffect(() => {
    const el = goalDialogRef.current;
    if (!el) return;
    if (goalFormOpen) el.showModal();
    else if (el.open) el.close();
  }, [goalFormOpen]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function navigateWeek(delta: number) {
    const newWeek = offsetWeek(weekStart, delta);
    setWeekStart(newWeek);
    const [g, r] = await Promise.all([getGoalsForWeek(newWeek), getReviewForWeek(newWeek)]);
    setGoals(g);
    setReview(r);
  }

  function openCreate() {
    setEditingGoal(null);
    setGoalFormOpen(true);
  }

  function openEdit(goal: WeeklyGoal) {
    setEditingGoal(goal);
    setMenuOpenId(null);
    setGoalFormOpen(true);
  }

  function closeGoalForm() {
    setGoalFormOpen(false);
    startTransition(async () => {
      const refreshed = await getGoalsForWeek(weekStart);
      setGoals(refreshed);
    });
  }

  function handleGoalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = (fd.get("description") as string) || null;

    startTransition(async () => {
      if (editingGoal) {
        await updateGoal({ id: editingGoal.id, title, description });
      } else {
        await createGoal({ title, description, weekStart });
      }
      closeGoalForm();
    });
  }

  function handleToggle(goal: WeeklyGoal) {
    const next = !goal.is_completed;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? { ...g, is_completed: next, completed_at: next ? new Date().toISOString() : null }
          : g,
      ),
    );
    setMenuOpenId(null);
    startTransition(async () => {
      const result = await toggleGoal(goal.id, next);
      if (result.awarded) {
        let msg = `+${result.xpGained} XP`;
        if (result.leveledUp) msg += " · Level Up! 🎉";
        if (result.unlockedTitles.length) msg += ` · ${result.unlockedTitles[0]}`;
        setToast(msg);
      }
    });
  }

  function handleDelete(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setMenuOpenId(null);
    startTransition(async () => { await deleteGoal(id); });
  }

  function handleSaveReview() {
    startTransition(async () => {
      const result = await saveReview({
        weekStart,
        whatWentWell: wellDraft,
        whatToImprove: improveDraft,
        nextWeekFocus: focusDraft,
      });
      setReviewSaved(true);
      setReview((prev) => ({
        ...(prev ?? {
          id: "", user_id: "", week_start: weekStart,
          xp_awarded: false, created_at: "", updated_at: "",
        }),
        what_went_well: wellDraft || null,
        what_to_improve: improveDraft || null,
        next_week_focus: focusDraft || null,
        xp_awarded: result.awarded ? true : (prev?.xp_awarded ?? false),
      }));
      if (result.awarded) {
        let msg = `+${result.xpGained} XP pela revisão semanal!`;
        if (result.leveledUp) msg += " · Level Up! 🎉";
        setToast(msg);
      }
    });
  }

  const total = goals.length;
  const done = goals.filter((g) => g.is_completed).length;
  const progress = total > 0 ? (done / total) * 100 : 0;
  const isCurrentWeek = weekStart === currentWeekStart();
  const isFuture = isFutureWeek(weekStart);

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateWeek(-1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-[12rem] px-2 text-center">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {weekLabel(weekStart)}
            </p>
            <p className="text-[11px] text-zinc-400">{weekRangeLabel(weekStart)}</p>
          </div>
          <button
            type="button"
            onClick={() => navigateWeek(1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={16} />
          </button>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={async () => {
                const w = currentWeekStart();
                setWeekStart(w);
                const [g, r] = await Promise.all([getGoalsForWeek(w), getReviewForWeek(w)]);
                setGoals(g);
                setReview(r);
              }}
              className="ml-1 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              Hoje
            </button>
          )}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> Nova meta
        </Button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {done}/{total} {total === 1 ? "meta" : "metas"} concluídas
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              <Star size={14} className="text-amber-500" />
              Metas da semana
            </h3>
            <span className="text-[11px] text-zinc-400">+30 XP por meta</span>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-zinc-400">
              {isFuture
                ? "Planeje suas metas para esta semana."
                : "Nenhuma meta registrada para esta semana."}
            </p>
            <Button size="sm" variant="outline" onClick={openCreate}>
              <Plus size={13} /> Adicionar meta
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="group flex items-start gap-3 px-4 py-3"
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(goal)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    goal.is_completed
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 hover:border-indigo-400 dark:border-zinc-600",
                  )}
                >
                  {goal.is_completed && <Check size={11} strokeWidth={3} />}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-zinc-900 dark:text-white",
                      goal.is_completed && "text-zinc-400 line-through dark:text-zinc-500",
                    )}
                  >
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Context menu */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === goal.id ? null : goal.id)}
                    className="rounded p-1 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <span className="text-xs font-bold leading-none">•••</span>
                  </button>
                  {menuOpenId === goal.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(null)}
                        className="fixed inset-0 z-20"
                      />
                      <div className="absolute right-0 top-6 z-30 min-w-[140px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                        <button
                          type="button"
                          onClick={() => handleToggle(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Check size={13} />
                          {goal.is_completed ? "Desmarcar" : "Concluir"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Pencil size={13} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            router.push(`/eisenhower?goal=${encodeURIComponent(goal.title)}`);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                        >
                          <SquarePen size={13} />
                          Criar tarefa no Eisenhower
                        </button>
                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                        <button
                          type="button"
                          onClick={() => handleDelete(goal.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Weekly review (current or past weeks only) */}
      {!isFuture && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setReviewOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              <BookOpen size={14} className="text-indigo-500" />
              Revisão semanal
              {review?.xp_awarded && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  +50 XP ganhos
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              {!review?.xp_awarded && <span>+50 XP ao salvar</span>}
              <span>{reviewOpen ? "▲" : "▼"}</span>
            </div>
          </button>

          {reviewOpen && (
            <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
              <div className="space-y-4">
                {[
                  { label: "O que foi bem esta semana?", value: wellDraft, onChange: setWellDraft, placeholder: "Vitórias, progressos, conquistas…" },
                  { label: "O que pode melhorar?", value: improveDraft, onChange: setImproveDraft, placeholder: "Obstáculos, pontos de atenção…" },
                  { label: "Foco para a próxima semana", value: focusDraft, onChange: setFocusDraft, placeholder: "Principais prioridades e intenções…" },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label}>
                    <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {label}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => { onChange(e.target.value); setReviewSaved(false); }}
                      rows={3}
                      placeholder={placeholder}
                      className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-600"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-zinc-400">
                    {review?.xp_awarded
                      ? "Revisão salva. Edições adicionais não concedem mais XP."
                      : "Preencha ao menos um campo para ganhar os 50 XP."}
                  </p>
                  <Button onClick={handleSaveReview} size="sm">
                    {reviewSaved ? "✓ Salvo" : "Salvar revisão"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal form dialog */}
      <dialog
        ref={goalDialogRef}
        onClose={() => setGoalFormOpen(false)}
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
          {editingGoal ? "Editar meta" : "Nova meta semanal"}
        </h2>
        <form onSubmit={handleGoalSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Meta <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              defaultValue={editingGoal?.title ?? ""}
              required
              autoFocus
              placeholder="Ex: Terminar relatório mensal, Ler 2 capítulos…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Detalhes
            </label>
            <textarea
              name="description"
              defaultValue={editingGoal?.description ?? ""}
              rows={2}
              placeholder="Opcional"
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setGoalFormOpen(false)}
              className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <Button type="submit" className="flex-1 text-xs">
              {editingGoal ? "Salvar" : "Criar meta"}
            </Button>
          </div>
        </form>
      </dialog>

      {/* XP Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg md:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
