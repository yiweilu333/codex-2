export const INITIAL_MIGRATION_SQL = `
PRAGMA foreign_keys = ON;
BEGIN;

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('compound', 'isolation')),
  equipment TEXT NOT NULL,
  default_rest_seconds INTEGER NOT NULL CHECK (default_rest_seconds >= 0),
  notes TEXT,
  is_custom INTEGER NOT NULL CHECK (is_custom IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'discarded')),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY NOT NULL,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  exercise_name_snapshot TEXT NOT NULL,
  muscle_group_snapshot TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id TEXT PRIMARY KEY NOT NULL,
  workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_index INTEGER NOT NULL CHECK (set_index >= 1),
  set_type TEXT NOT NULL CHECK (set_type IN ('warmup', 'working', 'drop', 'failure')),
  weight_kg REAL CHECK (weight_kg IS NULL OR weight_kg >= 0),
  reps INTEGER CHECK (reps IS NULL OR reps >= 0),
  rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  rpe REAL CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10)),
  comment TEXT,
  is_completed INTEGER NOT NULL CHECK (is_completed IN (0, 1)),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_workouts_started_at
  ON workouts(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout
  ON workout_exercises(workout_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_sets_order
  ON workout_sets(workout_exercise_id, set_index);
CREATE INDEX IF NOT EXISTS idx_workout_sets_completed
  ON workout_sets(completed_at);

INSERT INTO app_meta (key, value) VALUES ('schema_version', '1')
  ON CONFLICT(key) DO UPDATE SET value = excluded.value;

COMMIT;
`;
