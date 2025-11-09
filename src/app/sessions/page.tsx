'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { exerciseSession } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

interface Session {
  id: string;
  // add any other fields you actually use
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function load() {
      // Drizzle client-side helper – you already have a tiny wrapper in lib/db
      const data = await db
        .select()
        .from(exerciseSession)
        .where(eq(exerciseSession.userId, 'CURRENT_USER_ID')); // replace with real auth

      setSessions(data as Session[]);
    }
    load();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Sessions</h1>
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map(s => (
            <li key={s.id} className="p-3 border rounded">
              Session ID: {s.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}