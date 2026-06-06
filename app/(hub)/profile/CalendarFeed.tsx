"use client";

import { useState, useTransition } from "react";
import { Check, Copy, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenerateCalendarToken } from "./calendar-actions";

export function CalendarFeed({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  // Montado no cliente para usar a origem real (dev/prod)
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/${token}`
      : `/api/calendar/${token}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function regenerate() {
    if (
      !confirm(
        "Gerar um novo link vai invalidar o atual. Você precisará reassinar o calendário. Continuar?",
      )
    )
      return;
    startTransition(() => regenerateCalendarToken());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
        <Calendar size={14} className="text-sky-500" />
        Assinar no calendário
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        Adicione seus blocos do Time Boxing ao Google, Apple ou Outlook. O
        calendário atualiza sozinho (a cada ~1h, conforme o app).
      </p>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        />
        <Button type="button" size="sm" onClick={copy} className="shrink-0">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <details className="text-[11px] text-zinc-500 dark:text-zinc-400">
        <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-white">
          Como assinar no Google Calendar
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Copie o link acima.</li>
          <li>
            No Google Calendar (computador): ao lado de “Outras agendas”, clique
            em <strong>+</strong> → <strong>De URL</strong>.
          </li>
          <li>Cole o link e confirme. Pronto — seus blocos aparecem lá.</li>
        </ol>
      </details>

      <button
        type="button"
        onClick={regenerate}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
      >
        <RefreshCw size={12} className={pending ? "animate-spin" : ""} />
        {pending ? "Gerando..." : "Gerar novo link (revoga o atual)"}
      </button>
    </div>
  );
}
