import { db } from '@/lib/db';
import { sets, sessions } from '@/drizzle/schema';

export async function POST(request: Request) {
  const { workout } = await request.json();
  const userId = 'demo-user';

  const [session] = await db
    .insert(sessions)
    .values({ userId })
    .returning();

  for (const ex of workout) {
    for (const set of ex.sets) {
      await db.insert(sets).values({
        sessionId: session.id,
        exerciseId: ex.exerciseId,
        weight: set.weight,
        reps: set.reps,
        createdAt: new Date(),
      });
    }
  }

  return Response.json({ success: true });
}