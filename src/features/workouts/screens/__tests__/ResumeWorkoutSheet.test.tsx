import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Workout } from '@/src/features/workouts/domain/workout';
import { fixedNow } from '@/src/test/fixtures';

import { ResumeWorkoutSheet } from '../ResumeWorkoutSheet';

const workout: Workout = {
  id: 'workout-1',
  title: '胸部训练',
  status: 'in_progress',
  startedAt: fixedNow,
  endedAt: null,
  durationSeconds: null,
  notes: null,
  createdAt: fixedNow,
  updatedAt: fixedNow,
  workoutExercises: [],
};

it('offers explicit resume and discard actions', async () => {
  const onResume = jest.fn();
  const onDiscard = jest.fn();
  await render(
    <ResumeWorkoutSheet workout={workout} onResume={onResume} onDiscard={onDiscard} />,
  );

  await fireEvent.press(screen.getByText('继续训练'));
  await fireEvent.press(screen.getByText('放弃草稿'));

  expect(onResume).toHaveBeenCalledTimes(1);
  expect(onDiscard).toHaveBeenCalledTimes(1);
});
