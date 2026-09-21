import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Workout, WorkoutSummary } from '@/src/features/workouts/domain/workout';
import type { WorkoutRepository } from '@/src/features/workouts/data/WorkoutRepository';
import { fixedNow } from '@/src/test/fixtures';

import { DashboardScreen } from '../DashboardScreen';

const activeWorkout: Workout = {
  id: 'active-1', title: '胸部训练', status: 'in_progress', startedAt: fixedNow,
  endedAt: null, durationSeconds: null, notes: null, createdAt: fixedNow,
  updatedAt: fixedNow, workoutExercises: [],
};

const repository = {
  getActive: jest.fn(async () => activeWorkout),
  listCompleted: jest.fn(async (): Promise<WorkoutSummary[]> => []),
} as unknown as WorkoutRepository;

it('prioritizes continuing an active workout over starting a new one', async () => {
  const onResume = jest.fn();
  await render(<DashboardScreen repository={repository} onStart={jest.fn()} onResume={onResume} />);

  await fireEvent.press(await screen.findByText('继续训练'));
  expect(screen.queryByText('开始训练')).toBeNull();
  expect(onResume).toHaveBeenCalledTimes(1);
});
