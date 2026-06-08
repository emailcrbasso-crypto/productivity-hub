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
