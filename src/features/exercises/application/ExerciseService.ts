import { z } from 'zod';

import type {
  Exercise,
  NewExercise,
  UpdateExercise,
} from '../domain/exercise';
import type {
  ExerciseFilter,
  ExerciseRepository,
} from '../data/ExerciseRepository';

const exerciseInputSchema = z.object({
  name: z.string().trim().min(1, '请输入动作名称'),
  muscleGroup: z.enum(['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'full_body']),
  movementType: z.enum(['compound', 'isolation']),
  equipment: z.enum(['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other']),
  defaultRestSeconds: z.number().int().min(0).max(3600),
  notes: z.string().trim().nullable(),
});

export class ExerciseService {
  constructor(private readonly repository: ExerciseRepository) {}

  list(filter?: ExerciseFilter): Promise<Exercise[]> {
    return this.repository.list(filter);
  }

  getById(id: string): Promise<Exercise | null> {
    return this.repository.getById(id);
  }

  create(input: NewExercise): Promise<Exercise> {
    return this.repository.create(exerciseInputSchema.parse(input));
  }

  async update(id: string, input: UpdateExercise): Promise<Exercise> {
    const current = await this.repository.getById(id);
    if (!current) throw new Error('动作不存在');
    if (!current.isCustom) throw new Error('内置动作不可编辑');
    const normalized = exerciseInputSchema.parse({ ...current, ...input });
    return this.repository.update(id, normalized);
  }

  async archive(id: string, archivedAt = new Date().toISOString()): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) throw new Error('动作不存在');
    if (!current.isCustom) throw new Error('内置动作不可归档');
    await this.repository.archive(id, archivedAt);
  }
}
