"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XPStatusBar } from "./XPStatusBar";
import { NAV_ITEMS } from "./nav-items";

type Props = {
  level: number;
  totalXp: number;
  streak: number;
  userName: string;
  avatarUrl: string | null;
};

export function Header({ level, totalXp, streak, userName, avatarUrl }: Props) {
  const pathname = usePathname();
  const current =
    pathname === "/profile" || pathname.startsWith("/profile/")
      ? "Perfil"
      : NAV_ITEMS.find(
          (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
        )?.label ?? "Hub";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur md:px-6 dark:border-zinc-800 dark:bg-zinc-950/80">
      <h1 className="text-base font-semibold text-zinc-900 md:text-lg dark:text-white">
        {current}
      </h1>
      <div className="flex items-center gap-3">
        <XPStatusBar level={level} totalXp={totalXp} streak={streak} />
        {/* Avatar — acesso ao perfil no mobile (desktop usa a sidebar) */}
        <Link href="/profile" aria-label="Perfil" className="md:hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
