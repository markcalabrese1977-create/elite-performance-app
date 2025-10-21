CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer DEFAULT 1,
	"date" timestamp DEFAULT now() NOT NULL,
	"day_index" integer,
	"fatigue_score" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"set_index" integer NOT NULL,
	"load" integer NOT NULL,
	"reps" integer NOT NULL,
	"rir" integer NOT NULL,
	"tempo" text,
	"is_test_set" boolean DEFAULT false
);
--> statement-breakpoint
CREATE INDEX "idx_sessions_date" ON "sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_sets_session" ON "sets" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_sets_exercise" ON "sets" USING btree ("exercise_id");