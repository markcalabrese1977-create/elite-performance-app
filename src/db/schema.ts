// src/db/schema.ts
import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

// --- Exercises --------------------------------------------------------------
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),          // canonical key we look up by
  muscleGroup: text("muscle_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Exercise Aliases -------------------------------------------------------
// Map many alternative spellings/codes to a canonical exercise via slug/id
export const exerciseAliases = pgTable("exercise_aliases", {
  id: serial("id").primaryKey(),
  alias: text("alias").notNull().unique(),        // each alias unique (lowercased)
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
});

/* ================================
   Workout Sessions
   - One row per training session/day
   - Until auth is wired, default user_id = 1
=================================== */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").default(1),
    date: timestamp("date").notNull().defaultNow(),
    dayIndex: integer("day_index"), // optional logical day within a block
    fatigueScore: integer("fatigue_score"),
    notes: text("notes"),
  },
  (t) => ({
    idxDate: index("idx_sessions_date").on(t.date),
  })
);

/* ================================
   Sets
   - Individual working sets within a session
   - Foreign keys are logical; indices for perf
=================================== */
export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),

    sessionId: integer("session_id").notNull(),   // → sessions.id
    exerciseId: integer("exercise_id").notNull(), // → exercises.id

    setIndex: integer("set_index").notNull(),     // 1,2,3... within session/exercise

    // Load metrics (nullable if N/A for bodyweight/etc.)
    load: integer("load"), // weight; units decided at UI level
    reps: integer("reps"),
    rir: integer("rir"),   // reps-in-reserve (0–10 typical)
    tempo: text("tempo"),

    isTestSet: boolean("is_test_set").default(false),
  },
  (t) => ({
    idxSession: index("idx_sets_session").on(t.sessionId),
    idxExercise: index("idx_sets_exercise").on(t.exerciseId),
  })
);