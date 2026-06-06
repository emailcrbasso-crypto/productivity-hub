import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Block = {
  id: string;
  title: string;
  description: string | null;
  block_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;
  is_completed: boolean;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Horário local (UTC-3) -> timestamp UTC no formato iCalendar. */
function toICSDate(date: string, time: string): string {
  const d = new Date(`${date}T${time}-03:00`);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!UUID_RE.test(token)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("calendar_blocks_by_token", {
    p_token: token,
  });

  if (error) {
    return new NextResponse("Internal error", { status: 500 });
  }

  const blocks = (data ?? []) as Block[];
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hub de Produtividade//Time Boxing//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "NAME:Hub · Time Boxing",
    "X-WR-CALNAME:Hub · Time Boxing",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const b of blocks) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${b.id}@hub-produtividade.crbasso.com`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${toICSDate(b.block_date, b.start_time)}`);
    lines.push(`DTEND:${toICSDate(b.block_date, b.end_time)}`);
    lines.push(`SUMMARY:${escapeICS((b.is_completed ? "✓ " : "") + b.title)}`);
    if (b.description) lines.push(`DESCRIPTION:${escapeICS(b.description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="hub-timeboxing.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
