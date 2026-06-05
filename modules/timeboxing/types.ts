export type BlockColor =
  | "indigo"
  | "red"
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "pink"
  | "orange";

export type TimeboxBlock = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS (Postgres time)
  end_time: string;
  color: BlockColor;
  is_completed: boolean;
  completed_at: string | null;
  xp_awarded: boolean;
  created_at: string;
};

export const BLOCK_COLORS: Record<
  BlockColor,
  { bg: string; border: string; text: string; dot: string; darkBg: string }
> = {
  indigo: {
    bg: "bg-indigo-100",
    border: "border-indigo-300",
    text: "text-indigo-900",
    dot: "bg-indigo-500",
    darkBg: "dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-200",
  },
  red: {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-red-900",
    dot: "bg-red-500",
    darkBg: "dark:bg-red-950/60 dark:border-red-700 dark:text-red-200",
  },
  amber: {
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-900",
    dot: "bg-amber-500",
    darkBg: "dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200",
  },
  emerald: {
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
    darkBg: "dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200",
  },
  sky: {
    bg: "bg-sky-100",
    border: "border-sky-300",
    text: "text-sky-900",
    dot: "bg-sky-500",
    darkBg: "dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200",
  },
  violet: {
    bg: "bg-violet-100",
    border: "border-violet-300",
    text: "text-violet-900",
    dot: "bg-violet-500",
    darkBg: "dark:bg-violet-950/60 dark:border-violet-700 dark:text-violet-200",
  },
  pink: {
    bg: "bg-pink-100",
    border: "border-pink-300",
    text: "text-pink-900",
    dot: "bg-pink-500",
    darkBg: "dark:bg-pink-950/60 dark:border-pink-700 dark:text-pink-200",
  },
  orange: {
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-900",
    dot: "bg-orange-500",
    darkBg: "dark:bg-orange-950/60 dark:border-orange-700 dark:text-orange-200",
  },
};

export const COLOR_OPTIONS = Object.keys(BLOCK_COLORS) as BlockColor[];

// Timeline constants
export const HOUR_HEIGHT = 80; // px per hour
export const START_HOUR = 6;
export const END_HOUR = 23;
export const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function blockTop(start_time: string): number {
  return (timeToMinutes(start_time) - START_HOUR * 60) * PIXELS_PER_MINUTE;
}

export function blockHeight(start_time: string, end_time: string): number {
  return Math.max(
    (timeToMinutes(end_time) - timeToMinutes(start_time)) * PIXELS_PER_MINUTE,
    HOUR_HEIGHT / 4, // minimum visible height
  );
}

export type BlockWithLane = TimeboxBlock & { lane: number; totalLanes: number };

export function assignLanes(blocks: TimeboxBlock[]): BlockWithLane[] {
  const sorted = [...blocks].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
  );

  const laneEnds: number[] = []; // end time of last block in each lane

  const assigned = sorted.map((block) => {
    const start = timeToMinutes(block.start_time);
    const end = timeToMinutes(block.end_time);
    let lane = laneEnds.findIndex((e) => e <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    return { ...block, lane };
  });

  const totalLanes = laneEnds.length;
  return assigned.map((b) => ({ ...b, totalLanes }));
}

export function formatDuration(start_time: string, end_time: string): string {
  const mins = timeToMinutes(end_time) - timeToMinutes(start_time);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function offsetDate(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateLabel(dateISO: string): string {
  const today = todayISO();
  const tomorrow = offsetDate(today, 1);
  const yesterday = offsetDate(today, -1);
  if (dateISO === today) return "Hoje";
  if (dateISO === tomorrow) return "Amanhã";
  if (dateISO === yesterday) return "Ontem";
  const [, m, d] = dateISO.split("-");
  return `${d}/${m}`;
}
