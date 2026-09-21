import { fireEvent, render, screen } from '@testing-library/react-native';

import { WorkoutService } from '@/src/features/workouts/application/WorkoutService';
import { InMemoryWorkoutRepository } from '@/src/features/workouts/data/InMemoryWorkoutRepository';
import { createActiveWorkoutStore } from '@/src/stores/activeWorkoutStore';
import { barbellBench, fixedNow } from '@/src/test/fixtures';

import { ActiveWorkoutScreen } from '../ActiveWorkoutScreen';

it('copies the previous weight, clears reps, and focuses reps when adding a set', async () => {
  const repository = new InMemoryWorkoutRepository();
  let id = 0;
  const service = new WorkoutService(repository, { now: () => fixedNow }, {
    create: () => `20000000-0000-4000-8000-${String(++id).padStart(12, '0')}`,
  });
  const workout = await service.start('胸部训练');
  const [exercise] = await service.addExercises(workout.id, [barbellBench]);
  await service.completeSet(exercise.id, { setIndex: 1, weightKg: 80, reps: 8 });
  const store = createActiveWorkoutStore(service);
  await store.getState().load();

  await render(<ActiveWorkoutScreen service={service} store={store} />);
  await fireEvent.press(screen.getByText('添加一组'));

  const weights = screen.getAllByLabelText('重量');
  const reps = screen.getAllByLabelText('次数');
  expect(weights[1]).toHaveProp('value', '80');
  expect(reps[1]).toHaveProp('value', '');
  expect(reps[1]).toHaveProp('autoFocus', true);
});

it('flushes a pending edit before marking the set completed', async () => {
  const repository = new InMemoryWorkoutRepository();
  const service = new WorkoutService(repository, { now: () => fixedNow }, {
    create: () => '30000000-0000-4000-8000-000000000001',
  });
  const workout = await service.start('胸部训练');
  const [exercise] = await service.addExercises(workout.id, [barbellBench]);
  await service.saveDraftSet(exercise.id, { setIndex: 1, weightKg: 80, reps: 8 });
  const store = createActiveWorkoutStore(service);
  await store.getState().load();

  await render(<ActiveWorkoutScreen service={service} store={store} />);
  await fireEvent.changeText(screen.getByLabelText('次数'), '9');
  await fireEvent.press(screen.getByLabelText('完成第1组'));
  await new Promise((resolve) => setTimeout(resolve, 350));

  expect((await service.resume())?.workoutExercises[0].sets[0]).toMatchObject({
    reps: 9,
    isCompleted: true,
  });
});
