import { db } from '@/lib/db';
import { exercises, exerciseAliases } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const result = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      aliases: sql<string[]>`array_agg(${exerciseAliases.alias})`,
    })
    .from(exercises)
    .leftJoin(exerciseAliases, sql`${exerciseAliases.exerciseId} = ${exercises.id}`)
    .groupBy(exercises.id);

  return Response.json(
    result.map((r) => ({ ...r, aliases: r.aliases.filter(Boolean) }))
  );
}