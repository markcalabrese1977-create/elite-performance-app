// src/lib/exerciseResolver.ts
import { db } from "../drizzle/db";
import { exercises, exerciseAliases } from "../drizzle/db/schema";
import { eq } from "drizzle-orm";
import { toSlug } from "./utils";

export async function resolveExerciseByName(name: string) {
  const slug = toSlug(name);

  // 1. Exact name
  const exact = await db
    .select()
    .from(exercises)
    .where(eq(exercises.name, name))
    .limit(1);

  if (exact[0]) return exact[0];

  // 2. Slug match
  const bySlug = await db
    .select()
    .from(exercises)
    .where(eq(exercises.slug, slug))
    .limit(1);

  if (bySlug[0]) return bySlug[0];

  // 3. Alias match
  const alias = await db
    .select({ exerciseId: exerciseAliases.exerciseId })
    .from(exerciseAliases)
    .where(eq(exerciseAliases.alias, slug))
    .limit(1);

  if (alias[0]) {
    const exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, alias[0].exerciseId))
      .limit(1);
    return exercise[0] || null;
  }

  return null;
}