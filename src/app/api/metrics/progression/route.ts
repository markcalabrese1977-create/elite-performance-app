import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sets } from '../drizzle/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET() {
  // 1RM = weight × reps × 0.0333 + weight   (Epley formula)
  const raw = await db
    .select({
      exerciseId: sets.exerciseId,
      createdAt: sets.createdAt,   // <-- this column **does** exist
      oneRM: sql<number>`max(${sets.weight} * ${sets.reps} * 0.0333 + ${sets.weight})`,
    })
    .from(sets)
    .groupBy(sets.exerciseId, sets.createdAt)
    .orderBy(desc(sets.createdAt));

  return NextResponse.json(raw);
}