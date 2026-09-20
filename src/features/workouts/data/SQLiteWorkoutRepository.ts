import { randomUUID } from 'expo-crypto';

import type { AppDatabase } from '@/src/db/types';
import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type {
  SaveWorkoutSetInput,
  SetType,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutStatus,
  WorkoutSummary,
} from '../domain/workout';
import type { WorkoutRepository } from './WorkoutRepository';

interface WorkoutRow {
  id: string;
  title: string;
  status: WorkoutStatus;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name_snapshot: string;
  muscle_group_snapshot: string;
  sort_order: number;
  notes: string | null;
}

interface WorkoutSetRow {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  set_type: SetType;
  weight_kg: number | null;
  reps: number | null;
  rest_seconds: number | null;
  rpe: number | null;
  comment: string | null;
  is_completed: number;
  completed_at: string | null;
}

interface WorkoutSummaryRow extends WorkoutRow {
  exercise_count: number;
  completed_set_count: number;
}

const setFromRow = (row: WorkoutSetRow): WorkoutSet => ({
  id: row.id,
  workoutExerciseId: row.workout_exercise_id,
  setIndex: row.set_index,
  setType: row.set_type,
  weightKg: row.weight_kg,
  reps: row.reps,
  restSeconds: row.rest_seconds,
  rpe: row.rpe,
  comment: row.comment,
  isCompleted: row.is_completed === 1,
  completedAt: row.completed_at,
});

export class SQLiteWorkoutRepository implements WorkoutRepository {
  constructor(private readonly database: AppDatabase) {}

  async start(title: string, startedAt: string): Promise<Workout> {
    const id = randomUUID();
    await this.database.runAsync(
      `INSERT INTO workouts (
        id, title, status, started_at, created_at, updated_at
      ) VALUES (?, ?, 'in_progress', ?, ?, ?)`,
      id,
      title,
      startedAt,
      startedAt,
      startedAt,
    );
    return (await this.getById(id))!;
  }

  async getActive(): Promise<Workout | null> {
    const row = await this.database.getFirstAsync<WorkoutRow>(
      `SELECT * FROM workouts WHERE status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1`,
    );
    return row ? this.hydrateWorkout(row) : null;
  }

  async getById(id: string): Promise<Workout | null> {
    const row = await this.database.getFirstAsync<WorkoutRow>(
      'SELECT * FROM workouts WHERE id = ?',
      id,
    );
    return row ? this.hydrateWorkout(row) : null;
  }

  async listCompleted(): Promise<WorkoutSummary[]> {
    const rows = await this.database.getAllAsync<WorkoutSummaryRow>(`
      SELECT w.*,
        COUNT(DISTINCT we.id) AS exercise_count,
        COALESCE(SUM(CASE WHEN ws.is_completed = 1 THEN 1 ELSE 0 END), 0) AS completed_set_count
      FROM workouts w
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
      WHERE w.status = 'completed'
      GROUP BY w.id
      ORDER BY w.started_at DESC
    `);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
      exerciseCount: row.exercise_count,
      completedSetCount: row.completed_set_count,
    }));
  }

  async addExercise(workoutId: string, exercise: Exercise): Promise<WorkoutExercise> {
    const count = await this.database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM workout_exercises WHERE workout_id = ?',
      workoutId,
    );
    const id = randomUUID();
    await this.database.runAsync(
      `INSERT INTO workout_exercises (
        id, workout_id, exercise_id, exercise_name_snapshot,
        muscle_group_snapshot, sort_order, notes
      ) VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      id,
      workoutId,
      exercise.id,
      exercise.name,
      exercise.muscleGroup,
      count?.count ?? 0,
    );
    return {
      id,
      workoutId,
      exerciseId: exercise.id,
      exerciseNameSnapshot: exercise.name,
      muscleGroupSnapshot: exercise.muscleGroup,
      sortOrder: count?.count ?? 0,
      notes: null,
      sets: [],
    };
  }

  async reorderExercises(workoutId: string, orderedIds: string[]): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      for (const [sortOrder, id] of orderedIds.entries()) {
        const result = await this.database.runAsync(
          'UPDATE workout_exercises SET sort_order = ? WHERE id = ? AND workout_id = ?',
          sortOrder,
          id,
          workoutId,
        );
        if (!result.changes) throw new Error('动作不存在');
      }
    });
  }

  async saveSet(input: SaveWorkoutSetInput): Promise<WorkoutSet> {
    const id = input.id ?? randomUUID();
    await this.database.runAsync(
      `INSERT INTO workout_sets (
        id, workout_exercise_id, set_index, set_type, weight_kg, reps,
        rest_seconds, rpe, comment, is_completed, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(workout_exercise_id, set_index) DO UPDATE SET
        set_type = excluded.set_type,
        weight_kg = excluded.weight_kg,
        reps = excluded.reps,
        rest_seconds = excluded.rest_seconds,
        rpe = excluded.rpe,
        comment = excluded.comment,
        is_completed = excluded.is_completed,
        completed_at = excluded.completed_at`,
      id,
      input.workoutExerciseId,
      input.setIndex,
      input.setType ?? 'working',
      input.weightKg,
      input.reps,
      input.restSeconds ?? null,
      input.rpe ?? null,
      input.comment ?? null,
      input.isCompleted ? 1 : 0,
      input.completedAt ?? null,
    );
    const row = await this.database.getFirstAsync<WorkoutSetRow>(
      'SELECT * FROM workout_sets WHERE workout_exercise_id = ? AND set_index = ?',
      input.workoutExerciseId,
      input.setIndex,
    );
    if (!row) throw new Error('训练组保存失败');
    return setFromRow(row);
  }

  async removeSet(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM workout_sets WHERE id = ?', id);
  }

  async finish(workoutId: string, endedAt: string): Promise<Workout> {
    await this.database.withTransactionAsync(async () => {
      const row = await this.database.getFirstAsync<WorkoutRow>(
        'SELECT * FROM workouts WHERE id = ?',
        workoutId,
      );
      if (!row) throw new Error('训练不存在');
      const durationSeconds = Math.max(
        0,
        Math.round((Date.parse(endedAt) - Date.parse(row.started_at)) / 1000),
      );
      await this.database.runAsync(
        `UPDATE workouts SET status = 'completed', ended_at = ?,
         duration_seconds = ?, updated_at = ? WHERE id = ?`,
        endedAt,
        durationSeconds,
        endedAt,
        workoutId,
      );
    });
    return (await this.getById(workoutId))!;
  }

  async discard(workoutId: string, discardedAt: string): Promise<void> {
    await this.database.runAsync(
      `UPDATE workouts SET status = 'discarded', ended_at = ?, updated_at = ? WHERE id = ?`,
      discardedAt,
      discardedAt,
      workoutId,
    );
  }

  async delete(workoutId: string): Promise<void> {
    await this.database.runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
  }

  private async hydrateWorkout(row: WorkoutRow): Promise<Workout> {
    const exerciseRows = await this.database.getAllAsync<WorkoutExerciseRow>(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY sort_order',
      row.id,
    );
    const workoutExercises = await Promise.all(
      exerciseRows.map(async (exercise): Promise<WorkoutExercise> => {
        const setRows = await this.database.getAllAsync<WorkoutSetRow>(
          'SELECT * FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_index',
          exercise.id,
        );
        return {
          id: exercise.id,
          workoutId: exercise.workout_id,
          exerciseId: exercise.exercise_id,
          exerciseNameSnapshot: exercise.exercise_name_snapshot,
          muscleGroupSnapshot: exercise.muscle_group_snapshot,
          sortOrder: exercise.sort_order,
          notes: exercise.notes,
          sets: setRows.map(setFromRow),
        };
      }),
    );
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      workoutExercises,
    };
  }
}
