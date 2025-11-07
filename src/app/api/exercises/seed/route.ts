// src/app/api/exercises/seed/route.ts
import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, exerciseAliases } from "@/db/schema";

/** Convert any string to a clean slug */
const toSlug = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

/** COMPLETE CATALOG — ALL ALIASES INCLUDED */
const CATALOG = [
  // Chest
  { name: "Flat Barbell Bench", muscle: "chest", aliases: ["bench", "bench_barbell_flat"] },
  { name: "Incline DB Press", muscle: "chest", aliases: ["incline_db_press"] },
  { name: "Cable Fly", muscle: "chest", aliases: ["cable_fly"] },

  // Back / Lats
  { name: "Neutral-Grip Pulldown", muscle: "lats", aliases: ["pulldown_normal", "pulldown_neutral"] },
  { name: "Wide-Grip Pulldown", muscle: "lats", aliases: ["pulldown_wide"] },
  { name: "Seated Cable Row", muscle: "back", aliases: ["cable_row"] },
  { name: "DB Row (Supported)", muscle: "back", aliases: ["db_row_supported"] },

  // Shoulders
  { name: "DB Lateral Raise", muscle: "shoulders", aliases: ["lateral_raise", "incline_lateral_raise"] },
  { name: "Smith Seated Press", muscle: "shoulders", aliases: ["smith_seated_press"] },
  { name: "Rear Delt Raise (Incline)", muscle: "rear_delts", aliases: ["rear_delt_raise_inc"] },

  // Arms
  { name: "EZ-Bar Curl", muscle: "biceps", aliases: ["ez_bar_curl"] },
  { name: "Triceps Pushdown", muscle: "triceps", aliases: ["triceps_pushdown"] },

  // Legs
  { name: "Hack Squat", muscle: "legs", aliases: ["hack_squat"] },
  { name: "Leg Extension", muscle: "quads", aliases: ["leg_extension"] },
  { name: "Lying Leg Curl", muscle: "hamstrings", aliases: ["lying_leg_curl"] },
  { name: "RDL (Barbell)", muscle: "hamstrings", aliases: ["rdl", "rdl_barbell"] },
  { name: "Hip Thrust (Machine)", muscle: "glutes", aliases: ["hip_thrust_machine"] },

  // Calves
  { name: "Leg Press Calf", muscle: "calves", aliases: ["leg_press_calf"] },
  { name: "Calf (Smith Machine)", muscle: "calves", aliases: ["calf_smith", "calf_smith_machine"] },

  // Core
  { name: "Rope Crunch", muscle: "abs", aliases: ["rope_crunch"] },
] as const;

export async function GET() {
  try {
    // 1. Insert canonical exercises
    const canonicalRows = CATALOG.map((e) => ({
      name: e.name,
      slug: toSlug(e.name),
      muscleGroup: e.muscle,
    }));

    if (canonicalRows.length) {
      await db.insert(exercises).values(canonicalRows).onConflictDoNothing();
    }

    // 2. Fetch IDs
    const slugs = canonicalRows.map((r) => r.slug);
    const existing = await db
      .select({ id: exercises.id, slug: exercises.slug })
      .from(exercises)
      .where(inArray(exercises.slug, slugs));

    const slugToId = new Map(existing.map((r) => [r.slug, r.id]));

    // 3. Build ALL alias rows — NO DEDUPING
    const aliasRows: { alias: string; exerciseId: number }[] = [];

    for (const item of CATALOG) {
      const canonicalSlug = toSlug(item.name);
      const exerciseId = slugToId.get(canonicalSlug);
      if (!exerciseId) continue;

      for (const raw of item.aliases ?? []) {
        const alias = toSlug(raw);
        if (alias && alias !== canonicalSlug) {
          aliasRows.push({ alias, exerciseId });
        }
      }
    }

    // 4. Insert ALL aliases (allow duplicates in list, DB will dedupe)
    if (aliasRows.length) {
      await db.insert(exerciseAliases).values(aliasRows).onConflictDoNothing();
    }

    // 5. Log everything
    console.log("Seeded exercises:", canonicalRows.length);
    console.log("Alias rows built:", aliasRows.length);
    console.log("Unique aliases:", new Set(aliasRows.map(a => a.alias)).size);
    console.log("Aliases:", aliasRows.map(a => a.alias));

    return NextResponse.json({
      ok: true,
      inserted: {
        exercises: canonicalRows.length,
        aliases: aliasRows.length,
      },
    });
  } catch (e: any) {
      console.error("Seed error:", e);
      return NextResponse.json(
        { ok: false, error: String(e?.message ?? e) },
        { status: 500 }
      );
    }
}