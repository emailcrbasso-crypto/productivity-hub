export type SessionType = "focus" | "short_break" | "long_break";
export type SessionStatus = "running" | "completed" | "interrupted";

export type PomodoroSession = {
  id: string;
  user_id: string;
  task_id: string | null;
  type: SessionType;
  planned_duration_seconds: number;
  actual_duration_seconds: number | null;
  status: SessionStatus;
  started_at: string;
  ended_at: string | null;
  xp_awarded: boolean;
  created_at: string;
};

export type PomodoroSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
};

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
};

export const SETTINGS_STORAGE_KEY = "pomodoro_settings";

export const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Foco",
  short_break: "Pausa Curta",
  long_break: "Pausa Longa",
};

export function getPlannedSeconds(type: SessionType, s: PomodoroSettings): number {
  if (type === "focus") return s.focusMinutes * 60;
  if (type === "short_break") return s.shortBreakMinutes * 60;
  return s.longBreakMinutes * 60;
}
