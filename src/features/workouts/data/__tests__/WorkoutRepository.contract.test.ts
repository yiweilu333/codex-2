import { InMemoryExerciseRepository } from '@/src/features/exercises/data/InMemoryExerciseRepository';
import { customExercise, fixedNow } from '@/src/test/fixtures';

import { InMemoryWorkoutRepository } from '../InMemoryWorkoutRepository';

describe('WorkoutRepository contract', () => {
  it('keeps a workout exercise snapshot after archiving its source', async () => {
    const exercises = new InMemoryExerciseRepository();
    const workouts = new InMemoryWorkoutRepository();
    const exercise = await exercises.create(customExercise('绳索夹胸'));
    const workout = await workouts.start('胸部训练', fixedNow);

    await workouts.addExercise(workout.id, exercise);
    await exercises.archive(exercise.id, fixedNow);

    expect(
      (await workouts.getById(workout.id))?.workoutExercises[0]
        .exerciseNameSnapshot,
    ).toBe('绳索夹胸');
  });

  it('persists sets and returns completed workouts newest first', async () => {
    const exercises = new InMemoryExerciseRepository();
    const workouts = new InMemoryWorkoutRepository();
    const exercise = await exercises.create(customExercise('绳索夹胸'));
    const workout = await workouts.start('胸部训练', fixedNow);
    const workoutExercise = await workouts.addExercise(workout.id, exercise);

    await workouts.saveSet({
      workoutExerciseId: workoutExercise.id,
      setIndex: 1,
      weightKg: 20,
      reps: 12,
      isCompleted: true,
      completedAt: fixedNow,
    });
    await workouts.finish(workout.id, '2026-09-20T13:00:00.000Z');

    expect(await workouts.listCompleted()).toEqual([
      expect.objectContaining({
        id: workout.id,
        exerciseCount: 1,
        completedSetCount: 1,
      }),
    ]);
  });
});
