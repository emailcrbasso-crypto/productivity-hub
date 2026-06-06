"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import { localDayKey } from "@/lib/time";
import type { HabitColor } from "./types";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export async function createHabit(input: {
  name: string;
  color: HabitColor;
  icon: string;
}): Promise<void> {
  const { supabase, userId } = await getUser();

  const { data: last } = await supabase
    .from("habits")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("habits").insert({
    user_id: userId,
    name: input.name.trim(),
    color: input.color,
    icon: input.icon,
    position: (last?.position ?? -1) + 1,
  });

  if (error) throw new Error(`createHabit: ${error.message}`);
  revalidatePath("/habits");
}

export async function updateHabit(input: {
  id: string;
  name?: string;
  color?: HabitColor;
  icon?: string;
}): Promise<void> {
  const { supabase } = await getUser();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.color !== undefined) patch.color = input.color;
  if (input.icon !== undefined) patch.icon = input.icon;
  const { error } = await supabase.from("habits").update(patch).eq("id", input.id);
  if (error) throw new Error(`updateHabit: ${error.message}`);
  revalidatePath("/habits");
}

export async function deleteHabit(id: string): Promise<void> {
  const { supabase } = await getUser();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw new Error(`deleteHabit: ${error.message}`);
  revalidatePath("/habits");
}

export type ToggleHabitResult = {
  done: boolean;
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

/** Marca/desmarca o hábito no dia de hoje. XP só ao marcar (1x/dia). */
export async function toggleHabitToday(habitId: string): Promise<ToggleHabitResult> {
  const { supabase, userId } = await getUser();
  const today = localDayKey();

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("log_date", today)
    .maybeSingle();

  // Já marcado → desmarca (sem mexer em XP já concedido)
  if (existing) {
    await supabase.from("habit_logs").delete().eq("id", existing.id);
    revalidatePath("/habits");
    return {
      done: false,
      awarded: false,
      xpGained: 0,
      leveledUp: false,
      unlockedTitles: [],
    };
  }

  const { error: insErr } = await supabase.from("habit_logs").insert({
    habit_id: habitId,
    user_id: userId,
    log_date: today,
  });
  if (insErr) throw new Error(`toggleHabitToday: ${insErr.message}`);

  const result = await awardXP({
    source: "habits",
    action: "habit_checked",
    metadata: { habit_id: habitId, date: today },
  });

  revalidatePath("/habits");
  revalidatePath("/dashboard");

  return {
    done: true,
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}
