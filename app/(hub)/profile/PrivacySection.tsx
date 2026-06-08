"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "./actions";

const POLICY_URL = "https://crbasso.com.br/politica-de-privacidade/";
const CONFIRM_WORD = "EXCLUIR";

export function PrivacySection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          Seus dados são <strong>criptografados</strong> e <strong>isolados</strong> — só
          você acessa o que cria. Nunca vendemos suas informações. Tratamento conforme a
          LGPD.
        </p>
      </div>

      <a
        href={POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Política de Privacidade da CR BASSO
        <ExternalLink size={12} />
      </a>
      <p className="text-[11px] text-zinc-400">
        Dúvidas ou solicitações sobre seus dados:{" "}
        <a href="mailto:privacidade@crbasso.com.br" className="underline">
          privacidade@crbasso.com.br
        </a>
      </p>

      {/* Danger zone */}
      <div className="mt-2 rounded-lg border border-red-200 p-3 dark:border-red-900/40">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-xs font-semibold text-red-600 dark:text-red-400">
            Excluir minha conta
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          Apaga permanentemente sua conta e todos os dados (tarefas, sessões, hábitos,
          XP e conquistas). Esta ação é <strong>irreversível</strong>.
        </p>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            <Trash2 size={13} /> Quero excluir minha conta
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <label className="block text-[11px] text-zinc-600 dark:text-zinc-400">
              Para confirmar, digite <strong>{CONFIRM_WORD}</strong>:
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmText("");
                }}
                className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <Button
                type="button"
                disabled={confirmText !== CONFIRM_WORD || pending}
                onClick={() => startTransition(() => deleteAccount())}
                className="flex-1 bg-red-600 text-xs hover:bg-red-700 focus-visible:ring-red-400"
              >
                {pending ? "Excluindo..." : "Excluir definitivamente"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
