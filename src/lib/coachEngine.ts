import { db } from '@/lib/db';
import {
  exerciseSession,
  rec,
} from '@/drizzle/schema';
import { and, eq, gte } from 'drizzle-orm';
import { subDays } from 'date-fns';

interface Advice {
  recommendation: string;
  reason: string;
}

export async function getCoachAdvice(userId: string): Promise<Advice> {
  const weekAgo = subDays(new Date(), 7);

  // 1. Pull recent ExerciseSession rows (they have .goal)
  const recent = await db
    .select({
      goal: exerciseSession.goal,          // <-- column exists
      createdAt: exerciseSession.createdAt,
    })
    .from(exerciseSession)
    .where(
      and(
        eq(exerciseSession.userId, userId),
        gte(exerciseSession.createdAt, weekAgo)
      )
    );

  // 2. Pull latest Rec row (has .rationale)
  const latestRec = await db
    .select({
      rationale: rec.rationale,            // <-- column exists
    })
    .from(rec)
    .where(eq(rec.userId, userId))
    .orderBy(rec.createdAt, 'desc')
    .limit(1);

  // ---- simple logic (expand as you wish) ----
  if (recent.length === 0) {
    return {
      recommendation: 'Start a new session',
      reason: 'No activity in the last 7 days',
    };
  }

  const lastGoal = recent[0].goal;
  const rationale = latestRec[0]?.rationale ?? 'No rationale yet';

  return {
    recommendation: `Aim for ${lastGoal} reps next time`,
    reason: rationale,
  };
}