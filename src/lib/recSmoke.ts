import { recommendNext } from "./recEngine";
import type { ExerciseSession } from "../types/training";

const session: ExerciseSession = {
  exerciseId: 1,
  name: "Incline DB Press",
  kind: "compound",
  targetRepRange: [8, 12],
  sets: [
    { load: 70, reps: 12, rir: 2 },
    { load: 70, reps: 12, rir: 2 },
    { load: 70, reps: 12, rir: 2 },
  ],
};

const rec = recommendNext(session, { lateMeso: true, fatigueScore: 3 });
console.log(rec);
