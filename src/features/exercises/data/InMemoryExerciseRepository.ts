import { randomUUID } from 'expo-crypto';

import type { Exercise, NewExercise, UpdateExercise } from '../domain/exercise';
import type { ExerciseFilter, ExerciseRepository } from './ExerciseRepository';

const cloneExercise = (exercise: Exercise): Exercise => ({ ...exercise });

export class InMemoryExerciseRepository implements ExerciseRepository {
  private readonly exercises = new Map<string, Exercise>();

  async list(filter: ExerciseFilter = {}): Promise<Exercise[]> {
    const query = filter.query?.trim().toLocaleLowerCase() ?? '';
    return [...this.exercises.values()]
      .filter((exercise) => filter.includeArchived || !exercise.archivedAt)
      .filter((exercise) => !filter.muscleGroup || exercise.muscleGroup === filter.muscleGroup)
      .filter((exercise) => {
        if (!query) return true;
        return [exercise.name, exercise.muscleGroup, exercise.equipment]
          .some((value) => value.toLocaleLowerCase().includes(query));
      })
      .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
      .map(cloneExercise);
  }

  async getById(id: string): Promise<Exercise | null> {
    const exercise = this.exercises.get(id);
    return exercise ? cloneExercise(exercise) : null;
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
    this.exercises.set(exercise.id, exercise);
    return cloneExercise(exercise);
  }

  async update(id: string, input: UpdateExercise): Promise<Exercise> {
    const current = this.exercises.get(id);
    if (!current) throw new Error('动作不存在');
    const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
    this.exercises.set(id, updated);
    return cloneExercise(updated);
  }

  async archive(id: string, archivedAt: string): Promise<void> {
    const current = this.exercises.get(id);
    if (!current) throw new Error('动作不存在');
    this.exercises.set(id, { ...current, archivedAt, updatedAt: archivedAt });
  }

  async upsertBuiltIns(exercises: Exercise[]): Promise<void> {
    for (const exercise of exercises) {
      this.exercises.set(exercise.id, cloneExercise(exercise));
    }
  }
}
