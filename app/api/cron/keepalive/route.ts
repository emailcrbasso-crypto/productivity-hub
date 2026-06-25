import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Usa anon key — achievements é tabela pública (sem dados sensíveis)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { count, error } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const at = new Date().toISOString();
    console.log(`[keepalive] ${at} — Supabase ativo, achievements: ${count}`);

    return NextResponse.json({ ok: true, at, achievements: count });
  } catch (err) {
    console.error("[keepalive] erro:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
