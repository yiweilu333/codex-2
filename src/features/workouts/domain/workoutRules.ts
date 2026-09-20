import {
  completableSetSchema,
  type CompletableSet,
} from './workoutSetSchema';

export function parseNumericInput(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function validateCompletableSet(input: {
  weightKg?: number;
  reps?: number;
}): CompletableSet {
  return completableSetSchema.parse(input);
}

export function canFinishWorkout(workout: {
  workoutExercises: { sets: { isCompleted: boolean }[] }[];
}): boolean {
  return workout.workoutExercises.some((exercise) =>
    exercise.sets.some((set) => set.isCompleted),
  );
}
