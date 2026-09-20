import { InMemoryWorkoutRepository } from '@/src/features/workouts/data/InMemoryWorkoutRepository';
import { WorkoutService } from '@/src/features/workouts/application/WorkoutService';
import { barbellBench, fixedNow } from '@/src/test/fixtures';

import {
  createActiveWorkoutStore,
  flushOnAppStateChange,
} from '../activeWorkoutStore';

const makeService = (repository: InMemoryWorkoutRepository) => {
  let id = 0;
  return new WorkoutService(
    repository,
    { now: () => fixedNow },
    { create: () => `10000000-0000-4000-8000-${String(++id).padStart(12, '0')}` },
  );
};

describe('activeWorkoutStore', () => {
  it('updates draft input immediately and flushes it on demand', async () => {
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await service.start('胸部训练');
    const [exercise] = await service.addExercises(workout.id, [barbellBench]);
    const store = createActiveWorkoutStore(service);
    await store.getState().load();

    store.getState().updateSetDraft(exercise.id, 1, { weightKg: 80, reps: 8 });

    expect(store.getState().workout?.workoutExercises[0].sets[0]).toMatchObject({
      weightKg: 80,
      reps: 8,
    });
    await store.getState().flushPending();
    expect((await repository.getActive())?.workoutExercises[0].sets[0]).toMatchObject({
      weightKg: 80,
      reps: 8,
    });
  });

  it('writes a pending draft after 300 milliseconds', async () => {
    jest.useFakeTimers();
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await service.start('胸部训练');
    const [exercise] = await service.addExercises(workout.id, [barbellBench]);
    const store = createActiveWorkoutStore(service);
    await store.getState().load();

    store.getState().updateSetDraft(exercise.id, 1, { weightKg: 82.5, reps: 6 });
    await jest.advanceTimersByTimeAsync(300);

    expect((await repository.getActive())?.workoutExercises[0].sets[0]).toMatchObject({
      weightKg: 82.5,
      reps: 6,
    });
    jest.useRealTimers();
  });

  it('flushes pending input before the app enters the background', async () => {
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await service.start('胸部训练');
    const [exercise] = await service.addExercises(workout.id, [barbellBench]);
    const store = createActiveWorkoutStore(service);
    await store.getState().load();
    store.getState().updateSetDraft(exercise.id, 1, { weightKg: 85, reps: 5 });

    await flushOnAppStateChange(store, 'background');

    expect((await repository.getActive())?.workoutExercises[0].sets[0]).toMatchObject({
      weightKg: 85,
      reps: 5,
    });
  });
});
