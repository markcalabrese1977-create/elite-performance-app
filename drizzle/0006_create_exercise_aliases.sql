-- drizzle/0006_create_exercise_aliases.sql (example)

CREATE TABLE IF NOT EXISTS exercise_aliases (
  id serial PRIMARY KEY,
  alias text NOT NULL UNIQUE,
  exercise_id integer NOT NULL
);

-- Optional guard if you might have a leftover FK from a failed run
ALTER TABLE exercise_aliases
  DROP CONSTRAINT IF EXISTS exercise_aliases_exercise_id_exercises_id_fk;

ALTER TABLE exercise_aliases
  ADD CONSTRAINT exercise_aliases_exercise_id_exercises_id_fk
  FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
  ON DELETE CASCADE ON UPDATE NO ACTION;