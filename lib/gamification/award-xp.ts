import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  XP_VALUES,
  calculateLevel,
  type XpAction,
  type XpSource,
} from "./xp-rules";
import { bumpStreak } from "./streak";
import {
  checkAndUnlockAchievements,
  type UnlockedAchievement,
} from "./achievements";

export type AwardXpInput = {
  source: XpSource;
  action: XpAction;
  /** Overrides the default XP value from XP_VALUES. */
  amount?: number;
  metadata?: Record<string, unknown>;
};

export type AwardXpResult = {
  xpGained: number;
  totalXp: number;
  currentLevel: number;
  leveledUp: boolean;
  previousLevel: number;
  unlockedAchievements: UnlockedAchievement[];
};

/**
 * Single entry point for awarding XP. Server-only.
 *
 * Pipeline:
 *  1. Insert xp_events row (immutable log)
 *  2. Recompute total_xp from the log (avoids race conditions on a counter)
 *  3. Recompute level + streak
 *  4. Update profile
 *  5. Check + unlock achievements (which may insert their own reward events)
 *  6. If achievements gave XP, recompute profile XP/level once more
 */
export async function awardXP(input: AwardXpInput): Promise<AwardXpResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("awardXP: not authenticated");

  const amount = input.amount ?? XP_VALUES[input.action];
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`awardXP: invalid amount for ${input.action}: ${amount}`);
  }

  const { error: insertErr } = await supabase.from("xp_events").insert({
    user_id: user.id,
    source: input.source,
    action: input.action,
    xp_amount: amount,
    metadata: input.metadata ?? {},
  });
  if (insertErr) throw new Error(`awardXP: insert failed — ${insertErr.message}`);

  const { data: profileBefore } = await supabase
    .from("profiles")
    .select(
      "total_xp, current_level, current_streak, longest_streak, last_activity_date",
    )
    .eq("id", user.id)
    .single();

  const previousLevel = profileBefore?.current_level ?? 1;

  const totalXp = await sumXp(supabase, user.id);
  const currentLevel = calculateLevel(totalXp);
  const streak = bumpStreak({
    lastActivityDate: profileBefore?.last_activity_date ?? null,
    currentStreak: profileBefore?.current_streak ?? 0,
    longestStreak: profileBefore?.longest_streak ?? 0,
  });

  await supabase
    .from("profiles")
    .update({
      total_xp: totalXp,
      current_level: currentLevel,
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_activity_date: streak.lastActivityDate,
    })
    .eq("id", user.id);

  const unlocked = await checkAndUnlockAchievements(supabase, user.id, {
    total_xp: totalXp,
    current_level: currentLevel,
    current_streak: streak.currentStreak,
  });

  // If achievements awarded XP, sync the profile counters once more.
  let finalTotalXp = totalXp;
  let finalLevel = currentLevel;
  if (unlocked.some((a) => a.xp_reward > 0)) {
    finalTotalXp = await sumXp(supabase, user.id);
    finalLevel = calculateLevel(finalTotalXp);
    if (finalLevel !== currentLevel || finalTotalXp !== totalXp) {
      await supabase
        .from("profiles")
        .update({ total_xp: finalTotalXp, current_level: finalLevel })
        .eq("id", user.id);
    }
  }

  return {
    xpGained: finalTotalXp - (profileBefore?.total_xp ?? 0),
    totalXp: finalTotalXp,
    currentLevel: finalLevel,
    leveledUp: finalLevel > previousLevel,
    previousLevel,
    unlockedAchievements: unlocked,
  };
}

async function sumXp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("xp_events")
    .select("xp_amount")
    .eq("user_id", userId);
  return (data ?? []).reduce((acc, r) => acc + (r.xp_amount ?? 0), 0);
}
