// src/app/api/exercises/seed/route.ts
// Seeds exercise aliases idempotently (works with Neon HTTP driver).
// - Resolves canonical slugs -> exercise ids
// - Inserts only ("alias","exercise_id") with ON CONFLICT DO NOTHING
// - Avoids transactions and RETURNING (Neon HTTP quirks)

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql, inArray } from "drizzle-orm";
import { exercises } from "@/db/schema";

type Row = { id: number; slug: string };

// Map UI/colloquial names -> canonical slugs in `exercises.slug`
const ALIAS_TO_CANONICAL: Record<string, string> = {
  bench: "bench_barbell_flat",
  bench_barbell_flat: "bench_barbell_flat",
  pulldown_normal: "pulldown_normal",
  pulldown_neutral: "pulldown_neutral",
  pulldown_wide: "pulldown_wide",
  // If your canonical is named differently, adjust here:
  cable_row: "seated_cable_row",
  lateral_raise: "lateral_raise",
  incline_lateral_raise: "incline_lateral_raise",
  rear_delt_raise_inc: "rear_delt_raise_inc",
  // If your canonical is "rdl_barbell", keep; otherwise change here:
  rdl: "rdl_barbell",
  calf_smith: "calf_smith",
};

export async function GET() {
  try {
    // 1) Resolve canonical slugs -> exercise ids
    const canonicalSlugs = Array.from(new Set(Object.values(ALIAS_TO_CANONICAL)));
    const rows: Row[] =
      canonicalSlugs.length > 0
        ? await db
            .select({ id: exercises.id, slug: exercises.slug })
            .from(exercises)
            .where(inArray(exercises.slug, canonicalSlugs as readonly string[]))
        : [];

    const slugToId = new Map(rows.map((r) => [r.slug, r.id]));

    // 2) Build alias -> exercise_id pairs (skip any missing canonicals)
    const aliasPairs: Array<[string, number]> = [];
    for (const [alias, canonical] of Object.entries(ALIAS_TO_CANONICAL)) {
      const exId = slugToId.get(canonical);
      if (exId) aliasPairs.push([alias, exId]);
    }

    if (aliasPairs.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: { exercises: rows.length, aliases_attempted: 0 },
        note: "No matching canonical slugs in DB; nothing to insert.",
      });
    }

    // 3) Insert one row at a time with ON CONFLICT DO NOTHING (no transaction)
    //    This avoids Neon HTTP's lack of transaction support and RETURNING quirks.
    let attempted = 0;
    for (const [alias, exId] of aliasPairs) {
      attempted += 1;
      // Parameterized, driver-safe insert; no RETURNING, no select-before/after.
      await db.execute(
        sql`INSERT INTO exercise_aliases ("alias","exercise_id")
            VALUES (${alias}, ${exId})
            ON CONFLICT ("alias") DO NOTHING;` as any
      );
    }

    return NextResponse.json({
      ok: true,
      inserted: { exercises: rows.length, aliases_attempted: attempted },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err), stack: err?.stack },
      { status: 500 }
    );
  }
}