"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateNameState = { error: string | null; success?: boolean };

export async function updateProfileName(
  _prev: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) return { error: "O nome não pode ficar vazio." };
  if (fullName.length > 80) return { error: "Nome muito longo (máx. 80 caracteres)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { error: null, success: true };
}

/**
 * LGPD — direito de portabilidade. Reúne todos os dados do titular num
 * objeto JSON serializável (o cliente faz o download).
 */
export async function exportMyData(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const tables = [
    "profiles",
    "eisenhower_tasks",
    "impact_effort_tasks",
    "pomodoro_sessions",
    "timeboxing_blocks",
    "weekly_goals",
    "weekly_reviews",
    "habits",
    "habit_logs",
    "xp_events",
    "user_achievements",
  ] as const;

  const result: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
  };

  for (const table of tables) {
    const { data } = await supabase.from(table).select("*");
    result[table] = data ?? [];
  }

  return result;
}

/**
 * LGPD — direito de eliminação. Apaga a conta e TODOS os dados do titular
 * (via função SECURITY DEFINER que remove o usuário em auth.users; o cascade
 * cuida do resto). Em seguida encerra a sessão e redireciona.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw new Error(`deleteAccount: ${error.message}`);

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?deleted=1");
}
