"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import { metaOf, type Quadrant } from "./types";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  quadrant: Quadrant;
};

export type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string | null;
  quadrant?: Quadrant;
};

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export async function createTask(input: CreateTaskInput) {
  const { supabase, userId } = await getUser();
  const meta = metaOf(input.quadrant);

  const { error } = await supabase.from("impact_effort_tasks").insert({
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    is_high_impact: meta.is_high_impact,
    is_high_effort: meta.is_high_effort,
  });

  if (error) throw new Error(`createTask: ${error.message}`);
  revalidatePath("/impact-effort");
}

export async function updateTask(input: UpdateTaskInput) {
  const { supabase } = await getUser();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined)
    patch.description = input.description?.trim() || null;
  if (input.quadrant !== undefined) {
    const meta = metaOf(input.quadrant);
    patch.is_high_impact = meta.is_high_impact;
    patch.is_high_effort = meta.is_high_effort;
  }

  const { error } = await supabase
    .from("impact_effort_tasks")
    .update(patch)
    .eq("id", input.id);

  if (error) throw new Error(`updateTask: ${error.message}`);
  revalidatePath("/impact-effort");
}

export async function moveTask(id: string, quadrant: Quadrant) {
  return updateTask({ id, quadrant });
}

export async function deleteTask(id: string) {
  const { supabase } = await getUser();
  const { error } = await supabase.from("impact_effort_tasks").delete().eq("id", id);
  if (error) throw new Error(`deleteTask: ${error.message}`);
  revalidatePath("/impact-effort");
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

  const { data: task, error: readErr } = await supabase
    .from("impact_effort_tasks")
    .select("id, is_high_impact, is_high_effort, is_completed, xp_awarded")
    .eq("id", id)
    .single();

  if (readErr || !task)
    throw new Error(`toggleComplete: ${readErr?.message ?? "not found"}`);

  if (task.is_completed === nextValue) {
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  const patch: Record<string, unknown> = {
    is_completed: nextValue,
    completed_at: nextValue ? new Date().toISOString() : null,
  };
  if (nextValue && !task.xp_awarded) patch.xp_awarded = true;

  const { error: updErr } = await supabase
    .from("impact_effort_tasks")
    .update(patch)
    .eq("id", id);
  if (updErr) throw new Error(`toggleComplete update: ${updErr.message}`);

  if (!nextValue || task.xp_awarded) {
    revalidatePath("/impact-effort");
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  // Ganhos rápidos (alto impacto, baixo esforço) valem mais XP.
  const isQuickWin = task.is_high_impact && !task.is_high_effort;
  const result = await awardXP({
    source: "impact_effort",
    action: isQuickWin ? "quick_win_completed" : "impact_task_completed",
    metadata: { task_id: id },
  });

  revalidatePath("/impact-effort");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}
