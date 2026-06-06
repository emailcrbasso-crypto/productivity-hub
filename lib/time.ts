// Fuso da aplicação: Brasil (America/Sao_Paulo), UTC-3 fixo
// (sem horário de verão desde 2019).
//
// Centraliza a noção de "dia local" para que streaks, contadores de
// "hoje" e relatórios usem a MESMA fronteira de dia — meia-noite local,
// não meia-noite UTC (que cairia às 21h no Brasil).

export const APP_TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Chave do dia local (YYYY-MM-DD) no fuso da aplicação. */
export function localDayKey(d: Date = new Date()): string {
  return new Date(d.getTime() - APP_TZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** Instante UTC correspondente à meia-noite local do dia que contém `d`. */
export function startOfLocalDayUTC(d: Date = new Date()): Date {
  return new Date(`${localDayKey(d)}T00:00:00-03:00`);
}

/** Instante UTC da meia-noite local de N dias atrás (N=0 → hoje). */
export function startOfLocalDayDaysAgoUTC(days: number, from: Date = new Date()): Date {
  const start = startOfLocalDayUTC(from);
  start.setUTCDate(start.getUTCDate() - days);
  return start;
}
