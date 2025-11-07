CREATE TABLE "exercise_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" text NOT NULL,
	"exercise_id" integer NOT NULL,
	CONSTRAINT "exercise_aliases_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_name_unique";--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "load" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "reps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "rir" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise_aliases" ADD CONSTRAINT "exercise_aliases_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_slug_unique" UNIQUE("slug");