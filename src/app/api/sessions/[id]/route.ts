// src/app/api/sessions/[id]/route.ts
// GET /api/sessions/:id → returns one session and its sets (with exercise info)

import { NextResponse } from "next/server";
import { db } from "../drizzle/db";
import { sql } from "drizzle-orm";

type Ctx = { params?: { id?: string | string[] } | Promise<{ id?: string | string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  // Handle Next 16 where ctx.params may be a Promise
  const maybePromise = ctx?.params as any;
  const p = maybePromise && typeof maybePromise.then === "function" ? await maybePromise : maybePromise;

  const raw = p?.id;
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  const id = Number.parseInt(String(idStr ?? ""), 10);

  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id", debug: { raw: raw ?? null } },
      { status: 400 }
    );
  }

  // 1) Fetch the session
  const sRes = await db.execute(
    sql`
      SELECT
        id,
        user_id,
        date,
        day_index AS "index",
        fatigue_score,
        notes
      FROM sessions
      WHERE id = ${id}
      LIMIT 1
    ` as any
  );

  if (!sRes.rows?.length) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // 2) Fetch sets joined to exercises
  const setsRes = await db.execute(
    sql`
      SELECT
        s.id,
        s.session_id,
        s.exercise_id,
        s.set_index,
        s.reps,
        s.rir,
        s.tempo,
        s.notes,
        e.name AS exercise_name,
        e.slug AS exercise_slug
      FROM sets s
      LEFT JOIN exercises e ON e.id = s.exercise_id
      WHERE s.session_id = ${id}
      ORDER BY s.set_index ASC
    ` as any
  );

  return NextResponse.json({
    ok: true,
    session: sRes.rows[0],
    sets: setsRes.rows ?? [],
  });
}