export type LiftKind = "compound" | "accessory";

export interface SetRecord {
  load: number;     // in lbs
  reps: number;
  rir: number;      // reported RIR (0–4)
  tempo?: string;   // e.g., "3-1-1"
  isTestSet?: boolean;
}

export interface ExerciseSession {
  exerciseId: number;
  name: string;
  kind: LiftKind;         // "compound" or "accessory"
  targetRepRange: [number, number]; // e.g., [8,12]
  sets: SetRecord[];      // completed sets this session
}

export interface ContextFlags {
  lateMeso: boolean;      // 1 RIR bias if true
  fatigueScore?: number;  // 0–10 subjective/derived
}

export interface Rec {
  decision: "increase_load" | "increase_reps" | "hold" | "reduce_load";
  nextLoad: number;     // suggested next-session load
  nextRIR: number;      // target RIR next session
  nextSets?: number;    // optional set count tweak
  notes?: string;
}
