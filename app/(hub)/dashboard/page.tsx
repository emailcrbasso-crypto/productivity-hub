import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, total_xp, current_level, current_streak")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "você";

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Olá, {displayName}
        </h1>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Seu progresso</p>
        <div className="mt-2 flex gap-6 text-sm text-zinc-900 dark:text-white">
          <span>
            <strong>{profile?.current_level ?? 1}</strong> nível
          </span>
          <span>
            <strong>{profile?.total_xp ?? 0}</strong> XP
          </span>
          <span>
            <strong>{profile?.current_streak ?? 0}</strong> dias seguidos
          </span>
        </div>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Layout completo do hub chega na próxima etapa.
      </p>
    </main>
  );
}
