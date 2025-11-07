// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sessions, sets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        date: sessions.date,
        dayIndex: sessions.dayIndex,
        fatigueScore: sessions.fatigueScore,
        notes: sessions.notes,
        setsCount: sql<number>`count(${sets.id})`,
      })
      .from(sessions)
      .leftJoin(sets, eq(sets.sessionId, sessions.id))
      .groupBy(
        sessions.id,
        sessions.userId,
        sessions.date,
        sessions.dayIndex,
        sessions.fatigueScore,
        sessions.notes
      )
      .orderBy(sessions.date);

    return NextResponse.json({ ok: true, sessions: rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to load sessions" }, { status: 500 });
  }
}