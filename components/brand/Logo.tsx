import { cn } from "@/lib/utils";

/** Símbolo (tile com gradiente + raio). Use sozinho ou dentro do <Logo>. */
export function LogoMark({
  size = 30,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="hubLogoGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="0.5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#hubLogoGrad)" />
      <path
        d="M291 80 L160 296 L240 296 L221 432 L352 216 L272 216 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

type Props = {
  size?: number;
  /** Mostra o wordmark ao lado do símbolo */
  wordmark?: boolean;
  /** Versão maior (telas de auth) */
  large?: boolean;
  className?: string;
};

export function Logo({ size = 30, wordmark = true, large = false, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={large ? 40 : size} />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-900 dark:text-white",
              large ? "text-xl" : "text-base",
            )}
          >
            Hub
          </span>
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.22em] text-indigo-500/80 dark:text-indigo-400/80",
              large ? "text-[10px]" : "text-[9px]",
            )}
          >
            Produtividade
          </span>
        </span>
      )}
    </span>
  );
}
