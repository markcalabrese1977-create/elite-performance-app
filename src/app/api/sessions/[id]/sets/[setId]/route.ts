import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sets } from "@/db/schema";

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

    // Minimal required fields
    if (!payload.exerciseId) {
      return NextResponse.json({ ok: false, error: "exerciseId is required" }, { status: 400 });
    }
    if (payload.setIndex == null) payload.setIndex = 1;

    const db = getDb();

    // Neon HTTP returns either T[] or { rows: T[] }, so normalize:
    const res = await db.insert(sets as any).values(payload).returning();
    const created = Array.isArray(res) ? res[0] : (res as any)?.rows?.[0];

    return NextResponse.json({ ok: true, set: created ?? payload }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}