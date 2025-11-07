import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sessions } from "@/db/schema";

export async function POST() {
  const db = getDb();

  // tweak as you like
  const seed = [
    { userId: 1, date: new Date(), dayIndex: 1, fatigueScore: 3, notes: "Leg day" },
    { userId: 1, date: new Date(Date.now() - 86400_000), dayIndex: 2, fatigueScore: 5, notes: "Bench + accessories" },
    { userId: 1, date: new Date(Date.now() - 2 * 86400_000), dayIndex: 3, fatigueScore: 2, notes: "Pull + arms" },
  ];

  await db
    .insert(sessions)
    .values(seed as any)
    // ok to ignore duplicates on reruns for now
    .catch(() => {});

  const rows = await db.select().from(sessions);
  return NextResponse.json({ ok: true, count: rows.length, sessions: rows });
}

// convenience so you can hit it in the browser too
export const GET = POST;