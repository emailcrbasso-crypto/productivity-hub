"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Gera um novo token de calendário, invalidando o feed antigo. */
export async function regenerateCalendarToken(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ calendar_token: crypto.randomUUID() })
    .eq("id", user.id);

  revalidatePath("/profile");
}
