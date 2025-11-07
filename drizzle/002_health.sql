-- 002_health.sql
-- Health workouts + granular samples, plus link into journal.sessions

-- 1) Core table: health_sessions
CREATE TABLE IF NOT EXISTS health_sessions (
  id                  SERIAL PRIMARY KEY,
  uuid                TEXT UNIQUE,                      -- Apple Health UUID (or CSV GUID)
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,                    -- e.g. HKWorkoutActivityTypeStrengthTraining
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  duration_sec        INTEGER GENERATED ALWAYS AS (
                         (EXTRACT(EPOCH FROM (end_time - start_time)))::INTEGER
                       ) STORED,
  total_energy_kcal   NUMERIC(10,2),                    -- active energy burned
  avg_hr              INTEGER,                          -- average heart rate (bpm)
  max_hr              INTEGER,                          -- max heart rate (bpm)
  source_name         TEXT,                             -- e.g., "Apple Watch Series 9"
  device_name         TEXT,                             -- device descriptor if available
  local_tz            TEXT,                             -- e.g., "America/Detroit"
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS health_sessions_user_time_idx
  ON health_sessions (user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS health_sessions_type_idx
  ON health_sessions (type);


-- 2) Granular samples table: health_samples
CREATE TABLE IF NOT EXISTS health_samples (
  id            SERIAL PRIMARY KEY,
  session_id    INTEGER REFERENCES health_sessions(id) ON DELETE SET NULL,
  uuid          TEXT UNIQUE,                           -- Apple Health record UUID
  type          TEXT NOT NULL,                         -- e.g., HKQuantityTypeIdentifierHeartRate
  value         NUMERIC(10,3) NOT NULL,                -- raw reading
  unit          TEXT,                                  -- e.g., "count/min", "ms"
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ,                           -- optional (interval samples)
  source_name   TEXT,
  local_tz      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for querying by session/time/type
CREATE INDEX IF NOT EXISTS health_samples_session_time_idx
  ON health_samples (session_id, start_time);

CREATE INDEX IF NOT EXISTS health_samples_type_time_idx
  ON health_samples (type, start_time);


-- 3) Link journal.sessions → health_sessions (nullable)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS health_session_id INTEGER REFERENCES health_sessions(id) ON DELETE SET NULL;

-- Optional convenience index for joins
CREATE INDEX IF NOT EXISTS sessions_health_session_id_idx
  ON sessions (health_session_id);