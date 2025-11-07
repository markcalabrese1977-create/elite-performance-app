export type ProgramGoal =
  | "maintenance" | "hypertrophy" | "fat_loss" | "power" | "foundation" | string;

export type ProgramSet = {
  exerciseCode: string;
  reps?: number | null;
  rir?: number | null;
  tempo?: string | null;
  isTestSet?: boolean | null;
};

export type ProgramDay = { sets: ProgramSet[] };
export type ProgramWeek = { sessions: ProgramDay[] };

export type ProgramTemplate = {
  id: string;
  name: string;
  goal?: ProgramGoal;
  durationWeeks?: number;
  daysPerWeek?: number;
  notes?: string | null;
  weeks?: ProgramWeek[];
  days?: ProgramDay[];
};