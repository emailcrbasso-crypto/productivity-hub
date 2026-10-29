"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";

export type CreatePlanInput = {
  title: string;
  what: string;
  why: string;
  where_field: string;
  when_field: string;
  who: string;
  how: string;
  how_much?: string | null;
};

export type UpdatePlanInput = Partial<CreatePlanInput> & { id: string };

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export async function createPlan(input: CreatePlanInput) {
  const { supabase, userId } = await getUser();

  const { error } = await supabase.from("five_w2h_plans").insert({
    user_id: userId,
    title: input.title.trim(),
    what: input.what.trim(),
    why: input.why.trim(),
    where_field: input.where_field.trim(),
    when_field: input.when_field.trim(),
    who: input.who.trim(),
    how: input.how.trim(),
    how_much: input.how_much?.trim() || null,
  });

  if (error) throw new Error(`createPlan: ${error.message}`);
  revalidatePath("/five-w2h");
}

export async function updatePlan(input: UpdatePlanInput) {
  const { supabase } = await getUser();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.what !== undefined) patch.what = input.what.trim();
  if (input.why !== undefined) patch.why = input.why.trim();
  if (input.where_field !== undefined) patch.where_field = input.where_field.trim();
  if (input.when_field !== undefined) patch.when_field = input.when_field.trim();
  if (input.who !== undefined) patch.who = input.who.trim();
  if (input.how !== undefined) patch.how = input.how.trim();
  if (input.how_much !== undefined) patch.how_much = input.how_much?.trim() || null;

  const { error } = await supabase
    .from("five_w2h_plans")
    .update(patch)
    .eq("id", input.id);

  if (error) throw new Error(`updatePlan: ${error.message}`);
  revalidatePath("/five-w2h");
}

export async function deletePlan(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("five_w2h_plans").delete().eq("id", id);
  if (error) throw new Error(`deletePlan: ${error.message}`);
  revalidatePath("/five-w2h");
}

export type ToggleCompleteResult = {
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

export async function toggleComplete(
  id: string,
  nextValue: boolean,
): Promise<ToggleCompleteResult> {
  const { supabase } = await getUser();

  const { data: plan, error: readErr } = await supabase
    .from("five_w2h_plans")
    .select("id, is_completed, xp_awarded")
    .eq("id", id)
    .single();

  if (readErr || !plan)
    throw new Error(`toggleComplete: ${readErr?.message ?? "not found"}`);

  if (plan.is_completed === nextValue) {
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  const patch: Record<string, unknown> = {
    is_completed: nextValue,
    completed_at: nextValue ? new Date().toISOString() : null,
  };
  if (nextValue && !plan.xp_awarded) patch.xp_awarded = true;

  const { error: updErr } = await supabase
    .from("five_w2h_plans")
    .update(patch)
    .eq("id", id);
  if (updErr) throw new Error(`toggleComplete update: ${updErr.message}`);

  if (!nextValue || plan.xp_awarded) {
    revalidatePath("/five-w2h");
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  const result = await awardXP({
    source: "five_w2h",
    action: "plan_completed",
    metadata: { plan_id: id },
  });

  revalidatePath("/five-w2h");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}
