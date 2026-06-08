"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Atribuição "por CR BASSO Educação".
 * Mostra o logo (/crbasso-educacao.png) se existir; senão, cai para texto.
 * Para usar o logo: salve o PNG (fundo transparente) em
 * public/crbasso-educacao.png
 */
export function CrbassoAttribution({
  imgClassName = "h-6",
  className,
}: {
  imgClassName?: string;
  className?: string;
}) {
  const [hasLogo, setHasLogo] = useState(true);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] text-zinc-400",
        className,
      )}
    >
      por
      {hasLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/crbasso-educacao.png"
          alt="CR BASSO Educação"
          className={cn("w-auto opacity-80 dark:opacity-90", imgClassName)}
          onError={() => setHasLogo(false)}
        />
      ) : (
        <span className="font-semibold text-zinc-500 dark:text-zinc-400">
          CR BASSO Educação
        </span>
      )}
    </span>
  );
}
