import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CrbassoAttribution } from "@/components/brand/CrbassoAttribution";

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
        <CrbassoAttribution imgClassName="h-7" />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );
}
