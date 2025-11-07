/**
 * ⚙️ REFRACTOR PLAN — NOV 2025
 * --------------------------------------------------------------------------
 * This route will be deprecated once we migrate to the nested REST structure:
 *    /api/sessions/[id]/sets/[setId]/route.ts
 *
 * ✅ KEEP this file active until:
 *    1. Add/Edit/Delete sets all function cleanly in the Session Detail view.
 *    2. Frontend fetch calls are updated to:
 *       `/api/sessions/${sessionId}/sets/${setId}`
 *    3. The Zod validation schema (setUpdateSchema) is added.
 *
 * 🔄 Once migrated, remove this file and verify the new session-scoped
 *    version works with PUT + DELETE using validated payloads.
 */

// src/app/api/sets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { sets } from "@/db/schema";
import { eq } from "drizzle-orm";

// Update a set
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const setId = Number(id);
    if (!Number.isFinite(setId)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;

    const allowed = [
      "exerciseId",
      "sessionId",
      "setIndex",
      "load",
      "reps",
      "rir",
      "tempo",
      "notes",
      "isTestSet",
    ] as const;

    const patch: any = {};
    for (const k of allowed) if (k in body) patch[k] = body[k];

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "No updatable fields" }, { status: 400 });
    }

    const db = getDb();
    const res = await db
      .update(sets as any)
      .set(patch)
      .where(eq((sets as any).id, setId))
      .returning();

    const updated = Array.isArray(res) ? res[0] : (res as any)?.rows?.[0];
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, set: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

// Delete a set
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const setId = Number(id);
    if (!Number.isFinite(setId)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const db = getDb();
    const res = await db.delete(sets as any).where(eq((sets as any).id, setId));

    const deleted = (res as any)?.rowCount ?? 0;
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}