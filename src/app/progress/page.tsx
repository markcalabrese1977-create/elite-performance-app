// src/app/progress/page.tsx
import { db } from '../lib/db';
import { sets, exercises } from '../drizzle/schema';
import { desc, sql } from 'drizzle-orm';
import { subDays } from 'date-fns';
import ProgressCharts from './ProgressCharts';

export default async function ProgressPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const fiftySixDaysAgo = subDays(new Date(), 56);

  // Convert to ISO string for Postgres
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
  const fiftySixDaysAgoStr = fiftySixDaysAgo.toISOString();

  const oneRMData = await db
    .select({
      date: sql<string>`date(${sets.createdAt})`,
      exercise: exercises.name,
      oneRM: sql<number>`max(${sets.weight} * (1 + ${sets.reps} / 30))`,
    })
    .from(sets)
    .innerJoin(exercises, sql`${sets.exerciseId} = ${exercises.id}`)
    .where(sql`${sets.createdAt} >= ${thirtyDaysAgoStr}`)
    .groupBy(sql`date(${sets.createdAt})`, exercises.name)
    .orderBy(sql`date(${sets.createdAt})`);

  const volumeData = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${sets.createdAt}), 'YYYY-MM-DD')`,
      volume: sql<number>`sum(${sets.weight} * ${sets.reps})`,
    })
    .from(sets)
    .where(sql`${sets.createdAt} >= ${fiftySixDaysAgoStr}`)
    .groupBy(sql`date_trunc('week', ${sets.createdAt})`)
    .orderBy(sql`date_trunc('week', ${sets.createdAt})`);

  const frequencyData = await db
    .select({
      name: exercises.name,
      count: sql<number>`count(*)`,
    })
    .from(sets)
    .innerJoin(exercises, sql`${sets.exerciseId} = ${exercises.id}`)
    .groupBy(exercises.name)
    .orderBy(sql`count(*) desc`);

  return (
    <ProgressCharts
      oneRMData={oneRMData}
      volumeData={volumeData}
      frequencyData={frequencyData}
    />
  );
}