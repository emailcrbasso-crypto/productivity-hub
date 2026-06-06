"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hub route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl dark:bg-red-950/40">
        ⚠️
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Algo deu errado
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Não foi possível carregar esta seção. Tente novamente — se persistir,
          recarregue a página.
        </p>
      </div>
      <Button onClick={reset} size="sm">
        <RefreshCw size={14} /> Tentar novamente
      </Button>
    </div>
  );
}
