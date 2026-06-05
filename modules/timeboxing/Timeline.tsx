"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  MousePointerClick,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toggleCompleteBlock, deleteBlock, getBlocksForDate } from "./actions";
import { BlockFormDialog } from "./BlockFormDialog";
import {
  BLOCK_COLORS,
  HOUR_HEIGHT,
  START_HOUR,
  END_HOUR,
  PIXELS_PER_MINUTE,
  timeToMinutes,
  minutesToTimeString,
  blockTop,
  blockHeight,
  assignLanes,
  formatDuration,
  todayISO,
  offsetDate,
  formatDateLabel,
  type TimeboxBlock,
  type BlockWithLane,
} from "./types";

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const LABEL_WIDTH = 56;

type Props = { initialBlocks: TimeboxBlock[]; initialDate: string };

export function Timeline({ initialBlocks, initialDate }: Props) {
  const [date, setDate] = useState(initialDate);
  const [blocks, setBlocks] = useState<TimeboxBlock[]>(initialBlocks);
  const [toast, setToast] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimeboxBlock | null>(null);
  const [clickTime, setClickTime] = useState<{ start: string; end: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const today = todayISO();

  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  // Scroll page to current time on mount
  useEffect(() => {
    if (date !== today || !currentMinutes || !gridRef.current) return;
    const gridTop = gridRef.current.getBoundingClientRect().top + window.scrollY;
    const timeOffset = (currentMinutes - START_HOUR * 60) * PIXELS_PER_MINUTE;
    window.scrollTo({ top: gridTop + timeOffset - 200, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function navigateDate(delta: number) {
    const newDate = offsetDate(date, delta);
    setDate(newDate);
    const fetched = await getBlocksForDate(newDate);
    setBlocks(fetched);
  }

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-block]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const mins = START_HOUR * 60 + Math.floor(y / PIXELS_PER_MINUTE);
    const rounded = Math.round(mins / 15) * 15;
    const start = minutesToTimeString(Math.min(rounded, (END_HOUR - 1) * 60));
    const end = minutesToTimeString(Math.min(rounded + 60, END_HOUR * 60));
    setEditing(null);
    setClickTime({ start, end });
    setDialogOpen(true);
  }

  function openEdit(block: TimeboxBlock) {
    setEditing(block);
    setClickTime(null);
    setDialogOpen(true);
    setMenuOpenId(null);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    startTransition(async () => {
      const fetched = await getBlocksForDate(date);
      setBlocks(fetched);
    });
  }

  function handleToggleComplete(block: TimeboxBlock) {
    const next = !block.is_completed;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? { ...b, is_completed: next, completed_at: next ? new Date().toISOString() : null }
          : b,
      ),
    );
    setMenuOpenId(null);
    startTransition(async () => {
      const result = await toggleCompleteBlock(block.id, next);
      if (result.awarded) {
        let msg = `+${result.xpGained} XP`;
        if (result.leveledUp) msg += " · Level Up! 🎉";
        if (result.unlockedTitles.length) msg += ` · ${result.unlockedTitles[0]}`;
        setToast(msg);
      }
    });
  }

  function handleDelete(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setMenuOpenId(null);
    startTransition(async () => { await deleteBlock(id); });
  }

  const blocksWithLanes: BlockWithLane[] = assignLanes(blocks);
  const totalBlocks = blocks.length;
  const completedCount = blocks.filter((b) => b.is_completed).length;
  const totalPlannedMins = blocks.reduce(
    (acc, b) => acc + timeToMinutes(b.end_time) - timeToMinutes(b.start_time), 0,
  );
  const completedMins = blocks
    .filter((b) => b.is_completed)
    .reduce((acc, b) => acc + timeToMinutes(b.end_time) - timeToMinutes(b.start_time), 0);

  const currentTimeTop =
    date === today && currentMinutes !== null
      ? (currentMinutes - START_HOUR * 60) * PIXELS_PER_MINUTE
      : null;

  return (
    <div className="space-y-3">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date nav */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[5.5rem] text-center text-sm font-semibold text-zinc-900 dark:text-white">
            {formatDateLabel(date)}
            {date !== today && (
              <span className="ml-1 text-[11px] font-normal text-zinc-400">
                {date.slice(8)}/{date.slice(5, 7)}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => navigateDate(1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={16} />
          </button>
          {date !== today && (
            <button
              type="button"
              onClick={async () => {
                setDate(today);
                const fetched = await getBlocksForDate(today);
                setBlocks(fetched);
              }}
              className="ml-1 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              Hoje
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Summary inline */}
          {totalBlocks > 0 && (
            <div className="hidden items-center gap-3 text-xs sm:flex">
              <span className="text-zinc-400">
                {Math.floor(totalPlannedMins / 60)}h{totalPlannedMins % 60 > 0 ? `${totalPlannedMins % 60}m` : ""} planejados
              </span>
              <span className={cn(
                "font-semibold",
                completedCount === totalBlocks ? "text-emerald-600" : "text-indigo-600 dark:text-indigo-400"
              )}>
                {completedCount}/{totalBlocks} concluídos
              </span>
              {completedMins > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {Math.floor(completedMins / 60)}h{completedMins % 60 > 0 ? `${completedMins % 60}m` : ""} focados
                </span>
              )}
            </div>
          )}
          <Button size="sm" onClick={() => { setEditing(null); setClickTime(null); setDialogOpen(true); }}>
            <Plus size={14} /> Novo bloco
          </Button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Labels column */}
        <div
          className="shrink-0 select-none border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80"
          style={{ width: LABEL_WIDTH, position: "relative", height: TOTAL_HEIGHT }}
        >
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 flex items-start justify-end pr-3"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              <span className="mt-[-7px] text-[11px] font-bold tabular-nums text-zinc-400 dark:text-zinc-500">
                {String(h).padStart(2, "0")}h
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="relative flex-1 cursor-pointer select-none"
          style={{ height: TOTAL_HEIGHT }}
          onClick={handleGridClick}
        >
          {/* Alternating rows */}
          {HOURS.map((h) => (
            <div
              key={h}
              className={cn(
                "pointer-events-none absolute inset-x-0",
                h % 2 === 0
                  ? "bg-white dark:bg-zinc-950"
                  : "bg-zinc-50/70 dark:bg-zinc-900/50",
              )}
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Grid lines */}
          {HOURS.map((h) => (
            <div
              key={`g-${h}`}
              className="pointer-events-none absolute inset-x-0"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              <div className="absolute inset-x-0 top-0 border-t border-zinc-200 dark:border-zinc-700/50" />
              <div
                className="absolute inset-x-0 border-t border-dashed border-zinc-150 dark:border-zinc-800"
                style={{ top: HOUR_HEIGHT / 2 }}
              />
            </div>
          ))}

          {/* Current time */}
          {currentTimeTop !== null && currentTimeTop >= 0 && currentTimeTop <= TOTAL_HEIGHT && (
            <div
              className="pointer-events-none absolute inset-x-0 z-20"
              style={{ top: currentTimeTop }}
            >
              <div className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-red-500 shadow shadow-red-300/60 ring-2 ring-white dark:ring-zinc-950" />
              <div className="absolute inset-x-0 top-0 border-t-2 border-red-500/70" />
            </div>
          )}

          {/* Blocks */}
          {blocksWithLanes.map((block) => {
            const colors = BLOCK_COLORS[block.color];
            const top = blockTop(block.start_time);
            const height = blockHeight(block.start_time, block.end_time);
            const laneW = `${100 / block.totalLanes}%`;
            const laneL = `${(block.lane / block.totalLanes) * 100}%`;
            const isMenuOpen = menuOpenId === block.id;
            const duration = formatDuration(block.start_time, block.end_time);

            return (
              <div
                key={block.id}
                data-block="true"
                className="absolute p-[3px]"
                style={{ top, height, left: laneL, width: laneW }}
              >
                <div
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-lg border-l-[4px] px-2.5 pt-1.5 pb-1.5 shadow-sm transition-all hover:shadow-md",
                    colors.bg,
                    colors.border,
                    colors.darkBg,
                    block.is_completed && "opacity-50",
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={cn(
                        "flex-1 text-xs font-bold leading-tight",
                        colors.text,
                        block.is_completed && "line-through opacity-60",
                        height < 36 && "truncate",
                      )}
                    >
                      {block.title}
                    </p>
                    <button
                      type="button"
                      data-block="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : block.id);
                      }}
                      className={cn(
                        "shrink-0 rounded px-0.5 py-px text-[10px] font-black leading-none opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100",
                        colors.text,
                      )}
                    >
                      ···
                    </button>
                  </div>

                  {/* Time + duration */}
                  {height >= 34 && (
                    <p className={cn("mt-0.5 text-[10px] font-medium tabular-nums opacity-60", colors.text)}>
                      {block.start_time.slice(0, 5)} · {duration}
                    </p>
                  )}

                  {/* Completed badge */}
                  {block.is_completed && height >= 36 && (
                    <p className={cn("mt-auto text-[10px] font-bold opacity-60", colors.text)}>
                      ✓ Concluído
                    </p>
                  )}

                  {/* Focus button */}
                  {!block.is_completed && height >= 52 && (
                    <button
                      type="button"
                      data-block="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/pomodoro?block=${encodeURIComponent(block.title)}`);
                      }}
                      className={cn(
                        "mt-auto flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-90 hover:bg-black/10",
                        colors.text,
                      )}
                    >
                      <Timer size={9} /> Iniciar foco
                    </button>
                  )}

                  {/* Context menu */}
                  {isMenuOpen && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }}
                        className="fixed inset-0 z-20"
                        aria-label="Fechar menu"
                      />
                      <div className="absolute right-0 top-6 z-30 min-w-[152px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleComplete(block); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Check size={13} />
                          {block.is_completed ? "Desmarcar" : "Concluir"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openEdit(block); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Pencil size={13} />
                          Editar
                        </button>
                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(block.id); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {blocks.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <MousePointerClick size={22} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-400">Nenhum bloco ainda</p>
                <p className="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">
                  Clique em qualquer horário para criar um bloco
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <BlockFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        date={date}
        defaultStartTime={clickTime?.start}
        defaultEndTime={clickTime?.end}
        editing={editing}
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg md:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
