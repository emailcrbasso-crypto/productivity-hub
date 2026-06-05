"use client";

import { usePathname } from "next/navigation";
import { XPStatusBar } from "./XPStatusBar";
import { NAV_ITEMS } from "./nav-items";

type Props = {
  level: number;
  totalXp: number;
  streak: number;
};

export function Header({ level, totalXp, streak }: Props) {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
    )?.label ?? "Hub";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur md:px-6 dark:border-zinc-800 dark:bg-zinc-950/80">
      <h1 className="text-base font-semibold text-zinc-900 md:text-lg dark:text-white">
        {current}
      </h1>
      <XPStatusBar level={level} totalXp={totalXp} streak={streak} />
    </header>
  );
}
