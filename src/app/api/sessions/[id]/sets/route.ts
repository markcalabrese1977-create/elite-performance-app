// src/app/api/sessions/[id]/sets/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sets } from "@/db/schema";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = Number(params.id);

    // ← ADD THIS CHECK
    if (!sessionId || isNaN(sessionId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { exerciseId, load, reps, rir, setIndex } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { ok: false, error: "exerciseId is required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(sets)
      .values({
        sessionId,
        exerciseId,
        setIndex: setIndex || 1,
        load: load ?? null,
        reps: reps ?? null,
        rir: rir ?? null,
      })
      .returning();

    return NextResponse.json(
      { ok: true, set: result[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SET INSERT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}