-- drizzle/003_health_raw.sql
CREATE TABLE IF NOT EXISTS health_raw (
  id            BIGSERIAL PRIMARY KEY,
  provider      TEXT NOT NULL DEFAULT 'apple',
  captured_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload       JSONB NOT NULL
);