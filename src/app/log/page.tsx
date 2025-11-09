// src/app/log/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search } from 'lucide-react';

type Exercise = { id: number; name: string; aliases: string[] };
type Set = { weight: number; reps: number };
type WorkoutSet = { exerciseId: number; sets: Set[] };

async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch('/api/exercises');
  return res.json();
}

async function saveWorkout(workout: WorkoutSet[]) {
  await fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workout }),
  });
}

export default function LogPage() {
  const [search, setSearch] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutSet[]>([]);
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  });

  const mutation = useMutation({
    mutationFn: saveWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setSelectedExercises([]);
      alert('Workout logged! Check /progress');
    },
  });

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const addExercise = (ex: Exercise) => {
    setSelectedExercises([...selectedExercises, { exerciseId: ex.id, sets: [{ weight: 0, reps: 0 }] }]);
    setSearch('');
  };

  const updateSet = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const updated = [...selectedExercises];
    updated[exIndex].sets[setIndex][field] = value;
    setSelectedExercises(updated);
  };

  const addSet = (exIndex: number) => {
    const updated = [...selectedExercises];
    updated[exIndex].sets.push({ weight: 0, reps: 0 });
    setSelectedExercises(updated);
  };

  const removeExercise = (exIndex: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== exIndex));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Log Workout</h1>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises (bench, squat, lateral...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-card text-foreground"
          />
        </div>
        {search && (
          <div className="mt-2 border rounded-lg bg-card max-h-60 overflow-y-auto">
            {filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addExercise(ex)}
                className="w-full text-left px-4 py-3 hover:bg-muted transition"
              >
                <div className="font-medium">{ex.name}</div>
                <div className="text-sm text-muted-foreground">{ex.aliases.join(', ')}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workout */}
      <div className="max-w-4xl mx-auto space-y-6">
        {selectedExercises.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            Search and add exercises to start logging
          </p>
        ) : (
          selectedExercises.map((workoutEx, exIndex) => {
            const ex = exercises.find((e) => e.id === workoutEx.exerciseId)!;
            return (
              <div key={exIndex} className="bg-card rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{ex.name}</h3>
                  <button onClick={() => removeExercise(exIndex)} className="text-red-500">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {workoutEx.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex gap-4 items-center">
                      <span className="w-12 text-sm font-medium">Set {setIndex + 1}</span>
                      <input
                        type="number"
                        placeholder="Weight"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'weight', Number(e.target.value))}
                        className="w-32 px-3 py-2 border rounded-lg bg-background"
                      />
                      <span className="text-muted-foreground">×</span>
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIndex, setIndex, 'reps', Number(e.target.value))}
                        className="w-24 px-3 py-2 border rounded-lg bg-background"
                      />
                      {set.weight && set.reps && (
                        <span className="ml-4 text-sm text-muted-foreground">
                          1RM: {Math.round(set.weight * (1 + set.reps / 30))}
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addSet(exIndex)}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add set
                  </button>
                </div>
              </div>
            );
          })
        )}

        {selectedExercises.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => mutation.mutate(selectedExercises)}
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-xl font-bold hover:bg-primary/90 transition"
            >
              {mutation.isPending ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}