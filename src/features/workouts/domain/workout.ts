export type WorkoutStatus = 'draft' | 'in_progress' | 'completed' | 'discarded';

export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setIndex: number;
  setType: SetType;
  weightKg: number | null;
  reps: number | null;
  restSeconds: number | null;
  rpe: number | null;
  comment: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseNameSnapshot: string;
  muscleGroupSnapshot: string;
  sortOrder: number;
  notes: string | null;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  title: string;
  status: WorkoutStatus;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workoutExercises: WorkoutExercise[];
}

export interface WorkoutSummary {
  id: string;
  title: string;
  status: WorkoutStatus;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  exerciseCount: number;
  completedSetCount: number;
}

export interface SaveWorkoutSetInput {
  id?: string;
  workoutExerciseId: string;
  setIndex: number;
  setType?: SetType;
  weightKg: number | null;
  reps: number | null;
  restSeconds?: number | null;
  rpe?: number | null;
  comment?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
}
