import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type {
  SaveWorkoutSetInput,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutSummary,
} from '../domain/workout';

export interface WorkoutRepository {
  start(title: string, startedAt: string): Promise<Workout>;
  getActive(): Promise<Workout | null>;
  getById(id: string): Promise<Workout | null>;
  listCompleted(): Promise<WorkoutSummary[]>;
  addExercise(workoutId: string, exercise: Exercise): Promise<WorkoutExercise>;
  reorderExercises(workoutId: string, orderedIds: string[]): Promise<void>;
  saveSet(input: SaveWorkoutSetInput): Promise<WorkoutSet>;
  removeSet(id: string): Promise<void>;
  finish(workoutId: string, endedAt: string): Promise<Workout>;
  discard(workoutId: string, discardedAt: string): Promise<void>;
  delete(workoutId: string): Promise<void>;
}
