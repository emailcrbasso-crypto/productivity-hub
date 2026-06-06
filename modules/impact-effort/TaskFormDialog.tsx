"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUADRANTS, type ImpactEffortTask, type Quadrant, quadrantOf } from "./types";
import { createTask, updateTask } from "./actions";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultQuadrant?: Quadrant;
  editing?: ImpactEffortTask | null;
};

export function TaskFormDialog({ open, onClose, defaultQuadrant, editing }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialQuadrant: Quadrant = editing
    ? quadrantOf(editing)
    : defaultQuadrant ?? "ie1";

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [quadrant, setQuadrant] = useState<Quadrant>(initialQuadrant);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setDescription(editing?.description ?? "");
      setQuadrant(initialQuadrant);
      setError(null);
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("Título é obrigatório.");
      return;
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updateTask({ id: editing.id, title: t, description: description || null, quadrant });
        } else {
          await createTask({ title: t, description: description || null, quadrant });
        }
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className="rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-zinc-900/40 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <form onSubmit={handleSubmit} className="w-[min(92vw,460px)] space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {editing ? "Editar tarefa" : "Nova tarefa"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quadrant">Quadrante</Label>
          <Select
            id="quadrant"
            value={quadrant}
            onChange={(e) => setQuadrant(e.target.value as Quadrant)}
          >
            {QUADRANTS.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label} — {q.short}
              </option>
            ))}
          </Select>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : editing ? "Salvar" : "Criar tarefa"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
