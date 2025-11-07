// src/lib/exerciseResolver.ts
import { getDb } from "@/db/client";
import { exercises, exerciseAliases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toSlug } from "./utils";

type ExerciseRow = typeof exercises.$inferSelect;

/**
 * Resolve an exercise by human-facing name.
 * Order of checks:
 * 1) Exact name match
 * 2) Slug match (normalized)
 * 3) Alias match (alias is stored as slug) -> get exerciseId
 */
export async function resolveExerciseByName(name: string): Promise<ExerciseRow | null> {
  const db = getDb();
  const slug = toSlug(name);

  // 1) Exact name
  {
    const rows = await db.select().from(exercises).where(eq(exercises.name, name)).limit(1);
    if (rows.length) return rows[0];
  }

  // 2) Slug match
  {
    const rows = await db.select().from(exercises).where(eq(exercises.slug, slug)).limit(1);
    if (rows.length) return rows[0];
  }

  // 3) Alias -> exerciseId, then load exercise
  {
    const alias = await db
      .select({ exerciseId: exerciseAliases.exerciseId })
      .from(exerciseAliases)
      .where(eq(exerciseAliases.alias, slug))
      .limit(1);

    if (alias.length) {
      const rows = await db.select().from(exercises).where(eq(exercises.id, alias[0].exerciseId)).limit(1);
      if (rows.length) return rows[0];
    }
  }

  return null;
}

/** Convenience: just the ID (or null if not found). */
export async function resolveExerciseIdByName(name: string): Promise<number | null> {
  const row = await resolveExerciseByName(name);
  return row ? row.id : null;
}