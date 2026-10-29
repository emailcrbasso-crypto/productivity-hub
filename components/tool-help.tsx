"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Lightbulb, Sparkles } from "lucide-react";

type Props = {
  benefit: string;
  steps: [string, string, string];
  examples: string[];
};

export function ToolHelp({ benefit, steps, examples }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <HelpCircle size={15} className="text-indigo-500" />
          Como usar esta ferramenta
        </span>
        {open ? (
          <ChevronUp size={15} className="text-zinc-400" />
        ) : (
          <ChevronDown size={15} className="text-zinc-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 space-y-4 dark:border-zinc-800">

          {/* Benefício */}
          <div className="flex gap-2 rounded-lg bg-indigo-50/70 p-3 dark:bg-indigo-950/20">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-indigo-500" />
            <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                Por que usar:{" "}
              </span>
              {benefit}
            </p>
          </div>

          {/* Passos */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Passo a passo
            </p>
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-zinc-600 dark:text-zinc-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Exemplos */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Exemplos práticos
            </p>
            <ul className="space-y-1.5">
              {examples.map((ex, i) => (
                <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <Lightbulb size={12} className="mt-0.5 shrink-0 text-amber-500" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
