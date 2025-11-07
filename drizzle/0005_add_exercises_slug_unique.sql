-- Ensure slug column exists, backfill, then enforce uniqueness

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE exercises
SET slug = regexp_replace(lower(name), '[^a-z0-9]+', '_', 'g')
WHERE slug IS NULL OR slug = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = ANY (current_schemas(true))
      AND indexname = 'exercises_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX exercises_slug_unique ON exercises(slug);
  END IF;
END$$;