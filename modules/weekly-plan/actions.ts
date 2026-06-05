"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import type { WeeklyGoal, WeeklyReview } from "./types";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export async function createGoal(input: {
  title: string;
  description?: string | null;
  category?: string | null;
  weekStart: string;
}): Promise<void> {
  const { supabase, userId } = await getUser();

  const { data: last } = await supabase
    .from("weekly_goals")
    .select("position")
    .eq("user_id", userId)
    .eq("week_start", input.weekStart)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("weekly_goals").insert({
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    category: input.category || null,
    week_start: input.weekStart,
    position: (last?.position ?? -1) + 1,
  });

  if (error) throw new Error(`createGoal: ${error.message}`);
  revalidatePath("/weekly-plan");
}

export async function updateGoal(input: {
  id: string;
  title?: string;
  description?: string | null;
  category?: string | null;
}): Promise<void> {
  const { supabase } = await getUser();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.category !== undefined) patch.category = input.category || null;
  const { error } = await supabase.from("weekly_goals").update(patch).eq("id", input.id);
  if (error) throw new Error(`updateGoal: ${error.message}`);
  revalidatePath("/weekly-plan");
}

export async function deleteGoal(id: string): Promise<void> {
  const { supabase } = await getUser();
  const { error } = await supabase.from("weekly_goals").delete().eq("id", id);
  if (error) throw new Error(`deleteGoal: ${error.message}`);
  revalidatePath("/weekly-plan");
}

export type ToggleGoalResult = {
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

export async function toggleGoal(
  id: string,
  nextValue: boolean,
): Promise<ToggleGoalResult> {
  const { supabase } = await getUser();

  const { data: goal, error: readErr } = await supabase
    .from("weekly_goals")
    .select("is_completed, xp_awarded")
    .eq("id", id)
    .single();

  if (readErr || !goal)
    throw new Error(`toggleGoal: ${readErr?.message ?? "not found"}`);
  if (goal.is_completed === nextValue)
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };

  const patch: Record<string, unknown> = {
    is_completed: nextValue,
    completed_at: nextValue ? new Date().toISOString() : null,
  };
  if (nextValue && !goal.xp_awarded) patch.xp_awarded = true;

  const { error: updErr } = await supabase.from("weekly_goals").update(patch).eq("id", id);
  if (updErr) throw new Error(`toggleGoal update: ${updErr.message}`);

  if (!nextValue || goal.xp_awarded)
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };

  const result = await awardXP({
    source: "weekly_plan",
    action: "goal_completed",
    metadata: { goal_id: id },
  });

  revalidatePath("/weekly-plan");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}

export async function getGoalsForWeek(weekStart: string): Promise<WeeklyGoal[]> {
  const { supabase } = await getUser();
  const { data } = await supabase
    .from("weekly_goals")
    .select("*")
    .eq("week_start", weekStart)
    .order("position", { ascending: true });
  return (data ?? []) as WeeklyGoal[];
}

// ---------------------------------------------------------------------------
// Weekly Review
// ---------------------------------------------------------------------------

export type SaveReviewInput = {
  weekStart: string;
  whatWentWell: string;
  whatToImprove: string;
  nextWeekFocus: string;
};

export type SaveReviewResult = {
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

export async function saveReview(input: SaveReviewInput): Promise<SaveReviewResult> {
  const { supabase, userId } = await getUser();

  const { data: existing } = await supabase
    .from("weekly_reviews")
    .select("id, xp_awarded")
    .eq("user_id", userId)
    .eq("week_start", input.weekStart)
    .single();

  const fields = {
    what_went_well: input.whatWentWell.trim() || null,
    what_to_improve: input.whatToImprove.trim() || null,
    next_week_focus: input.nextWeekFocus.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("weekly_reviews").update(fields).eq("id", existing.id);
  } else {
    await supabase.from("weekly_reviews").insert({
      user_id: userId,
      week_start: input.weekStart,
      ...fields,
    });
  }

  // Award XP only on first save of this review
  const alreadyAwarded = existing?.xp_awarded ?? false;
  const hasContent =
    input.whatWentWell.trim() || input.whatToImprove.trim() || input.nextWeekFocus.trim();

  if (alreadyAwarded || !hasContent) {
    revalidatePath("/weekly-plan");
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  await supabase
    .from("weekly_reviews")
    .update({ xp_awarded: true })
    .eq("user_id", userId)
    .eq("week_start", input.weekStart);

  const result = await awardXP({
    source: "weekly_plan",
    action: "weekly_review_done",
    metadata: { week_start: input.weekStart },
  });

  revalidatePath("/weekly-plan");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}

export async function getReviewForWeek(weekStart: string): Promise<WeeklyReview | null> {
  const { supabase } = await getUser();
  const { data } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("week_start", weekStart)
    .single();
  return (data as WeeklyReview) ?? null;
}
