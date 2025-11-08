-- Ensure a unique index exists on alias so ON CONFLICT ("alias") works
CREATE UNIQUE INDEX IF NOT EXISTS exercise_aliases_alias_key
ON exercise_aliases ("alias");