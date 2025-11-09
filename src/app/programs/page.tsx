// src/app/programs/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Program = {
  id: string;
  name: string;
  goal: string;
  durationWeeks: number;
  daysPerWeek: number;
  notes?: string;
};

export default function ProgramSelector() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(data => setPrograms(data.programs ?? []))
      .catch(() => toast.error("Failed to load programs"));
  }, []);

  const onStart = async () => {
    if (!selectedId || !startDate) {
      toast.error("Pick a program and start date");
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch(`/api/programs/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, startDate }),
      });

      const result = await res.json();

      if (result.ok) {
        toast.success(`Started "${result.created[0].notes}"!`);
        router.push('/log');
      } else {
        toast.error(result.error || "Failed to apply");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Choose Your Program</h1>
        <p className="text-muted-foreground mt-2">Pick a plan. Start training. See results.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {programs.map(p => (
          <Card
            key={p.id}
            className={`p-6 cursor-pointer transition-all ${
              selectedId === p.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedId(p.id)}
          >
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {p.durationWeeks} weeks • {p.daysPerWeek} days/week
            </p>
            <p className="mt-3 text-sm">{p.notes || 'No description'}</p>
            <div className="mt-4 text-xs text-muted-foreground">
              Goal: <span className="font-medium capitalize">{p.goal}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedId && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Start Date</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm">When do you begin?</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={onStart} disabled={isApplying}>
              {isApplying ? "Applying..." : "Start Training"}
            </Button>
          </div>
        </Card>
      )}
    </main>
  );
}