// src/programs/builders/applyProgram.ts
// Applies a ProgramTemplate: creates sessions + sets.
// Robust to schema drift: detects set_index vs "index", optional tempo/notes, and casts text.

import { db } from "@/db";
import { sql, inArray } from "drizzle-orm";
import { exercises } from "@/db/schema";
import type {
  ProgramTemplate,
  ProgramWeek,
  ProgramSession,
  ProgramSet,
} from "../types";

/* ---------------- helpers ---------------- */

const esc = (s: string) => String(s).replace(/'/g, "''");

const toUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
const toUTCDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return toUTC(new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)));
};
const addDaysUTC = (base: Date, days: number) =>
  toUTC(new Date(base.getTime() + days * 24 * 60 * 60 * 1000));
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

function materializeSessions(t: ProgramTemplate): ProgramSession[] {
  if (Array.isArray((t as any).weeks) && (t as any).weeks.length) {
    const out: ProgramSession[] = [];
    for (const wk of (t.weeks as ProgramWeek[]) ?? []) {
      for (const s of wk.sessions ?? []) out.push(s);
    }
    return out;
  }
  if (Array.isArray((t as any).days) && (t as any).days.length) {
    return (t as any).days as ProgramSession[];
  }
  return [];
}

function collectCodes(sessions: ProgramSession[]): string[] {
  const set = new Set<string>();
  for (const s of sessions) for (const st of s.sets ?? []) {
    const c = (st as ProgramSet).exerciseCode ?? "";
    if (c) set.add(c);
  }
  return [...set];
}

// quick information_schema probe
async function hasColumn(table: string, column: string): Promise<boolean> {
  const q = sql.raw(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = '${esc(table)}' AND column_name = '${esc(column)}'
     LIMIT 1`
  ) as any;
  const res = await db.execute(q);
  return Boolean((res as any).rows?.length);
}

/* ---------------- types ---------------- */

type ApplyArgs = {
  template: ProgramTemplate;
  userId: number;
  startDate: string; // YYYY-MM-DD
};

type ApplyResult = {
  ok: true;
  created: Array<{ id: number; date: string; index: number | null }>;
  skippedCodes: string[];
};

/* ---------------- main ---------------- */

export async function applyProgram(args: ApplyArgs): Promise<ApplyResult> {
  const { template, userId } = args;
  const start = toUTCDate(args.startDate);

  const sessions = materializeSessions(template);
  const created: Array<{ id: number; date: string; index: number | null }> = [];
  const skippedCodesSet = new Set<string>();

  if (!sessions.length) return { ok: true, created, skippedCodes: [] };

  // map exercise slug -> id
  const allCodes = collectCodes(sessions);
  const codeToId = new Map<string, number>();
  if (allCodes.length) {
    const rows: Array<{ id: number; slug: string }> = await db
      .select({ id: exercises.id, slug: exercises.slug })
      .from(exercises)
      .where(inArray(exercises.slug, allCodes as readonly string[]));
    for (const r of rows) codeToId.set(r.slug, r.id);
  }

  // detect sets schema once (fast)
  const hasSetIndex = await hasColumn("sets", "set_index");
  const hasLegacyIndex = hasSetIndex ? false : await hasColumn("sets", "index");
  const indexCol = hasSetIndex ? "set_index" : hasLegacyIndex ? `"index"` : "set_index";

  const hasTempo = await hasColumn("sets", "tempo");
  const hasNotes = await hasColumn("sets", "notes");

  // walk days
  let dayCursor = 0;

  for (const session of sessions) {
    const sessionDate = addDaysUTC(start, dayCursor);
    const sessionDateISO = toISODate(sessionDate);

    const safeNotes = esc(session?.notes ?? template.name ?? "");

    // insert session
    const ins = await db.execute(
      sql.raw(
        `INSERT INTO sessions (user_id, date, day_index, fatigue_score, notes)
         VALUES (${userId}, '${sessionDateISO}',
           ${typeof session?.index === "number" ? session.index : "NULL"},
           ${typeof session?.fatigueScore === "number" ? session.fatigueScore : "NULL"},
           '${safeNotes}')
         RETURNING id`
      ) as any
    );
    const sessionId = Number((ins as any).rows[0].id);

    created.push({
      id: sessionId,
      date: sessionDateISO,
      index: typeof session?.index === "number" ? session.index : null,
    });

    // insert sets
    for (const set of session.sets ?? []) {
      const code = set?.exerciseCode ?? "";
      const exId = codeToId.get(code);
      if (!exId) { if (code) skippedCodesSet.add(code); continue; }

      const setIndex = Number(set?.setIndex ?? 1);
      const reps = Number(set?.reps ?? 0);
      const rir = Number(set?.rir ?? 0);
      const tempoLit = set?.tempo ? `'${esc(set.tempo)}'::text` : "NULL::text";
      const notesLit = `'${esc(set?.notes ?? "")}'::text`;

      // build column/value lists based on detected schema
      const cols = [`session_id`, `exercise_id`, indexCol, `reps`, `rir`];
      const vals = [`${sessionId}`, `${exId}`, `${setIndex}`, `${reps}`, `${rir}`];

      if (hasTempo) { cols.push(`tempo`); vals.push(tempoLit); }
      if (hasNotes) { cols.push(`notes`); vals.push(notesLit); }

      await db.execute(
        sql.raw(
          `INSERT INTO sets (${cols.join(", ")})
           VALUES (${vals.join(", ")})`
        ) as any
      );
    }

    dayCursor += 1;
  }

  return { ok: true, created, skippedCodes: [...skippedCodesSet] };
}