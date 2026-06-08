import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" aria-label="Hub de Produtividade">
          <Logo large />
        </Link>
        <p className="text-[11px] text-zinc-400">
          por{" "}
          <span className="font-semibold text-zinc-500 dark:text-zinc-400">
            CR BASSO Educação
          </span>
        </p>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );
}
