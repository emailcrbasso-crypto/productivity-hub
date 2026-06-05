import type { SupabaseClient } from "@supabase/supabase-js";

type Criteria =
  | { type: "total_xp"; value: number }
  | { type: "level"; value: number }
  | { type: "streak"; value: number }
  | { type: "all_sources"; value: number };

type Achievement = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  criteria: Criteria;
};

type ProfileSnapshot = {
  total_xp: number;
  current_level: number;
  current_streak: number;
};

export type UnlockedAchievement = Pick<
  Achievement,
  "id" | "slug" | "title" | "description" | "icon" | "xp_reward"
>;

async function distinctSourcesCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("xp_events")
    .select("source")
    .eq("user_id", userId)
    .neq("source", "hub");

  if (!data) return 0;
  return new Set(data.map((r) => r.source as string)).size;
}

function matches(
  criteria: Criteria,
  profile: ProfileSnapshot,
  distinctSources: number,
): boolean {
  switch (criteria.type) {
    case "total_xp":
      return profile.total_xp >= criteria.value;
    case "level":
      return profile.current_level >= criteria.value;
    case "streak":
      return profile.current_streak >= criteria.value;
    case "all_sources":
      return distinctSources >= criteria.value;
  }
}

/**
 * Evaluate all achievements; insert unlocks + their reward events.
 * Does NOT recursively trigger another achievement check — single pass.
 */
export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileSnapshot,
): Promise<UnlockedAchievement[]> {
  const [allRes, ownedRes] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, slug, title, description, icon, xp_reward, criteria"),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
  ]);

  const all = (allRes.data ?? []) as Achievement[];
  const ownedIds = new Set(
    (ownedRes.data ?? []).map((r) => r.achievement_id as string),
  );

  // all_sources is the only criterion that needs an extra query
  const needsSources = all.some(
    (a) => !ownedIds.has(a.id) && a.criteria.type === "all_sources",
  );
  const sources = needsSources
    ? await distinctSourcesCount(supabase, userId)
    : 0;

  const unlocked = all.filter(
    (a) => !ownedIds.has(a.id) && matches(a.criteria, profile, sources),
  );

  if (unlocked.length === 0) return [];

  await supabase.from("user_achievements").insert(
    unlocked.map((a) => ({
      user_id: userId,
      achievement_id: a.id,
    })),
  );

  const rewarded = unlocked.filter((a) => a.xp_reward > 0);
  if (rewarded.length > 0) {
    await supabase.from("xp_events").insert(
      rewarded.map((a) => ({
        user_id: userId,
        source: "hub",
        action: "achievement_unlocked",
        xp_amount: a.xp_reward,
        metadata: { achievement_slug: a.slug },
      })),
    );
  }

  return unlocked.map(({ id, slug, title, description, icon, xp_reward }) => ({
    id,
    slug,
    title,
    description,
    icon,
    xp_reward,
  }));
}
