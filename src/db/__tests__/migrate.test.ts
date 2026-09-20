import initSqlJs from 'sql.js';

import { INITIAL_MIGRATION_SQL } from '../migrations/001_initial';

describe('initial SQLite migration', () => {
  async function createDatabase() {
    const SQL = await initSqlJs({
      locateFile: (file) => require.resolve(`sql.js/dist/${file}`),
    });
    const database = new SQL.Database();
    database.run(INITIAL_MIGRATION_SQL);
    return database;
  }

  it('is idempotent and creates every required table', async () => {
    const database = await createDatabase();
    database.run(INITIAL_MIGRATION_SQL);

    const tables = database
      .exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")[0]
      .values.flat();

    expect(tables).toEqual(
      expect.arrayContaining([
        'app_meta',
        'exercises',
        'workouts',
        'workout_exercises',
        'workout_sets',
      ]),
    );
    expect(
      database.exec("SELECT value FROM app_meta WHERE key = 'schema_version'")[0]
        .values[0][0],
    ).toBe('1');
  });

  it('cascades workout deletion through exercises and sets', async () => {
    const database = await createDatabase();
    database.run(`
      INSERT INTO exercises (
        id, name, muscle_group, movement_type, equipment,
        default_rest_seconds, is_custom, created_at, updated_at
      ) VALUES ('exercise-1', '杠铃卧推', 'chest', 'compound', 'barbell', 120, 0, 'now', 'now');
      INSERT INTO workouts (
        id, title, status, started_at, created_at, updated_at
      ) VALUES ('workout-1', '胸部训练', 'in_progress', 'now', 'now', 'now');
      INSERT INTO workout_exercises (
        id, workout_id, exercise_id, exercise_name_snapshot,
        muscle_group_snapshot, sort_order
      ) VALUES ('workout-exercise-1', 'workout-1', 'exercise-1', '杠铃卧推', 'chest', 0);
      INSERT INTO workout_sets (
        id, workout_exercise_id, set_index, set_type, weight_kg, reps, is_completed
      ) VALUES ('set-1', 'workout-exercise-1', 1, 'working', 80, 8, 1);
      DELETE FROM workouts WHERE id = 'workout-1';
    `);

    expect(database.exec('SELECT COUNT(*) FROM workout_exercises')[0].values[0][0]).toBe(0);
    expect(database.exec('SELECT COUNT(*) FROM workout_sets')[0].values[0][0]).toBe(0);
  });

  it('rejects duplicate set positions inside one exercise', async () => {
    const database = await createDatabase();
    database.run(`
      INSERT INTO exercises (
        id, name, muscle_group, movement_type, equipment,
        default_rest_seconds, is_custom, created_at, updated_at
      ) VALUES ('exercise-1', '深蹲', 'legs', 'compound', 'barbell', 180, 0, 'now', 'now');
      INSERT INTO workouts (
        id, title, status, started_at, created_at, updated_at
      ) VALUES ('workout-1', '腿部训练', 'in_progress', 'now', 'now', 'now');
      INSERT INTO workout_exercises (
        id, workout_id, exercise_id, exercise_name_snapshot,
        muscle_group_snapshot, sort_order
      ) VALUES ('workout-exercise-1', 'workout-1', 'exercise-1', '深蹲', 'legs', 0);
      INSERT INTO workout_sets (
        id, workout_exercise_id, set_index, set_type, is_completed
      ) VALUES ('set-1', 'workout-exercise-1', 1, 'working', 0);
    `);

    expect(() =>
      database.run(`
        INSERT INTO workout_sets (
          id, workout_exercise_id, set_index, set_type, is_completed
        ) VALUES ('set-2', 'workout-exercise-1', 1, 'working', 0);
      `),
    ).toThrow();
  });
});
