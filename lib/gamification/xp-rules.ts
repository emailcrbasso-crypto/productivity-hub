export type XpSource =
  | "hub"
  | "eisenhower"
  | "pomodoro"
  | "timeboxing"
  | "weekly_plan"
  | "impact_effort";

export type XpAction =
  // hub-level
  | "debug_test"
  | "achievement_unlocked"
  // eisenhower
  | "task_completed"
  | "urgent_important_task_completed"
  // pomodoro
  | "pomodoro_finished"
  // timeboxing
  | "block_completed"
  // weekly_plan
  | "goal_completed"
  | "weekly_review_done"
  // impact_effort
  | "impact_task_completed"
  | "quick_win_completed";

export const XP_VALUES: Record<XpAction, number> = {
  debug_test: 50,
  achievement_unlocked: 0, // award uses achievement.xp_reward instead
  task_completed: 10,
  urgent_important_task_completed: 15,
  pomodoro_finished: 25,
  block_completed: 15,
  goal_completed: 30,
  weekly_review_done: 50,
  impact_task_completed: 10,
  quick_win_completed: 15,
};

// level = floor(sqrt(xp / 100)) + 1  →  xp_for_level(n) = (n - 1)^2 * 100
export function xpForLevel(level: number) {
  return (level - 1) ** 2 * 100;
}

export function calculateLevel(totalXp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1);
}
