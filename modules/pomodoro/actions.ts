"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import type { SessionType } from "./types";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");
  return { supabase, userId: user.id };
}

export type StartSessionInput = {
  type: SessionType;
  plannedDurationSeconds: number;
  taskId?: string | null;
  taskSource?: string | null;
};

export async function startSession(input: StartSessionInput): Promise<string> {
  const { supabase, userId } = await getUser();

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({
      user_id: userId,
      task_id: input.taskId || null,
      task_source: input.taskId ? input.taskSource || null : null,
      type: input.type,
      planned_duration_seconds: input.plannedDurationSeconds,
      status: "running",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`startSession: ${error?.message}`);
  return data.id;
}

export type CompleteSessionResult = {
  awarded: boolean;
  xpGained: number;
  leveledUp: boolean;
  unlockedTitles: string[];
};

export async function completeSession(
  id: string,
  actualDurationSeconds: number,
): Promise<CompleteSessionResult> {
  const { supabase } = await getUser();

  const { data: session, error: readErr } = await supabase
    .from("pomodoro_sessions")
    .select("type, planned_duration_seconds, xp_awarded, status")
    .eq("id", id)
    .single();

  if (readErr || !session)
    throw new Error(`completeSession: ${readErr?.message ?? "not found"}`);

  if (session.status !== "running")
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };

  await supabase
    .from("pomodoro_sessions")
    .update({
      status: "completed",
      actual_duration_seconds: actualDurationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", id);

  // XP only for focus sessions with ≥80% of planned duration
  const isFocus = session.type === "focus";
  const threshold = session.planned_duration_seconds * 0.8;
  if (!isFocus || session.xp_awarded || actualDurationSeconds < threshold) {
    revalidatePath("/pomodoro");
    return { awarded: false, xpGained: 0, leveledUp: false, unlockedTitles: [] };
  }

  await supabase
    .from("pomodoro_sessions")
    .update({ xp_awarded: true })
    .eq("id", id);

  const result = await awardXP({
    source: "pomodoro",
    action: "pomodoro_finished",
    metadata: { session_id: id },
  });

  revalidatePath("/pomodoro");
  revalidatePath("/dashboard");

  return {
    awarded: true,
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    unlockedTitles: result.unlockedAchievements.map((a) => a.title),
  };
}

export async function interruptSession(
  id: string,
  actualDurationSeconds: number,
): Promise<void> {
  const { supabase } = await getUser();

  await supabase
    .from("pomodoro_sessions")
    .update({
      status: "interrupted",
      actual_duration_seconds: Math.max(0, actualDurationSeconds),
      ended_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/pomodoro");
}
