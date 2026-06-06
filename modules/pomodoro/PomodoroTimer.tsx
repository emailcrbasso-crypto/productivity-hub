"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Settings2, Boxes } from "lucide-react";
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

export type TaskSource = "eisenhower" | "impact_effort" | "timeboxing";
export type Task = { id: string; title: string; source?: TaskSource };

const TASK_SOURCE_LABEL: Record<TaskSource, string> = {
  eisenhower: "Eisenhower",
  impact_effort: "Impacto × Esforço",
  timeboxing: "Time Boxing",
};

const TASK_SOURCE_ORDER: TaskSource[] = ["eisenhower", "impact_effort", "timeboxing"];
type TimerState = "idle" | "running" | "paused" | "completed";

const SESSION_BG: Record<SessionType, string> = {
  focus: "bg-red-50 dark:bg-red-950/20",
  short_break: "bg-emerald-50 dark:bg-emerald-950/20",
  long_break: "bg-sky-50 dark:bg-sky-950/20",
};

const SESSION_TIME_COLOR: Record<SessionType, string> = {
  focus: "text-red-500 dark:text-red-400",
  short_break: "text-emerald-500 dark:text-emerald-400",
  long_break: "text-sky-500 dark:text-sky-400",
};

const SESSION_BTN: Record<SessionType, string> = {
  focus: "bg-red-500 hover:bg-red-600 focus-visible:ring-red-400",
  short_break: "bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-400",
  long_break: "bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400",
};

const SESSION_TAB_ACTIVE: Record<SessionType, string> = {
  focus: "bg-white text-red-600 shadow-sm dark:bg-zinc-800 dark:text-red-400",
  short_break: "bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400",
  long_break: "bg-white text-sky-600 shadow-sm dark:bg-zinc-800 dark:text-sky-400",
};

const STATUS_LABEL: Record<TimerState, string> = {
  idle: "PRONTO",
  running: "EM ANDAMENTO",
  paused: "PAUSADO",
  completed: "CONCLUÍDO ✓",
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

// AudioContext reaproveitado entre sessões (criar um novo a cada vez some
// com a permissão de áudio em alguns navegadores).
let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedAudioCtx) sharedAudioCtx = new Ctor();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/** "Desbloqueia" o áudio num gesto do usuário (clique em iniciar). */
function primeAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

/** Chime de 3 notas ascendentes — bem mais perceptível que um beep só. */
function playChime() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Em abas de fundo o contexto pode estar suspenso.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notes = [
    { freq: 660, at: 0 },
    { freq: 880, at: 0.18 },
    { freq: 1175, at: 0.36 },
  ];
  for (const { freq, at } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + at);
    gain.gain.setValueAtTime(0.0001, now + at);
    gain.gain.exponentialRampToValueAtTime(0.35, now + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.5);
    osc.start(now + at);
    osc.stop(now + at + 0.5);
  }
}

function vibrate() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch { /* ignore */ }
}

function sendNotification(title: string, body: string) {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      // Mantém a notificação na tela até o usuário interagir (útil p/ aba de fundo)
      requireInteraction: true,
      tag: "pomodoro-complete",
    });
  }
}

// ---------------------------------------------------------------------------
// Timer persistence across hub page navigations
// ---------------------------------------------------------------------------
const TIMER_PERSIST_KEY = "pomodoro_running_session";

type PersistedTimer = {
  timerState: "running" | "paused";
  sessionId: string;
  sessionType: SessionType;
  plannedSeconds: number;
  startedAt: number;   // absolute Date.now() timestamp
  elapsedBefore: number; // ms accumulated before current run
  cycleCount: number;
  linkedTaskId: string;
};

function persistTimer(data: PersistedTimer) {
  try { localStorage.setItem(TIMER_PERSIST_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearPersistedTimer() {
  try { localStorage.removeItem(TIMER_PERSIST_KEY); } catch { /* ignore */ }
}

function loadPersistedTimer(): PersistedTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_PERSIST_KEY);
    return raw ? (JSON.parse(raw) as PersistedTimer) : null;
  } catch { return null; }
}

export function PomodoroTimer({
  pendingTasks,
  blockContext,
}: {
  pendingTasks: Task[];
  blockContext?: string | null;
}) {
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
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const plannedRef = useRef(DEFAULT_SETTINGS.focusMinutes * 60);
  const sessionIdRef = useRef<string | null>(null);
  // Timestamp-based tracking — immune to browser background tab throttling
  const startedAtRef = useRef(0);       // Date.now() when current run period began
  const elapsedBeforeRef = useRef(0);   // ms accumulated across all previous run periods
  const timerStateRef = useRef<TimerState>("idle");
  const sessionTypeRef = useRef<SessionType>("focus");
  const cycleCountRef = useRef(0);
  const settingsRef = useRef<PomodoroSettings>(DEFAULT_SETTINGS);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => { timerStateRef.current = timerState; }, [timerState]);
  useEffect(() => { sessionTypeRef.current = sessionType; }, [sessionType]);
  useEffect(() => { cycleCountRef.current = cycleCount; }, [cycleCount]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setDraftSettings(s);

    // Restore in-progress session if user navigated away
    const saved = loadPersistedTimer();
    if (saved) {
      setSessionType(saved.sessionType);
      sessionTypeRef.current = saved.sessionType;
      plannedRef.current = saved.plannedSeconds;
      elapsedBeforeRef.current = saved.elapsedBefore;
      sessionIdRef.current = saved.sessionId;
      setCycleCount(saved.cycleCount);
      cycleCountRef.current = saved.cycleCount;
      setLinkedTaskId(saved.linkedTaskId);

      if (saved.timerState === "running") {
        const totalMs = saved.elapsedBefore + (Date.now() - saved.startedAt);
        const remaining = Math.max(0, saved.plannedSeconds - Math.floor(totalMs / 1000));
        if (remaining > 0) {
          // Restore startedAt so computeRemaining() stays accurate
          startedAtRef.current = saved.startedAt;
          setTimeLeft(remaining);
          setTimerState("running");
          startCountdown();
        } else {
          // Completed while away — trigger completion flow
          setTimeLeft(0);
          setTimerState("completed");
          setShouldComplete(true);
          clearPersistedTimer();
        }
      } else {
        // paused
        const remaining = Math.max(0, saved.plannedSeconds - Math.floor(saved.elapsedBefore / 1000));
        setTimeLeft(remaining);
        setTimerState("paused");
      }
      return;
    }

    const planned = getPlannedSeconds("focus", s);
    setTimeLeft(planned);
    plannedRef.current = planned;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const el = settingsDialogRef.current;
    if (!el) return;
    if (settingsOpen) el.showModal();
    else if (el.open) el.close();
  }, [settingsOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Natural completion handler (avoids stale closures in setInterval)
  useEffect(() => {
    if (!shouldComplete) return;
    setShouldComplete(false);
    const id = sessionIdRef.current;
    if (!id) return;
    const planned = plannedRef.current;
    const type = sessionTypeRef.current;

    if (settingsRef.current.soundEnabled) playChime();
    vibrate();
    clearPersistedTimer();

    completeSession(id, planned)
      .then((result) => {
        if (type === "focus") {
          const newCount = cycleCountRef.current + 1;
          setCycleCount(newCount);
          cycleCountRef.current = newCount;
          sendNotification("Pomodoro concluído! 🍅", result.awarded ? `+${result.xpGained} XP ganhos!` : "Sessão concluída!");
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
      .catch((err) => console.error("completeSession failed", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldComplete]);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function computeRemaining(): number {
    const totalMs = elapsedBeforeRef.current + (Date.now() - startedAtRef.current);
    return Math.max(0, plannedRef.current - Math.floor(totalMs / 1000));
  }

  function startCountdown() {
    startedAtRef.current = Date.now();
    // Poll at 500ms so we stay accurate even with background throttling
    intervalRef.current = setInterval(() => {
      const remaining = computeRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimerState("completed");
        setShouldComplete(true);
      }
    }, 500);
  }

  // Recalculate immediately when tab regains focus
  useEffect(() => {
    function handleVisible() {
      if (timerStateRef.current !== "running") return;
      const remaining = computeRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        setTimerState("completed");
        setShouldComplete(true);
      }
    }
    document.addEventListener("visibilitychange", handleVisible);
    return () => document.removeEventListener("visibilitychange", handleVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    // Desbloqueia o áudio neste gesto do usuário (necessário p/ tocar
    // o chime quando a aba estiver em segundo plano no fim da sessão).
    if (settingsRef.current.soundEnabled) primeAudio();

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      setNotifBannerDismissed(true);
    }
    try {
      const linked = pendingTasks.find((t) => t.id === linkedTaskId);
      const id = await startSession({
        type: sessionType,
        plannedDurationSeconds: plannedRef.current,
        taskId: linkedTaskId || null,
        taskSource: linked?.source ?? null,
      });
      sessionIdRef.current = id;
      elapsedBeforeRef.current = 0;
      setTimerState("running");
      startCountdown(); // sets startedAtRef.current
      persistTimer({
        timerState: "running",
        sessionId: id,
        sessionType: sessionTypeRef.current,
        plannedSeconds: plannedRef.current,
        startedAt: startedAtRef.current,
        elapsedBefore: 0,
        cycleCount: cycleCountRef.current,
        linkedTaskId: linkedTaskId,
      });
    } catch (err) {
      console.error("startSession failed", err);
      setToast("Erro ao iniciar sessão. Tente novamente.");
    }
  }

  function handlePause() {
    elapsedBeforeRef.current += Date.now() - startedAtRef.current;
    clearTimer();
    setTimerState("paused");
    if (sessionIdRef.current) {
      persistTimer({
        timerState: "paused",
        sessionId: sessionIdRef.current,
        sessionType: sessionTypeRef.current,
        plannedSeconds: plannedRef.current,
        startedAt: startedAtRef.current,
        elapsedBefore: elapsedBeforeRef.current,
        cycleCount: cycleCountRef.current,
        linkedTaskId: linkedTaskId,
      });
    }
  }

  function handleResume() {
    setTimerState("running");
    startCountdown(); // resets startedAtRef.current
    if (sessionIdRef.current) {
      persistTimer({
        timerState: "running",
        sessionId: sessionIdRef.current,
        sessionType: sessionTypeRef.current,
        plannedSeconds: plannedRef.current,
        startedAt: startedAtRef.current,
        elapsedBefore: elapsedBeforeRef.current,
        cycleCount: cycleCountRef.current,
        linkedTaskId: linkedTaskId,
      });
    }
  }

  function handleStop() {
    const elapsed = Math.floor(
      (elapsedBeforeRef.current +
        (timerStateRef.current === "running" ? Date.now() - startedAtRef.current : 0)) /
        1000,
    );
    clearTimer();
    const id = sessionIdRef.current;
    if (id && elapsed > 0) {
      interruptSession(id, elapsed).catch((err) =>
        console.error("interruptSession failed", err),
      );
    }
    applyReset(sessionType);
  }

  function applyReset(type: SessionType, s?: PomodoroSettings) {
    const eff = s ?? settings;
    const planned = getPlannedSeconds(type, eff);
    setTimeLeft(planned);
    plannedRef.current = planned;
    elapsedBeforeRef.current = 0;
    setTimerState("idle");
    sessionIdRef.current = null;
    clearPersistedTimer();
  }

  function handleNextSession() {
    let nextType: SessionType;
    if (sessionType === "focus") {
      const atLong = cycleCountRef.current > 0 && cycleCountRef.current % settings.sessionsBeforeLongBreak === 0;
      nextType = atLong ? "long_break" : "short_break";
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
    if (timerState === "idle") applyReset(sessionType, draftSettings);
  }

  const canSwitch = timerState === "idle" || timerState === "completed";
  const linkedTask = pendingTasks.find((t) => t.id === linkedTaskId);
  const cyclePosition = cycleCountRef.current % settings.sessionsBeforeLongBreak;
  const cycleDots = Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => i < cyclePosition);

  return (
    <div className="flex flex-col gap-4">
      {/* Time Boxing context banner */}
      {blockContext && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs dark:border-sky-800/50 dark:bg-sky-950/30">
          <Boxes size={14} className="shrink-0 text-sky-600 dark:text-sky-400" />
          <span className="text-sky-800 dark:text-sky-300">
            Bloco ativo: <span className="font-semibold">{blockContext}</span>
          </span>
        </div>
      )}

      {/* Notification banner */}
      {notifPermission === "default" && !notifBannerDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs dark:border-amber-800/50 dark:bg-amber-950/30">
          <span className="text-amber-800 dark:text-amber-300">
            🔔 Ative notificações para saber quando o foco termina, mesmo em outra aba.
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const perm = await Notification.requestPermission();
                setNotifPermission(perm);
                setNotifBannerDismissed(true);
              }}
              className="rounded-md bg-amber-500 px-3 py-1 font-medium text-white hover:bg-amber-600"
            >
              Ativar
            </button>
            <button
              type="button"
              onClick={() => setNotifBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Timer card */}
      <div className={cn("rounded-xl p-6 transition-colors", SESSION_BG[sessionType])}>
        {/* Session type tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200/70 bg-white/60 p-1 dark:border-zinc-700/50 dark:bg-zinc-900/60">
          {(["focus", "short_break", "long_break"] as SessionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => switchType(type)}
              disabled={!canSwitch}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                sessionType === type
                  ? SESSION_TAB_ACTIVE[sessionType]
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400",
              )}
            >
              {SESSION_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Big time display */}
        <div className="flex flex-col items-center gap-1 py-4">
          <span className={cn("text-7xl font-bold tabular-nums leading-none", SESSION_TIME_COLOR[sessionType])}>
            {formatTime(timeLeft)}
          </span>
          <span className="mt-2 text-[11px] font-semibold tracking-widest text-zinc-400 dark:text-zinc-500">
            {STATUS_LABEL[timerState]}
          </span>
          {linkedTask && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tarefa ativa:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {linkedTask.title}
              </span>
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {timerState === "idle" && (
            <button
              type="button"
              onClick={handleStart}
              className={cn(
                "rounded-xl px-10 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2",
                SESSION_BTN[sessionType],
              )}
            >
              Iniciar
            </button>
          )}
          {timerState === "running" && (
            <>
              <button
                type="button"
                onClick={handlePause}
                className={cn(
                  "rounded-xl px-8 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2",
                  SESSION_BTN[sessionType],
                )}
              >
                <Pause size={16} className="inline mr-1.5 -mt-0.5" />
                Pausar
              </button>
              <button
                type="button"
                onClick={handleStop}
                title="Interromper"
                className="rounded-xl border border-zinc-300 bg-white p-3 text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-red-700 dark:hover:text-red-400"
              >
                <Square size={16} />
              </button>
            </>
          )}
          {timerState === "paused" && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className={cn(
                  "rounded-xl px-8 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2",
                  SESSION_BTN[sessionType],
                )}
              >
                <Play size={16} className="inline mr-1.5 -mt-0.5" />
                Retomar
              </button>
              <button
                type="button"
                onClick={handleStop}
                title="Interromper"
                className="rounded-xl border border-zinc-300 bg-white p-3 text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-red-700 dark:hover:text-red-400"
              >
                <Square size={16} />
              </button>
            </>
          )}
          {timerState === "completed" && (
            <button
              type="button"
              onClick={handleNextSession}
              className={cn(
                "rounded-xl px-8 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2",
                SESSION_BTN[sessionType],
              )}
            >
              Próxima sessão →
            </button>
          )}
        </div>

        {/* Cycle dots */}
        {sessionType === "focus" && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {cycleDots.map((done, i) => (
              <div
                key={i}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  done ? "bg-red-400" : "bg-zinc-300 dark:bg-zinc-600",
                )}
              />
            ))}
            <span className="ml-2 text-[10px] text-zinc-400">ciclos até pausa longa</span>
          </div>
        )}
      </div>

      {/* Task selector + settings */}
      <div className="flex items-center gap-3">
        {pendingTasks.length > 0 && canSwitch && (
          <select
            value={linkedTaskId}
            onChange={(e) => setLinkedTaskId(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <option value="">Vincular tarefa (opcional)</option>
            {TASK_SOURCE_ORDER.map((src) => {
              const group = pendingTasks.filter((t) => (t.source ?? "eisenhower") === src);
              if (group.length === 0) return null;
              return (
                <optgroup key={src} label={TASK_SOURCE_LABEL[src]}>
                  {group.map((t) => (
                    <option key={`${src}-${t.id}`} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        )}
        <button
          type="button"
          onClick={() => { setDraftSettings(settings); setSettingsOpen(true); }}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 transition-colors hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:text-zinc-200"
        >
          <Settings2 size={13} /> Configurações
        </button>
      </div>

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
                value={draftSettings[key] as number}
                onChange={(e) =>
                  setDraftSettings((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          ))}

          {/* Som ao concluir */}
          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <label htmlFor="soundEnabled" className="text-xs text-zinc-700 dark:text-zinc-300">
              Som ao concluir
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  primeAudio();
                  playChime();
                }}
                className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Testar
              </button>
              <input
                id="soundEnabled"
                type="checkbox"
                checked={draftSettings.soundEnabled}
                onChange={(e) =>
                  setDraftSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))
                }
                className="h-4 w-4 cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="flex-1 rounded-md border border-zinc-200 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
