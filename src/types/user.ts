// src/types/user.ts
export type TrainingGoal = 
  | "hypertrophy"
  | "strength"
  | "fat_loss"
  | "power"
  | "maintenance";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type UserProfile = {
  userId: number;
  goal: TrainingGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  recoveryCapacity: 1 | 2 | 3; // 1=low, 3=high
};