import { randomUUID } from 'expo-crypto';

import type { AppDatabase, DatabaseValue } from '@/src/db/types';
import type { Exercise, NewExercise, UpdateExercise } from '../domain/exercise';
import type { ExerciseFilter, ExerciseRepository } from './ExerciseRepository';

interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: Exercise['muscleGroup'];
  movement_type: Exercise['movementType'];
  equipment: Exercise['equipment'];
  default_rest_seconds: number;
  notes: string | null;
  is_custom: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

const fromRow = (row: ExerciseRow): Exercise => ({
  id: row.id,
  name: row.name,
  muscleGroup: row.muscle_group,
  movementType: row.movement_type,
  equipment: row.equipment,
  defaultRestSeconds: row.default_rest_seconds,
  notes: row.notes,
  isCustom: row.is_custom === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  archivedAt: row.archived_at,
});

export class SQLiteExerciseRepository implements ExerciseRepository {
  constructor(private readonly database: AppDatabase) {}

  async list(filter: ExerciseFilter = {}): Promise<Exercise[]> {
    const clauses: string[] = [];
    const parameters: DatabaseValue[] = [];
    if (!filter.includeArchived) clauses.push('archived_at IS NULL');
    if (filter.muscleGroup) {
      clauses.push('muscle_group = ?');
      parameters.push(filter.muscleGroup);
    }
    if (filter.query?.trim()) {
      clauses.push('(name LIKE ? OR muscle_group LIKE ? OR equipment LIKE ?)');
      const query = `%${filter.query.trim()}%`;
      parameters.push(query, query, query);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await this.database.getAllAsync<ExerciseRow>(
      `SELECT * FROM exercises ${where} ORDER BY name COLLATE NOCASE`,
      parameters,
    );
    return rows.map(fromRow);
  }

  async getById(id: string): Promise<Exercise | null> {
    const row = await this.database.getFirstAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE id = ?',
      id,
    );
    return row ? fromRow(row) : null;
  }

  async create(input: NewExercise): Promise<Exercise> {
    const now = new Date().toISOString();
    const exercise: Exercise = {
      ...input,
      id: randomUUID(),
      isCustom: true,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };
    await this.insertOrReplace(exercise);
    return exercise;
  }

  async update(id: string, input: UpdateExercise): Promise<Exercise> {
    const current = await this.getById(id);
    if (!current) throw new Error('动作不存在');
    const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
    await this.insertOrReplace(updated);
    return updated;
  }

  async archive(id: string, archivedAt: string): Promise<void> {
    const result = await this.database.runAsync(
      'UPDATE exercises SET archived_at = ?, updated_at = ? WHERE id = ?',
      archivedAt,
      archivedAt,
      id,
    );
    if (!result.changes) throw new Error('动作不存在');
  }

  async upsertBuiltIns(exercises: Exercise[]): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      for (const exercise of exercises) await this.insertOrReplace(exercise);
    });
  }

  private async insertOrReplace(exercise: Exercise): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO exercises (
        id, name, muscle_group, movement_type, equipment, default_rest_seconds,
        notes, is_custom, created_at, updated_at, archived_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        muscle_group = excluded.muscle_group,
        movement_type = excluded.movement_type,
        equipment = excluded.equipment,
        default_rest_seconds = excluded.default_rest_seconds,
        notes = excluded.notes,
        is_custom = excluded.is_custom,
        updated_at = excluded.updated_at,
        archived_at = excluded.archived_at`,
      exercise.id,
      exercise.name,
      exercise.muscleGroup,
      exercise.movementType,
      exercise.equipment,
      exercise.defaultRestSeconds,
      exercise.notes,
      exercise.isCustom ? 1 : 0,
      exercise.createdAt,
      exercise.updatedAt,
      exercise.archivedAt,
    );
  }
}
