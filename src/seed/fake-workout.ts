import { db } from '../lib/db';
import { sets, sessions } from '../drizzle/schema';

async function seedFakeWorkout() {
  const [session] = await db
    .insert(sessions)
    .values({ userId: 'demo-user' })
    .returning();

  await db.insert(sets).values([
    { sessionId: session.id, exerciseId: 1, weight: 225, reps: 5, createdAt: new Date('2025-11-01') },
    { sessionId: session.id, exerciseId: 1, weight: 235, reps: 5, createdAt: new Date('2025-11-03') },
    { sessionId: session.id, exerciseId: 1, weight: 245, reps: 4, createdAt: new Date('2025-11-05') },
    { sessionId: session.id, exerciseId: 2, weight: 315, reps: 8, createdAt: new Date('2025-11-02') },
    { sessionId: session.id, exerciseId: 2, weight: 335, reps: 6, createdAt: new Date('2025-11-04') },
    { sessionId: session.id, exerciseId: 3, weight: 65, reps: 12, createdAt: new Date('2025-11-01') },
    { sessionId: session.id, exerciseId: 3, weight: 75, reps: 10, createdAt: new Date('2025-11-06') },
  ]);

  console.log('Fake workout seeded! Go to /progress');
}

seedFakeWorkout().catch(console.error);
