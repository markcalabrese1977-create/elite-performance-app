import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sessions, sets } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  try {
    const [{ count: sessionCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions);

    const [{ count: setCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sets);

    // Your schema exposes `sessions.date`, so use that for "last session"
    const [{ last }] = await db
      .select({ last: sql<Date | null>`max(${sessions.date})` })
      .from(sessions);

    return NextResponse.json({
      ok: true,
      sessions: { count: Number(sessionCount ?? 0) },
      sets: { count: Number(setCount ?? 0) },
      lastSessionAt: last ? new Date(last) : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}