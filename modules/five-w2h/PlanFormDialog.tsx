"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FiveW2HPlan } from "./types";
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

type FieldDef = {
  key: keyof FieldValues;
  badge: string;
  label: string;
  placeholder: string;
  required: boolean;
  badgeColor: string;
};

const W_FIELDS: FieldDef[] = [
  { key: "what", badge: "O quê?", label: "O que será feito?", placeholder: "Descreva a ação ou projeto", required: true, badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  { key: "why", badge: "Por quê?", label: "Por que isso será feito?", placeholder: "Qual o objetivo ou justificativa", required: true, badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  { key: "where_field", badge: "Onde?", label: "Onde será feito?", placeholder: "Local ou contexto", required: true, badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  { key: "when_field", badge: "Quando?", label: "Quando será feito?", placeholder: "Prazo ou data", required: true, badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  { key: "who", badge: "Quem?", label: "Quem será responsável?", placeholder: "Pessoa ou equipe responsável", required: true, badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
];

const H_FIELDS: FieldDef[] = [
  { key: "how", badge: "Como?", label: "Como será feito?", placeholder: "Método, etapas ou ferramentas", required: true, badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
  { key: "how_much", badge: "Quanto?", label: "Quanto vai custar?", placeholder: "Orçamento, horas ou recursos (opcional)", required: false, badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
];

function FieldRow({ f, value, onChange }: { f: FieldDef; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`plan-${f.key}`} className="flex items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide ${f.badgeColor}`}>
          {f.badge}
        </span>
        <span className="font-normal text-zinc-500 dark:text-zinc-400">{f.label}</span>
        {!f.required && (
          <span className="text-[11px] text-zinc-400">(opcional)</span>
        )}
      </Label>
      <Textarea
        id={`plan-${f.key}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={f.placeholder}
        rows={2}
        required={f.required}
      />
    </div>
  );
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
      <form onSubmit={handleSubmit} className="w-[min(96vw,600px)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
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

        <div className="space-y-4 overflow-y-auto px-5 py-4" style={{ maxHeight: "70vh" }}>
          {/* Plan name */}
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

          {/* 5W section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">5W — Contexto</span>
              <div className="flex-1 border-t border-violet-100 dark:border-violet-900" />
            </div>
            {W_FIELDS.map((f) => (
              <FieldRow key={f.key} f={f} value={fields[f.key]} onChange={(v) => set(f.key, v)} />
            ))}
          </div>

          {/* 2H section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">2H — Execução</span>
              <div className="flex-1 border-t border-indigo-100 dark:border-indigo-900" />
            </div>
            {H_FIELDS.map((f) => (
              <FieldRow key={f.key} f={f} value={fields[f.key]} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : editing ? "Salvar" : "Criar plano"}
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
