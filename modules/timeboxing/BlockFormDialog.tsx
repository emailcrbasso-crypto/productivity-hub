"use client";

import { useEffect, useRef, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createBlock, updateBlock } from "./actions";
import {
  BLOCK_COLORS,
  COLOR_OPTIONS,
  todayISO,
  type BlockColor,
  type TimeboxBlock,
} from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  date: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultTitle?: string;
  editing?: TimeboxBlock | null;
};

export function BlockFormDialog({
  open,
  onClose,
  date,
  defaultStartTime = "09:00",
  defaultEndTime = "10:00",
  defaultTitle,
  editing = null,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else if (el.open) el.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      date: fd.get("date") as string,
      start_time: fd.get("start_time") as string,
      end_time: fd.get("end_time") as string,
      color: fd.get("color") as BlockColor,
    };

    startTransition(async () => {
      if (editing) {
        await updateBlock({ id: editing.id, ...data });
      } else {
        await createBlock(data);
      }
      onClose();
    });
  }

  const title = editing?.title ?? defaultTitle ?? "";
  const description = editing?.description ?? "";
  const blockDate = editing?.date ?? date;
  const startTime = editing?.start_time?.slice(0, 5) ?? defaultStartTime;
  const endTime = editing?.end_time?.slice(0, 5) ?? defaultEndTime;
  const color: BlockColor = editing?.color ?? "indigo";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
        {editing ? "Editar bloco" : "Novo bloco de tempo"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            defaultValue={title}
            required
            autoFocus
            placeholder="Ex: Deep work, Reunião, Exercícios…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Descrição
          </label>
          <textarea
            name="description"
            defaultValue={description}
            rows={2}
            placeholder="Opcional"
            className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        {/* Date + times */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-1">
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Data
            </label>
            <input
              type="date"
              name="date"
              defaultValue={blockDate}
              required
              min={todayISO()}
              className="w-full rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Início
            </label>
            <input
              type="time"
              name="start_time"
              defaultValue={startTime}
              required
              className="w-full rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Fim
            </label>
            <input
              type="time"
              name="end_time"
              defaultValue={endTime}
              required
              className="w-full rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Cor
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={c === color}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "block h-6 w-6 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110",
                    BLOCK_COLORS[c].dot,
                    "ring-transparent",
                    "[input:checked+&]:ring-zinc-800 dark:[input:checked+&]:ring-white",
                  )}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <Button type="submit" disabled={pending} className="flex-1 text-xs">
            {pending ? "Salvando…" : editing ? "Salvar" : "Criar bloco"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
