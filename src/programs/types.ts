// src/programs/types.ts

/** One set prescription inside a session */
export type ProgramSet = {
  /** canonical exercise code (e.g., "bench_barbell_flat") */
  exerciseCode: string;
  /** optional position of this set within the session (1-based) */
  setIndex?: number;
  reps?: number;
  rir?: number;
  tempo?: string;
  /** free-form notes for this set */
  notes?: string;
  /** flag for AMRAP / test set, etc. */
  isTestSet?: boolean;
};

/** A training session (day) inside a week */
export type ProgramSession = {
  /** optional day index within the week (1..n). If absent we infer order */
  index?: number;
  /** optional planned fatigue score for the day */
  fatigueScore?: number;
  /** session-level notes (fallback label) */
  notes?: string;
  /** required list of sets */
  sets: ProgramSet[];
};

/** Week wrapper */
export type ProgramWeek = {
  sessions: ProgramSession[];
};

/** Full program template */
export type ProgramTemplate = {
  id: string;
  name: string;
  /** broad goal label; keep open-ended for now */
  goal: string;
  durationWeeks: number;
  daysPerWeek: number;
  notes?: string;

  /** canonical layout */
  weeks: ProgramWeek[];

  /** compatibility fallback for old flat day lists (optional) */
  days?: ProgramSession[];
};