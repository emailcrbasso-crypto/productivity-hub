"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import type { BlockColor, TimeboxBlock } from "./types";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export type CreateBlockInput = {
  title: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  color: BlockColor;
};

export async function createBlock(input: CreateBlockInput): Promise<void> {
  const { supabase, userId } = await getUser();

  const { error } = await supabase.from("timeboxing_blocks").insert({
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time,
    color: input.color,
  });

  if (error) throw new Error(`createBlock: ${error.message}`);
  revalidatePath("/timeboxing");
}

export type UpdateBlockInput = {
  id: string;
  title?: string;
  description?: string | null;
  date?: string;
  start_time?: string;
  end_time?: string;
  color?: BlockColor;
};

export async function updateBlock(input: UpdateBlockInput): Promise<void> {
  const { supabase } = await getUser();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.date !== undefined) patch.date = input.date;
  if (input.start_time !== undefined) patch.start_time = input.start_time;
  if (input.end_time !== undefined) patch.end_time = input.end_time;
  if (input.color !== undefined) patch.color = input.color;

  const { error } = await supabase.from("timeboxing_blocks").update(patch).eq("id", input.id);
  if (error) throw new Error(`updateBlock: ${error.message}`);
  revalidatePath("/timeboxing");
}

export async function deleteBlock(id: string): Promise<void> {
  const { supabase } = await getUser();
  const { error } = await supabase.from("timeboxing_blocks").delete().eq("id", id);
  if (error) throw new Error(`deleteBlock: ${error.message}`);
  revalidatePath("/timeboxing");
}

export type CompleteBlockResult = {
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

export async function toggleCompleteBlock(
  id: string,
  nextValue: boolean,
): Promise<CompleteBlockResult> {
  const { supabase } = await getUser();

  const { data: block, error: readErr } = await supabase
    .from("timeboxing_blocks")
    .select("is_completed, xp_awarded")
    .eq("id", id)
    .single();

  if (readErr || !block)
    throw new Error(`toggleCompleteBlock: ${readErr?.message ?? "not found"}`);

  if (block.is_completed === nextValue)
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };

  const patch: Record<string, unknown> = {
    is_completed: nextValue,
    completed_at: nextValue ? new Date().toISOString() : null,
  };
  if (nextValue && !block.xp_awarded) patch.xp_awarded = true;

  const { error: updErr } = await supabase
    .from("timeboxing_blocks")
    .update(patch)
    .eq("id", id);
  if (updErr) throw new Error(`toggleCompleteBlock update: ${updErr.message}`);

  if (!nextValue || block.xp_awarded)
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };

  const result = await awardXP({
    source: "timeboxing",
    action: "block_completed",
    metadata: { block_id: id },
  });

  revalidatePath("/timeboxing");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}

export async function getBlocksForDate(date: string): Promise<TimeboxBlock[]> {
  const { supabase } = await getUser();
  const { data } = await supabase
    .from("timeboxing_blocks")
    .select("*")
    .eq("date", date)
    .order("start_time", { ascending: true });
  return (data ?? []) as TimeboxBlock[];
}
