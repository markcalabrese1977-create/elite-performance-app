-- ✅ SAFE/IDEMPOTENT MIGRATION

-- 1) Create aliases table if missing
CREATE TABLE IF NOT EXISTS "exercise_aliases" (
  "id"        serial PRIMARY KEY,
  "alias"     text NOT NULL,
  "exercise_id" integer NOT NULL,
  CONSTRAINT "exercise_aliases_alias_unique" UNIQUE("alias")
);

-- 2) Drop legacy demo "users" table only if it exists (avoid RLS error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
    DROP TABLE IF EXISTS "users" CASCADE;
  END IF;
END $$;

-- 3) Exercises: tidy constraints/columns
ALTER TABLE IF EXISTS "exercises"
  DROP CONSTRAINT IF EXISTS "exercises_name_unique";

ALTER TABLE IF EXISTS "exercises"
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now();
ALTER TABLE IF EXISTS "exercises"
  ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE IF EXISTS "exercises"
  ADD COLUMN IF NOT EXISTS "slug" text;

UPDATE "exercises"
SET "slug" = lower(regexp_replace("name",'[^a-z0-9]+','_','g'))
WHERE "slug" IS NULL;

ALTER TABLE IF EXISTS "exercises"
  ALTER COLUMN "slug" SET NOT NULL;

-- (A) Add UNIQUE(slug) only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conname = 'exercises_slug_unique'
  ) THEN
    ALTER TABLE "exercises"
      ADD CONSTRAINT "exercises_slug_unique" UNIQUE("slug");
  END IF;
END $$;

-- 4) Sets: allow NULLs on optional columns
ALTER TABLE IF EXISTS "sets"
  ALTER COLUMN "load" DROP NOT NULL,
  ALTER COLUMN "reps" DROP NOT NULL,
  ALTER COLUMN "rir"  DROP NOT NULL;

-- 5) FK exercise_aliases.exercise_id → exercises.id (guarded)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conname = 'exercise_aliases_exercise_id_exercises_id_fk'
  ) THEN
    ALTER TABLE IF EXISTS "exercise_aliases"
      ADD CONSTRAINT "exercise_aliases_exercise_id_exercises_id_fk"
      FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;