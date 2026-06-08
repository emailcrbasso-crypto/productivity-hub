"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { NAV_ITEMS } from "./nav-items";
import { Logo } from "@/components/brand/Logo";
import { CrbassoAttribution } from "@/components/brand/CrbassoAttribution";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  avatarUrl: string | null;
};

export function Sidebar({ userName, avatarUrl }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-zinc-200 md:bg-white dark:md:border-zinc-800 dark:md:bg-zinc-950">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" aria-label="Hub de Produtividade">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <Link
            href="/profile"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900",
              (pathname === "/profile" || pathname.startsWith("/profile/")) &&
                "bg-zinc-50 dark:bg-zinc-900",
            )}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200">
              {userName}
            </span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sair"
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
        <div className="flex justify-center pt-1">
          <CrbassoAttribution imgClassName="h-4" />
        </div>
      </div>
    </aside>
  );
}
