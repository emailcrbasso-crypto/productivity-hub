"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLAN_FIELDS, type FiveW2HPlan } from "./types";
import { createPlan, updatePlan } from "./actions";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: FiveW2HPlan | null;
};

type FieldValues = {
  title: string;
  what: string;
  why: string;
  where_field: string;
  when_field: string;
  who: string;
  how: string;
  how_much: string;
};

function emptyFields(): FieldValues {
  return { title: "", what: "", why: "", where_field: "", when_field: "", who: "", how: "", how_much: "" };
}

function fromPlan(plan: FiveW2HPlan): FieldValues {
  return {
    title: plan.title,
    what: plan.what,
    why: plan.why,
    where_field: plan.where_field,
    when_field: plan.when_field,
    who: plan.who,
    how: plan.how,
    how_much: plan.how_much ?? "",
  };
}

export function PlanFormDialog({ open, onClose, editing }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldValues>(emptyFields());

  useEffect(() => {
    if (open) {
      setFields(editing ? fromPlan(editing) : emptyFields());
      setError(null);
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open, editing]);

  function set(key: keyof FieldValues, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof FieldValues)[] = ["title", "what", "why", "where_field", "when_field", "who", "how"];
    for (const k of required) {
      if (!fields[k].trim()) {
        setError("Preencha todos os campos obrigatórios.");
        return;
      }
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updatePlan({
            id: editing.id,
            title: fields.title,
            what: fields.what,
            why: fields.why,
            where_field: fields.where_field,
            when_field: fields.when_field,
            who: fields.who,
            how: fields.how,
            how_much: fields.how_much || null,
          });
        } else {
          await createPlan({
            title: fields.title,
            what: fields.what,
            why: fields.why,
            where_field: fields.where_field,
            when_field: fields.when_field,
            who: fields.who,
            how: fields.how,
            how_much: fields.how_much || null,
          });
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
      <form onSubmit={handleSubmit} className="w-[min(96vw,600px)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {editing ? "Editar plano" : "Novo plano 5W2H"}
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

        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <div className="space-y-1.5">
            <Label htmlFor="plan-title">Nome do plano</Label>
            <Input
              id="plan-title"
              value={fields.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Lançamento do produto X"
              required
              autoFocus
              maxLength={200}
            />
          </div>

          <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />

          {PLAN_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`plan-${f.key}`}>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{f.label}</span>
                {" "}
                <span className="font-normal text-zinc-500">{f.question}</span>
                {!f.required && (
                  <span className="ml-1 text-[11px] text-zinc-400">(opcional)</span>
                )}
              </Label>
              <Textarea
                id={`plan-${f.key}`}
                value={fields[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                required={f.required}
              />
            </div>
          ))}
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : editing ? "Salvar" : "Criar plano"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
