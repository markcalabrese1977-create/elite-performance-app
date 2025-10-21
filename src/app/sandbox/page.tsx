'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recommendNext } from '@/lib/recEngine';
import type { ExerciseSession } from '@/types/training';

export default function Sandbox() {
  const [kind, setKind] = useState<'compound' | 'accessory'>('compound');
  const [lateMeso, setLateMeso] = useState(true);
  const [fatigue, setFatigue] = useState(3);
  const [load, setLoad] = useState(70);
  const [reps1, setReps1] = useState(12);
  const [reps2, setReps2] = useState(12);
  const [reps3, setReps3] = useState(12);
  const [rir, setRir] = useState(2);
  const [out, setOut] = useState<any>(null);

  const onRecommend = () => {
    const session: ExerciseSession = {
      exerciseId: 1,
      name: 'Incline DB Press',
      kind,
      targetRepRange: [8, 12],
      sets: [
        { load, reps: reps1, rir },
        { load, reps: reps2, rir },
        { load, reps: reps3, rir },
      ],
    };
    const rec = recommendNext(session, { lateMeso: true, fatigueScore: fatigue });
    setOut(rec);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Rec Engine Sandbox</h1>

      <Card className="p-4 space-y-3">
        <div className="flex gap-3">
          <Button
            variant={kind === 'compound' ? 'default' : 'outline'}
            onClick={() => setKind('compound')}
          >
            Compound
          </Button>
          <Button
            variant={kind === 'accessory' ? 'default' : 'outline'}
            onClick={() => setKind('accessory')}
          >
            Accessory
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={lateMeso ? 'default' : 'outline'}
            onClick={() => setLateMeso(!lateMeso)}
          >
            {lateMeso ? 'Late-Meso Bias: ON' : 'Late-Meso Bias: OFF'}
          </Button>
          <label className="text-sm opacity-80">Fatigue: {fatigue}/10</label>
          <Input
            type="number"
            value={fatigue}
            onChange={(e) => setFatigue(Number(e.target.value))}
            className="w-20"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm opacity-80">Load (lb)</label>
            <Input type="number" value={load} onChange={(e) => setLoad(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm opacity-80">RIR</label>
            <Input type="number" value={rir} onChange={(e) => setRir(Number(e.target.value))} />
          </div>
          <div className="self-end">
            <Button onClick={onRecommend} className="w-full">Get Recommendation</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm opacity-80">Set 1 reps</label>
            <Input type="number" value={reps1} onChange={(e) => setReps1(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm opacity-80">Set 2 reps</label>
            <Input type="number" value={reps2} onChange={(e) => setReps2(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm opacity-80">Set 3 reps</label>
            <Input type="number" value={reps3} onChange={(e) => setReps3(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {out && (
        <Card className="p-4">
          <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(out, null, 2)}
          </pre>
        </Card>
      )}
    </main>
  );
}
