import type {
  Exercise,
  NewExercise,
  UpdateExercise,
} from '../domain/exercise';

export interface ExerciseFilter {
  query?: string;
  muscleGroup?: string;
  includeArchived?: boolean;
}

export interface ExerciseRepository {
  list(filter?: ExerciseFilter): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  create(input: NewExercise): Promise<Exercise>;
  update(id: string, input: UpdateExercise): Promise<Exercise>;
  archive(id: string, archivedAt: string): Promise<void>;
  upsertBuiltIns(exercises: Exercise[]): Promise<void>;
}
