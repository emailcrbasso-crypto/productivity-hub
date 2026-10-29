"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Lightbulb } from "lucide-react";

type Props = {
  what: string;
  when: string;
  how: string;
  example: string;
};

export function ToolHelp({ what, when, how, example }: Props) {
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
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          <dl className="space-y-2 text-xs">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-semibold text-zinc-400">O que é</dt>
              <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{what}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-semibold text-zinc-400">Quando usar</dt>
              <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{when}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-semibold text-zinc-400">No hub</dt>
              <dd className="leading-relaxed text-zinc-600 dark:text-zinc-300">{how}</dd>
            </div>
          </dl>

          <div className="mt-3 flex gap-2 rounded-lg bg-amber-50/70 p-3 dark:bg-amber-950/20">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Exemplo:{" "}
              </span>
              {example}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
