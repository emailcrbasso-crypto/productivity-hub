"use server";

import { revalidatePath } from "next/cache";
import { awardXP } from "@/lib/gamification";

export async function debugAwardXp() {
  const result = await awardXP({
    source: "hub",
    action: "debug_test",
    metadata: { from: "dashboard_debug_button" },
  });
  revalidatePath("/", "layout");
  return result;
}
