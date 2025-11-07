import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";

import { getDb } from "@/db/client";
import { exercises, sessions, sets } from "@/db/schema";

const MS_IN_DAY = 86_400_000;

const DEFAULT_RANGE_DAYS = 30;
const DEFAULT_COMPARE_DAYS = 7;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = request.nextUrl;

  const toDate = new Date();
  const rangeDays = parsePositiveInt(searchParams.get("rangeDays"), DEFAULT_RANGE_DAYS);
  const compareDays = parsePositiveInt(searchParams.get("compareDays"), DEFAULT_COMPARE_DAYS);

  const fromDate = new Date(toDate.getTime() - rangeDays * MS_IN_DAY);
  const compareFromDate = new Date(toDate.getTime() - compareDays * MS_IN_DAY);

  const userId = parsePositiveInt(searchParams.get("userId"), 1);
  const exerciseIdParam = searchParams.get("exerciseId");
  const parsedExerciseId = exerciseIdParam !== null ? Number.parseInt(exerciseIdParam, 10) : NaN;
  const hasExerciseFilter = Number.isFinite(parsedExerciseId);

  const conditions = [
    eq(sessions.userId, userId),
    gte(sessions.date, fromDate),
    lte(sessions.date, toDate),
  ];

  if (hasExerciseFilter) {
    conditions.push(eq(sets.exerciseId, parsedExerciseId));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const rows = await db
    .select({
      sessionId: sessions.id,
      sessionDate: sessions.date,
      fatigueScore: sessions.fatigueScore,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      load: sets.load,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(sessions, eq(sets.sessionId, sessions.id))
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(whereClause);

  const metricsMap = new Map<
    number,
    {
      exerciseId: number;
      exerciseName: string;
      totalVolume: number;
      compareVolume: number;
      totalSets: number;
      fatigueScoreSum: number;
      fatigueSessionsSeen: Set<number>;
      fatigueCount: number;
      sessionEstimates: Map<number, { date: Date; value: number }>;
    }
  >();

  for (const row of rows) {
    const {
      exerciseId: rowExerciseId,
      exerciseName,
      sessionId,
      sessionDate,
      load,
      reps,
      fatigueScore,
    } = row;

    const current = metricsMap.get(rowExerciseId) ?? {
      exerciseId: rowExerciseId,
      exerciseName,
      totalVolume: 0,
      compareVolume: 0,
      totalSets: 0,
      fatigueScoreSum: 0,
      fatigueSessionsSeen: new Set<number>(),
      fatigueCount: 0,
      sessionEstimates: new Map<number, { date: Date; value: number }>(),
    };

    // Treat missing load/reps as 0 so volume math is safe.
// (If you’d rather skip incomplete sets, tell me and I’ll switch this to a guard.)
const volume = (load ?? 0) * (reps ?? 0);
    current.totalVolume += volume;
    if (sessionDate >= compareFromDate) {
      current.compareVolume += volume;
    }
    current.totalSets += 1;

    if (typeof fatigueScore === "number" && !current.fatigueSessionsSeen.has(sessionId)) {
      current.fatigueSessionsSeen.add(sessionId);
      current.fatigueScoreSum += fatigueScore;
      current.fatigueCount += 1;
    }

    const estimate = (load ?? 0) * (1 + (reps ?? 0) / 30);
    const existingEstimate = current.sessionEstimates.get(sessionId);
    if (!existingEstimate || estimate > existingEstimate.value) {
      current.sessionEstimates.set(sessionId, { date: sessionDate, value: estimate });
    }

    metricsMap.set(rowExerciseId, current);
  }

  const metrics = Array.from(metricsMap.values()).map((entry) => {
    const sessionEstimates = Array.from(entry.sessionEstimates.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    const latestEstimate = sessionEstimates[0];
    const previousEstimate = sessionEstimates[1];

    const latest =
      latestEstimate != null
        ? { value: round(latestEstimate.value, 1), recordedAt: latestEstimate.date.toISOString() }
        : null;

    const previous =
      previousEstimate != null
        ? {
            value: round(previousEstimate.value, 1),
            recordedAt: previousEstimate.date.toISOString(),
            change: latestEstimate ? round(latestEstimate.value - previousEstimate.value, 1) : null,
          }
        : null;

    return {
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      setsPerformed: entry.totalSets,
      totalVolume: {
        range: round(entry.totalVolume, 1),
        recent: round(entry.compareVolume, 1),
      },
      estimated1RM: {
        latest,
        previous,
      },
      averageFatigueScore:
        entry.fatigueCount > 0 ? round(entry.fatigueScoreSum / entry.fatigueCount, 2) : null,
    };
  });

  return NextResponse.json({
    ok: true,
    range: {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      compareFrom: compareFromDate.toISOString(),
      days: rangeDays,
      compareDays,
    },
    filters: {
      userId,
      exerciseId: hasExerciseFilter ? parsedExerciseId : null,
    },
    metrics,
  });
}
