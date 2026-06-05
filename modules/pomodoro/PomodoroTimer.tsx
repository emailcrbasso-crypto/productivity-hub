"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Settings2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { startSession, completeSession, interruptSession } from "./actions";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SESSION_LABELS,
  getPlannedSeconds,
  type SessionType,
  type PomodoroSettings,
} from "./types";

type Task = { id: string; title: string };
type TimerState = "idle" | "running" | "paused" | "completed";

const CIRCUMFERENCE = 2 * Math.PI * 88;

const SESSION_COLOR_TEXT: Record<SessionType, string> = {
  focus: "text-indigo-600 dark:text-indigo-400",
  short_break: "text-emerald-600 dark:text-emerald-400",
  long_break: "text-sky-600 dark:text-sky-400",
};

const SESSION_COLOR_STROKE: Record<SessionType, string> = {
  focus: "stroke-indigo-600",
  short_break: "stroke-emerald-500",
  long_break: "stroke-sky-500",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

function loadSettings(): PomodoroSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
  } catch {
    // AudioContext unavailable
  }
}

function sendNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon.svg" });
  }
}

export function PomodoroTimer({ pendingTasks }: { pendingTasks: Task[] }) {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusMinutes * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [shouldComplete, setShouldComplete] = useState(false);

  // Refs to avoid stale closures inside interval/effects
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const plannedRef = useRef(DEFAULT_SETTINGS.focusMinutes * 60);
  const sessionIdRef = useRef<string | null>(null);
  const timeLeftRef = useRef(DEFAULT_SETTINGS.focusMinutes * 60);
  const sessionTypeRef = useRef<SessionType>("focus");
  const cycleCountRef = useRef(0);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  // Sync refs with state
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
  useEffect(() => { cycleCountRef.current = cycleCount; }, [cycleCount]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setDraftSettings(s);
    const planned = getPlannedSeconds("focus", s);
    setTimeLeft(planned);
    plannedRef.current = planned;
    timeLeftRef.current = planned;
  }, []);

  // Notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Settings dialog open/close
  useEffect(() => {
    const el = settingsDialogRef.current;
    if (!el) return;
    if (settingsOpen) el.showModal();
    else if (el.open) el.close();
  }, [settingsOpen]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Handle natural timer completion (called via shouldComplete flag to avoid stale closure)
  useEffect(() => {
    if (!shouldComplete) return;
    setShouldComplete(false);

    const id = sessionIdRef.current;
    if (!id) return;

    const planned = plannedRef.current;
    const type = sessionTypeRef.current;

    playBeep();

    completeSession(id, planned)
      .then((result) => {
        if (type === "focus") {
          const newCount = cycleCountRef.current + 1;
          setCycleCount(newCount);
          cycleCountRef.current = newCount;

          const notifBody = result.awarded ? `+${result.xpGained} XP ganhos!` : "Sessão concluída!";
          sendNotification("Pomodoro concluído! 🍅", notifBody);

          if (result.awarded) {
            let msg = `+${result.xpGained} XP`;
            if (result.leveledUp) msg += " · Level Up! 🎉";
            if (result.unlockedTitles.length) msg += ` · ${result.unlockedTitles[0]}`;
            setToast(msg);
          }
        } else {
          sendNotification("Pausa concluída!", "Hora de voltar ao foco.");
        }
      })
      .catch((err) => {
        console.error("completeSession failed", err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldComplete]);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startCountdown() {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setTimerState("completed");
          setShouldComplete(true);
          return 0;
        }
        return next;
      });
    }, 1000);
  }

  async function handleStart() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }

    try {
      const id = await startSession({
        type: sessionType,
        plannedDurationSeconds: plannedRef.current,
        taskId: linkedTaskId || null,
      });
      sessionIdRef.current = id;
      setTimerState("running");
      startCountdown();
    } catch (err) {
      console.error("startSession failed", err);
      setToast("Erro ao iniciar sessão. Tente novamente.");
    }
  }

  function handlePause() {
    clearTimer();
    setTimerState("paused");
  }

  function handleResume() {
    setTimerState("running");
    startCountdown();
  }

  function handleStop() {
    clearTimer();
    const id = sessionIdRef.current;
    const elapsed = plannedRef.current - timeLeftRef.current;

    if (id && elapsed > 0) {
      interruptSession(id, elapsed).catch((err) =>
        console.error("interruptSession failed", err),
      );
    }

    applyReset(sessionType);
  }

  function applyReset(type: SessionType, s?: PomodoroSettings) {
    const effectiveSettings = s ?? settings;
    const planned = getPlannedSeconds(type, effectiveSettings);
    setTimeLeft(planned);
    plannedRef.current = planned;
    timeLeftRef.current = planned;
    setTimerState("idle");
    sessionIdRef.current = null;
  }

  function handleNextSession() {
    let nextType: SessionType;
    if (sessionType === "focus") {
      const atLongBreak =
        cycleCountRef.current > 0 &&
        cycleCountRef.current % settings.sessionsBeforeLongBreak === 0;
      nextType = atLongBreak ? "long_break" : "short_break";
    } else {
      nextType = "focus";
    }
    setSessionType(nextType);
    sessionTypeRef.current = nextType;
    applyReset(nextType);
  }

  function switchType(type: SessionType) {
    if (timerState === "running" || timerState === "paused") return;
    setSessionType(type);
    sessionTypeRef.current = type;
    applyReset(type);
  }

  function saveSettings() {
    setSettings(draftSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(draftSettings));
    setSettingsOpen(false);
    if (timerState === "idle") {
      applyReset(sessionType, draftSettings);
    }
  }

  const progress = plannedRef.current > 0 ? 1 - timeLeft / plannedRef.current : 0;
  const dashOffset = CIRCUMFERENCE * progress;

  const cyclePosition = cycleCountRef.current % settings.sessionsBeforeLongBreak;
  const cycleDots = Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => i < cyclePosition);

  const canSwitch = timerState === "idle" || timerState === "completed";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Session type tabs */}
      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {(["focus", "short_break", "long_break"] as SessionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => switchType(type)}
            disabled={!canSwitch}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
              sessionType === type
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-56 w-56">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-100 dark:text-zinc-800"
            />
            {/* Progress */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={SESSION_COLOR_STROKE[sessionType]}
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              style={{
                transition:
                  timerState === "running"
                    ? "stroke-dashoffset 1s linear"
                    : "stroke-dashoffset 0.3s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span
              className={cn(
                "text-5xl font-bold tabular-nums",
                SESSION_COLOR_TEXT[sessionType],
              )}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {SESSION_LABELS[sessionType]}
            </span>
          </div>
        </div>

        {/* Cycle dots (focus only) */}
        {sessionType === "focus" && (
          <div className="flex items-center gap-2">
            {cycleDots.map((done, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  done ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700",
                )}
              />
            ))}
            <span className="ml-1 text-[10px] text-zinc-400">
              {cycleCountRef.current % settings.sessionsBeforeLongBreak}/
              {settings.sessionsBeforeLongBreak}
            </span>
          </div>
        )}
      </div>

      {/* Task selector */}
      {pendingTasks.length > 0 && canSwitch && (
        <div className="flex w-full max-w-xs items-center gap-2">
          <Link2 size={13} className="shrink-0 text-zinc-400" />
          <select
            value={linkedTaskId}
            onChange={(e) => setLinkedTaskId(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="">Vincular tarefa (opcional)</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {timerState === "idle" && (
          <Button onClick={handleStart} size="lg" className="w-36">
            <Play size={16} /> Iniciar
          </Button>
        )}

        {timerState === "running" && (
          <>
            <Button variant="outline" onClick={handlePause} size="lg">
              <Pause size={16} /> Pausar
            </Button>
            <button
              type="button"
              onClick={handleStop}
              title="Interromper sessão"
              className="rounded-lg border border-zinc-200 p-3 text-zinc-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <Square size={18} />
            </button>
          </>
        )}

        {timerState === "paused" && (
          <>
            <Button onClick={handleResume} size="lg" className="w-36">
              <Play size={16} /> Retomar
            </Button>
            <button
              type="button"
              onClick={handleStop}
              title="Interromper sessão"
              className="rounded-lg border border-zinc-200 p-3 text-zinc-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <Square size={18} />
            </button>
          </>
        )}

        {timerState === "completed" && (
          <Button onClick={handleNextSession} size="lg">
            Próxima sessão →
          </Button>
        )}
      </div>

      {/* Settings link */}
      <button
        type="button"
        onClick={() => {
          setDraftSettings(settings);
          setSettingsOpen(true);
        }}
        className="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <Settings2 size={13} /> Configurações
      </button>

      {/* Settings dialog */}
      <dialog
        ref={settingsDialogRef}
        onClose={() => setSettingsOpen(false)}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
          Configurações do Pomodoro
        </h2>

        <div className="space-y-3">
          {(
            [
              { label: "Foco (min)", key: "focusMinutes", min: 1, max: 90 },
              { label: "Pausa curta (min)", key: "shortBreakMinutes", min: 1, max: 30 },
              { label: "Pausa longa (min)", key: "longBreakMinutes", min: 1, max: 60 },
              { label: "Sessões antes da pausa longa", key: "sessionsBeforeLongBreak", min: 1, max: 10 },
            ] as { label: string; key: keyof PomodoroSettings; min: number; max: number }[]
          ).map(({ label, key, min, max }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs text-zinc-700 dark:text-zinc-300">{label}</label>
              <input
                type="number"
                min={min}
                max={max}
                value={draftSettings[key]}
                onChange={(e) =>
                  setDraftSettings((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          ))}
        </div>

        {notifPermission !== "granted" && typeof window !== "undefined" && "Notification" in window && (
          <button
            type="button"
            onClick={async () => {
              const perm = await Notification.requestPermission();
              setNotifPermission(perm);
            }}
            disabled={notifPermission === "denied"}
            className="mt-4 w-full rounded-md bg-zinc-100 py-2 text-xs text-zinc-700 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {notifPermission === "denied"
              ? "Notificações bloqueadas no navegador"
              : "Ativar notificações desktop"}
          </button>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="flex-1 rounded-md border border-zinc-200 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <Button onClick={saveSettings} className="flex-1 text-xs">
            Salvar
          </Button>
        </div>
      </dialog>

      {/* XP Toast */}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg md:bottom-6"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
