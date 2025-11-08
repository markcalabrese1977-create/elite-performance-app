-- 0007_sets_tempo_text.sql

-- Make tempo a TEXT column so values like '1–2–1' insert cleanly
ALTER TABLE sets
  ALTER COLUMN tempo TYPE text
  USING tempo::text;

-- Allow NULL notes so seed/apply can omit them cleanly
ALTER TABLE sets
  ALTER COLUMN notes DROP NOT NULL;

-- If your sets table was created with "index" instead of "set_index",
-- rename it so our inserts use the correct column name.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sets' AND column_name = 'index'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sets' AND column_name = 'set_index'
  ) THEN
    ALTER TABLE sets RENAME COLUMN "index" TO set_index;
  END IF;
END $$;