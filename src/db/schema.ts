import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  index,
  varchar,
} from "drizzle-orm/pg-core";

/** Exercises */
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Workout sessions (one per training day) */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").default(1), // placeholder until auth
  date: timestamp("date").defaultNow().notNull(),
  dayIndex: integer("day_index"),
  fatigueScore: integer("fatigue_score"),
  notes: text("notes"),
}, (t) => ({
  dateIdx: index("idx_sessions_date").on(t.date),
}));

/** Individual sets inside a session */
export const sets = pgTable("sets", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  setIndex: integer("set_index").notNull(),
  load: integer("load").notNull(),
  reps: integer("reps").notNull(),
  rir: integer("rir").notNull(),
  tempo: text("tempo"),
  isTestSet: boolean("is_test_set").default(false),
}, (t) => ({
  sessIdx: index("idx_sets_session").on(t.sessionId),
  exIdx: index("idx_sets_exercise").on(t.exerciseId),
}));

/** Users */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});