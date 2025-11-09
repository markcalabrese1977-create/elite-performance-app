// src/app/history/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

type Session = {
  id: number;
  date: string;
  sets?: any[];
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []));
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Workout History</h1>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No workouts yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => (
            <div key={s.id} className="border rounded-lg p-4">
              <p className="font-semibold">
                {format(new Date(s.date), 'EEEE, MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.sets?.length || 0} sets logged
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}