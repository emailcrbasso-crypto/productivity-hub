"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Check, Pencil, Trash2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createHabit, updateHabit, deleteHabit, toggleHabitToday } from "./actions";
import {
  HABIT_COLORS,
  COLOR_OPTIONS,
  ICON_OPTIONS,
  buildHabitStats,
  dayKeyAgo,
  type Habit,
  type HabitColor,
} from "./types";

type Item = { habit: Habit; dates: Set<string> };
type Props = { initial: { habit: Habit; dates: string[] }[] };

const WEEKDAY = ["D", "S", "T", "Q", "Q", "S", "S"]; // dom..sáb

export function HabitList({ initial }: Props) {
  const [items, setItems] = useState<Item[]>(
    initial.map(({ habit, dates }) => ({ habit, dates: new Set(dates) })),
  );
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Re-sincroniza quando o servidor manda dados novos (após revalidatePath).
  useEffect(() => {
    setItems(initial.map(({ habit, dates }) => ({ habit, dates: new Set(dates) })));
  }, [initial]);

  // Dialog
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState<HabitColor>("indigo");
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else if (el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function openCreate() {
    setEditing(null);
    setName("");
    setIcon(ICON_OPTIONS[0]);
    setColor("indigo");
    setOpen(true);
  }

  function openEdit(h: Habit) {
    setEditing(h);
    setName(h.name);
    setIcon(h.icon);
    setColor(h.color);
    setMenuId(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    startTransition(async () => {
      try {
        if (editing) {
          await updateHabit({ id: editing.id, name: n, icon, color });
          setItems((prev) =>
            prev.map((it) =>
              it.habit.id === editing.id
                ? { ...it, habit: { ...it.habit, name: n, icon, color } }
                : it,
            ),
          );
        } else {
          // O revalidatePath na action atualiza a lista via prop `initial`.
          await createHabit({ name: n, icon, color });
        }
        setOpen(false);
      } catch {
        setToast("Erro ao salvar. A migration de hábitos já foi aplicada?");
      }
    });
  }

  function handleDelete(id: string) {
    setMenuId(null);
    if (!confirm("Excluir este hábito e todo o histórico?")) return;
    const snapshot = items;
    setItems((prev) => prev.filter((it) => it.habit.id !== id));
    startTransition(async () => {
      try {
        await deleteHabit(id);
      } catch {
        setItems(snapshot);
        setToast("Erro ao excluir.");
      }
    });
  }

  function toggle(habitId: string) {
    const today = dayKeyAgo(0);
    const snapshot = items;
    setItems((prev) =>
      prev.map((it) => {
        if (it.habit.id !== habitId) return it;
        const dates = new Set(it.dates);
        if (dates.has(today)) dates.delete(today);
        else dates.add(today);
        return { ...it, dates };
      }),
    );
    startTransition(async () => {
      try {
        const res = await toggleHabitToday(habitId);
        if (res.awarded) {
          let msg = `+${res.xpGained} XP`;
          if (res.leveledUp) msg += " · Level Up! 🎉";
          if (res.unlockedTitles.length) msg += ` · ${res.unlockedTitles[0]}`;
          setToast(msg);
        }
      } catch {
        setItems(snapshot);
        setToast("Erro ao marcar. Tente novamente.");
      }
    });
  }

  const doneToday = items.filter((it) => it.dates.has(dayKeyAgo(0))).length;

  return (
    <div className="space-y-4">
      {/* Resumo + ação */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {items.length === 0
            ? "Comece criando seu primeiro hábito."
            : `${doneToday}/${items.length} hábitos concluídos hoje`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> Novo hábito
        </Button>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
          <span className="text-3xl">✅</span>
          <p className="text-sm font-medium text-zinc-400">Nenhum hábito ainda</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const stats = buildHabitStats(it.habit, it.dates);
            const c = HABIT_COLORS[it.habit.color] ?? HABIT_COLORS.indigo;
            return (
              <li
                key={it.habit.id}
                className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {/* Check de hoje */}
                <button
                  type="button"
                  onClick={() => toggle(it.habit.id)}
                  aria-pressed={stats.doneToday}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    stats.doneToday
                      ? cn(c.bg, "border-transparent text-white")
                      : "border-zinc-300 text-transparent hover:border-zinc-400 dark:border-zinc-600",
                  )}
                >
                  <Check size={18} strokeWidth={3} />
                </button>

                {/* Nome + streak */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{it.habit.icon}</span>
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {it.habit.name}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                    {stats.streak > 0 ? (
                      <span className="flex items-center gap-0.5 font-medium text-orange-500">
                        <Flame size={11} /> {stats.streak}{" "}
                        {stats.streak === 1 ? "dia" : "dias"}
                      </span>
                    ) : (
                      <span className="text-zinc-400">sem sequência</span>
                    )}
                  </div>
                </div>

                {/* Últimos 7 dias */}
                <div className="hidden items-end gap-1 sm:flex">
                  {stats.last7.map((done, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "h-5 w-5 rounded-md",
                          done ? c.bg : "bg-zinc-100 dark:bg-zinc-800",
                        )}
                      />
                      <span className="text-[9px] text-zinc-400">
                        {WEEKDAY[new Date(dayKeyAgo(6 - i) + "T12:00:00").getDay()]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Menu */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === it.habit.id ? null : it.habit.id)}
                    className="rounded p-1 text-zinc-300 opacity-0 transition-opacity hover:text-zinc-600 group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <span className="text-xs font-bold leading-none">•••</span>
                  </button>
                  {menuId === it.habit.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuId(null)}
                        className="fixed inset-0 z-20"
                        aria-label="Fechar"
                      />
                      <div className="absolute right-0 top-7 z-30 min-w-[130px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                        <button
                          type="button"
                          onClick={() => openEdit(it.habit)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(it.habit.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Dialog criar/editar */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
          {editing ? "Editar hábito" : "Novo hábito"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Ex: Beber água, Ler, Exercício…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Ícone
            </label>
            <div className="flex flex-wrap gap-1">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors",
                    icon === ic
                      ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-950/60"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((co) => (
                <button
                  key={co}
                  type="button"
                  onClick={() => setColor(co)}
                  className={cn(
                    "h-6 w-6 rounded-full transition-transform hover:scale-110",
                    HABIT_COLORS[co].bg,
                    color === co && "ring-2 ring-zinc-800 ring-offset-2 dark:ring-white",
                  )}
                  aria-label={co}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <Button type="submit" className="flex-1 text-xs">
              {editing ? "Salvar" : "Criar hábito"}
            </Button>
          </div>
        </form>
      </dialog>

      {/* Toast */}
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
