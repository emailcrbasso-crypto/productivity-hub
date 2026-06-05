"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import { metaOf, type Quadrant } from "./types";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  quadrant: Quadrant;
  due_date?: string | null;
};

export type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string | null;
  quadrant?: Quadrant;
  due_date?: string | null;
};

async function getOwnedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export async function createTask(input: CreateTaskInput) {
  const { supabase, userId } = await getOwnedUserId();
  const meta = metaOf(input.quadrant);

  const { error } = await supabase.from("eisenhower_tasks").insert({
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    is_urgent: meta.is_urgent,
    is_important: meta.is_important,
    due_date: input.due_date || null,
  });

  if (error) throw new Error(`createTask: ${error.message}`);
  revalidatePath("/eisenhower");
}

export async function updateTask(input: UpdateTaskInput) {
  const { supabase } = await getOwnedUserId();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined)
    patch.description = input.description?.trim() || null;
  if (input.due_date !== undefined) patch.due_date = input.due_date || null;
  if (input.quadrant !== undefined) {
    const meta = metaOf(input.quadrant);
    patch.is_urgent = meta.is_urgent;
    patch.is_important = meta.is_important;
  }

  const { error } = await supabase
    .from("eisenhower_tasks")
    .update(patch)
    .eq("id", input.id);

  if (error) throw new Error(`updateTask: ${error.message}`);
  revalidatePath("/eisenhower");
}

export async function moveTask(id: string, quadrant: Quadrant) {
  return updateTask({ id, quadrant });
}

export async function deleteTask(id: string) {
  const { supabase } = await getOwnedUserId();
  const { error } = await supabase.from("eisenhower_tasks").delete().eq("id", id);
  if (error) throw new Error(`deleteTask: ${error.message}`);
  revalidatePath("/eisenhower");
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
  const { supabase } = await getOwnedUserId();

  const { data: task, error: readErr } = await supabase
    .from("eisenhower_tasks")
    .select("id, is_urgent, is_important, is_completed, xp_awarded")
    .eq("id", id)
    .single();

  if (readErr || !task) throw new Error(`toggleComplete: ${readErr?.message ?? "not found"}`);

  if (task.is_completed === nextValue) {
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  const patch: Record<string, unknown> = {
    is_completed: nextValue,
    completed_at: nextValue ? new Date().toISOString() : null,
  };

  let awarded = false;
  let xpGained = 0;
  let leveledUp = false;
  let unlockedTitles: string[] = [];

  if (nextValue && !task.xp_awarded) {
    patch.xp_awarded = true;
  }

  const { error: updErr } = await supabase
    .from("eisenhower_tasks")
    .update(patch)
    .eq("id", id);
  if (updErr) throw new Error(`toggleComplete update: ${updErr.message}`);

  if (nextValue && !task.xp_awarded) {
    const action =
      task.is_urgent && task.is_important
        ? ("urgent_important_task_completed" as const)
        : ("task_completed" as const);

    const result = await awardXP({
      source: "eisenhower",
      action,
      metadata: { task_id: id },
    });
    awarded = true;
    xpGained = result.xpGained;
    leveledUp = result.leveledUp;
    unlockedTitles = result.unlockedAchievements.map((a) => a.title);
  }

  revalidatePath("/eisenhower");
  revalidatePath("/dashboard");

  return { awarded, xpGained, leveledUp, unlockedTitles };
}
