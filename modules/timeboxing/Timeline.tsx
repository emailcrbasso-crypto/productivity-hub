"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Plus, ChevronLeft, ChevronRight, Check, Pencil, Trash2 } from "lucide-react";
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
const LABEL_WIDTH = 48; // px

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
  const timelineRef = useRef<HTMLDivElement>(null);
  const today = todayISO();

  // Current time indicator
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

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Scroll to current time on mount
  useEffect(() => {
    if (date !== today || !timelineRef.current || !currentMinutes) return;
    const top = (currentMinutes - START_HOUR * 60) * PIXELS_PER_MINUTE;
    timelineRef.current.scrollTop = Math.max(0, top - 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function navigateDate(delta: number) {
    const newDate = offsetDate(date, delta);
    setDate(newDate);
    const fetched = await getBlocksForDate(newDate);
    setBlocks(fetched);
  }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-block]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
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

  function openCreate() {
    setEditing(null);
    setClickTime(null);
    setDialogOpen(true);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    // Refresh blocks after create/edit
    startTransition(async () => {
      const fetched = await getBlocksForDate(date);
      setBlocks(fetched);
    });
  }

  function handleToggleComplete(block: TimeboxBlock) {
    const next = !block.is_completed;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, is_completed: next, completed_at: next ? new Date().toISOString() : null } : b,
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
    startTransition(async () => {
      await deleteBlock(id);
    });
  }

  const blocksWithLanes: BlockWithLane[] = assignLanes(blocks);

  const totalBlocks = blocks.length;
  const completedCount = blocks.filter((b) => b.is_completed).length;
  const totalPlannedMins = blocks.reduce(
    (acc, b) => acc + timeToMinutes(b.end_time) - timeToMinutes(b.start_time),
    0,
  );
  const completedMins = blocks
    .filter((b) => b.is_completed)
    .reduce((acc, b) => acc + timeToMinutes(b.end_time) - timeToMinutes(b.start_time), 0);

  const currentTimeTop =
    date === today && currentMinutes !== null
      ? (currentMinutes - START_HOUR * 60) * PIXELS_PER_MINUTE
      : null;

  return (
    <div className="space-y-4">
      {/* Date nav + create */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[5rem] text-center text-sm font-semibold text-zinc-900 dark:text-white">
            {formatDateLabel(date)}
            {date !== today && (
              <span className="ml-1.5 text-[11px] font-normal text-zinc-400">
                {date.slice(8)}/{date.slice(5, 7)}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => navigateDate(1)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> Novo bloco
        </Button>
      </div>

      {/* Summary bar */}
      {totalBlocks > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-zinc-500">
            {totalBlocks} {totalBlocks === 1 ? "bloco" : "blocos"}
          </span>
          <span className="text-zinc-500">
            {Math.floor(totalPlannedMins / 60)}h {totalPlannedMins % 60}min planejados
          </span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {completedCount}/{totalBlocks} concluídos
          </span>
          {completedMins > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {Math.floor(completedMins / 60)}h {completedMins % 60}min focados
            </span>
          )}
        </div>
      )}

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="overflow-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        style={{ maxHeight: "70vh" }}
      >
        <div
          className="relative cursor-pointer select-none"
          style={{ height: `${TOTAL_HEIGHT}px`, paddingLeft: `${LABEL_WIDTH}px` }}
          onClick={handleTimelineClick}
        >
          {/* Hour grid lines + labels */}
          {HOURS.map((h) => {
            const top = (h - START_HOUR) * HOUR_HEIGHT;
            return (
              <div key={h} className="pointer-events-none absolute left-0 right-0" style={{ top }}>
                <span
                  className="absolute right-0 top-0 pr-2 pt-0.5 text-right text-[10px] leading-none text-zinc-400 dark:text-zinc-600"
                  style={{ width: `${LABEL_WIDTH}px`, transform: "translateX(-100%)", marginLeft: `-${LABEL_WIDTH}px`, right: "auto", left: 0 }}
                >
                  {String(h).padStart(2, "0")}:00
                </span>
                <div className="absolute inset-x-0 top-0 border-t border-zinc-100 dark:border-zinc-800" />
                {/* Half-hour line */}
                <div
                  className="absolute inset-x-0 border-t border-dashed border-zinc-50 dark:border-zinc-900"
                  style={{ top: HOUR_HEIGHT / 2 }}
                />
              </div>
            );
          })}

          {/* Current time indicator */}
          {currentTimeTop !== null &&
            currentTimeTop >= 0 &&
            currentTimeTop <= TOTAL_HEIGHT && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-20"
                style={{ top: currentTimeTop }}
              >
                <div
                  className="absolute h-2.5 w-2.5 rounded-full bg-red-500"
                  style={{ left: `${LABEL_WIDTH - 6}px`, top: "-5px" }}
                />
                <div
                  className="absolute right-0 border-t-2 border-red-400"
                  style={{ left: `${LABEL_WIDTH}px` }}
                />
              </div>
            )}

          {/* Blocks */}
          {blocksWithLanes.map((block) => {
            const colors = BLOCK_COLORS[block.color];
            const top = blockTop(block.start_time);
            const height = blockHeight(block.start_time, block.end_time);
            const laneWidth = `${100 / block.totalLanes}%`;
            const laneLeft = `${(block.lane / block.totalLanes) * 100}%`;
            const isMenuOpen = menuOpenId === block.id;
            const duration = formatDuration(block.start_time, block.end_time);
            const startStr = block.start_time.slice(0, 5);

            return (
              <div
                key={block.id}
                data-block="true"
                className="absolute p-0.5"
                style={{ top, height, left: laneLeft, width: laneWidth }}
              >
                <div
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-md border px-2 py-1 transition-opacity",
                    colors.bg,
                    colors.border,
                    colors.darkBg,
                    block.is_completed && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={cn(
                        "flex-1 truncate text-xs font-semibold leading-tight",
                        colors.text,
                        block.is_completed && "line-through",
                      )}
                    >
                      {block.title}
                    </p>
                    {/* Context menu button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : block.id);
                      }}
                      className={cn(
                        "shrink-0 rounded p-0.5 text-[10px] font-bold leading-none transition-colors hover:bg-black/10",
                        colors.text,
                      )}
                    >
                      •••
                    </button>
                  </div>
                  {height >= 32 && (
                    <p className={cn("mt-0.5 text-[10px] opacity-70", colors.text)}>
                      {startStr} · {duration}
                    </p>
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
                      <div className="absolute right-0 top-6 z-30 min-w-[140px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
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
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-medium text-zinc-400">Nenhum bloco planejado</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-600">
                Clique na linha do tempo ou em "Novo bloco" para começar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Block form dialog */}
      <BlockFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        date={date}
        defaultStartTime={clickTime?.start}
        defaultEndTime={clickTime?.end}
        editing={editing}
      />

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
