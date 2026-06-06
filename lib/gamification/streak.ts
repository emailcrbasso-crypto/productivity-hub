// Streak utilities — pure functions, easy to test.
// "Today" é o dia no fuso da aplicação (UTC-3), não o do servidor (UTC).

import { localDayKey } from "@/lib/time";

export function todayISO(date = new Date()) {
  return localDayKey(date);
}

function diffInDays(fromISO: string, toISO: string) {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export type StreakInput = {
  lastActivityDate: string | null;
  currentStreak: number;
  longestStreak: number;
  today?: string;
};

export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
};

export function bumpStreak({
  lastActivityDate,
  currentStreak,
  longestStreak,
  today = todayISO(),
}: StreakInput): StreakResult {
  let next: number;

  if (!lastActivityDate) {
    next = 1;
  } else {
    const diff = diffInDays(lastActivityDate, today);
    if (diff === 0) next = Math.max(currentStreak, 1);
    else if (diff === 1) next = currentStreak + 1;
    else next = 1;
  }

  return {
    currentStreak: next,
    longestStreak: Math.max(longestStreak, next),
    lastActivityDate: today,
  };
}
