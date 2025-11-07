// src/programs/builders/applyProgram.ts
import { db } from "@/db";
import { sessions, sets } from "@/db/schema";
import type { ProgramTemplate } from "@/programs/types";
import { resolveExerciseIdByName } from "@/lib/exerciseResolver";

/** args for applying a template for a user starting on a given date */
type ApplyArgs = {
  template: ProgramTemplate;
  userId: number;
  startDate: string; // "YYYY-MM-DD"
};

type CreatedSession = { id: number; date: string; index: number };

/** add N days (no TZ math) */
function addDays(d: Date, n: number) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

/** format YYYY-MM-DD */
function toISODateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Apply a ProgramTemplate:
 *  - normalizes layout (weeks/sessions or flat days)
 *  - resolves exercise codes -> exercise IDs (name/slug/alias)
 *  - creates sessions (one per day) starting at startDate
 *  - bulk inserts sets for each session
 */
export async function applyProgram({
  template,
  userId,
  startDate,
}: ApplyArgs): Promise<{ sessions: CreatedSession[]; insertedSets: number }> {
  // 0) Normalize layout so we always iterate `weeks`
  const weeks =
    Array.isArray(template.weeks) && template.weeks.length
      ? template.weeks
      : Array.isArray(template.days) && template.days.length
        ? [{ sessions: template.days }]
        : [];

  if (!weeks.length) {
    return { sessions: [], insertedSets: 0 };
  }

  // 1) Gather all unique exercise codes present in the template
  const codeSet = new Set<string>();
  for (const wk of weeks) {
    for (const session of wk.sessions ?? []) {
      for (const s of session.sets ?? []) {
        if (s?.exerciseCode) codeSet.add(s.exerciseCode);
      }
    }
  }
  const allCodes = Array.from(codeSet);

  // 2) Resolve codes -> exerciseId (name/slug/alias) via shared resolver
  const codeToId = new Map<string, number>();
  for (const code of allCodes) {
    const id = await resolveExerciseIdByName(code);
    if (id != null) codeToId.set(code, id);
  }
  const missing = allCodes.filter((c) => !codeToId.has(c));
  if (missing.length) {
    throw new Error(
      `Missing exercise(s) in DB: ${missing.join(", ")}. Seed or add aliases before applying.`
    );
  }

  // 3) Create sessions in date order (sequential days from startDate)
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid startDate: ${startDate}`);
  }

  const createdSessions: CreatedSession[] = [];
  let sessionIndex = 0;
  let cursor = new Date(start);

  for (const wk of weeks) {
    for (const sessionSpec of wk.sessions ?? []) {
      sessionIndex += 1;

      // Insert a session row
      const inserted = (await db
        .insert(sessions)
        .values({
          userId,
          date: cursor,
          dayIndex: sessionIndex,
          fatigueScore: null,
          notes: template.name,
        })
        .returning({ id: sessions.id })) as any;

      const newId: number =
        Array.isArray(inserted) ? inserted[0]?.id : inserted?.rows?.[0]?.id;

      if (!newId) {
        throw new Error("Failed to create session");
      }

      createdSessions.push({
        id: newId,
        date: toISODateOnly(cursor),
        index: sessionIndex,
      });

      // Advance to next day for the next session
      cursor = addDays(cursor, 1);
    }
  }

  // 4) Bulk insert sets for each created session (preserve template order)
  let totalInserted = 0;

  // We will re-iterate the normalized layout but walk it in parallel with createdSessions
  let iSession = 0;
  for (const wk of weeks) {
    for (const sessionSpec of wk.sessions ?? []) {
      const sessionRow = createdSessions[iSession++];
      if (!sessionRow) continue;

      const rows: typeof sets.$inferInsert[] = [];

      let setIndex = 0;
      for (const s of sessionSpec.sets ?? []) {
        if (!s?.exerciseCode) continue;

        const exerciseId = codeToId.get(s.exerciseCode)!; // guaranteed by earlier check
        setIndex += 1;

        rows.push({
          sessionId: sessionRow.id,
          exerciseId,
          setIndex,
          load: null,
          reps: s.reps ?? null,
          rir: s.rir ?? null,
          tempo: s.tempo ?? null,
          isTestSet: s.isTestSet ?? null,
        });
      }

      if (rows.length) {
        // Insert in chunks to be safe
        const CHUNK = 100;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const slice = rows.slice(i, i + CHUNK);
          await db.insert(sets).values(slice);
          totalInserted += slice.length;
        }
      }
    }
  }

  return { sessions: createdSessions, insertedSets: totalInserted };
}