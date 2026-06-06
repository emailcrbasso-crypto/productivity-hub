"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { NAV_ITEMS, BOTTOM_NAV_PRIMARY } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const primary = NAV_ITEMS.slice(0, BOTTOM_NAV_PRIMARY);
  const overflow = NAV_ITEMS.slice(BOTTOM_NAV_PRIMARY);
  const overflowActive = overflow.some((i) => isActive(i.href));

  return (
    <>
      {/* Folha "Mais" */}
      {moreOpen && (
        <>
          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            aria-label="Fechar"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <div className="fixed inset-x-0 bottom-16 z-50 rounded-t-2xl border-t border-zinc-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-2xl md:hidden dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mais ferramentas
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {overflow.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-[11px] font-medium transition-colors",
                    isActive(href)
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-zinc-100 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900",
                  )}
                >
                  <Icon size={20} />
                  <span className="leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        {primary.map(({ href, label, shortLabel, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon size={20} />
              <span className="truncate px-0.5">{shortLabel ?? label}</span>
            </Link>
          );
        })}

        {/* Botão "Mais" */}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
            moreOpen || overflowActive
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <MoreHorizontal size={20} />
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}
