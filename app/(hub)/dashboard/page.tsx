import { createClient } from "@/lib/supabase/server";
import { DebugXpButton } from "./DebugXpButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const name = profile?.full_name ?? "você";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Olá, {name} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Bem-vindo ao seu hub de produtividade.
        </p>
      </div>
      <DebugXpButton />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Eisenhower", "Pomodoro", "Time Boxing", "Plano Semanal"].map((m) => (
          <div
            key={m}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {m}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Em breve.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
