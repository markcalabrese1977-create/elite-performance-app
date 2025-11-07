import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sets } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { id: string };

// Create a new set for a given session
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<Params> } // Next 16: params is a Promise
) {
  try {
    const { id } = await ctx.params;
    const sessionId = Number(id);
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ ok: false, error: "Invalid session id" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;

    // Whitelist fields that are safe to insert/update
    const allowed = [
      "exerciseId",
      "setIndex",
      "load",
      "reps",
      "rir",
      "tempo",
      "notes",
      "isTestSet",
    ] as const;

    const payload: any = { sessionId };
    for (const k of allowed) if (k in body) payload[k] = body[k];

    // Basic sanity defaults
    if (payload.setIndex == null) payload.setIndex = 1;
    if (payload.load === undefined) payload.load = null;
    if (payload.reps === undefined) payload.reps = null;
    if (payload.rir === undefined) payload.rir = null;
    if (payload.tempo === undefined) payload.tempo = null;
    if (payload.notes === undefined) payload.notes = null;
    if (payload.isTestSet === undefined) payload.isTestSet = false;

    // Minimal required fields
    if (!payload.exerciseId) {
      return NextResponse.json({ ok: false, error: "exerciseId is required" }, { status: 400 });
    }

    const db = getDb();
    const res = await db.insert(sets as any).values(payload).returning();
const created = Array.isArray(res) ? res[0] : (res as any)?.rows?.[0];

    return NextResponse.json({ ok: true, set: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}