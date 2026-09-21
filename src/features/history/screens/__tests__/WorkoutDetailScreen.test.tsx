import { render, screen } from '@testing-library/react-native';

import type { Workout } from '@/src/features/workouts/domain/workout';
import { fixedNow } from '@/src/test/fixtures';

import { WorkoutDetailScreen } from '../WorkoutDetailScreen';

const workout: Workout = {
  id: 'done-1', title: '胸部训练', status: 'completed', startedAt: fixedNow,
  endedAt: fixedNow, durationSeconds: 3600, notes: null, createdAt: fixedNow,
  updatedAt: fixedNow,
  workoutExercises: [{
    id: 'we-1', workoutId: 'done-1', exerciseId: 'renamed-source',
    exerciseNameSnapshot: '杠铃卧推', muscleGroupSnapshot: 'chest', sortOrder: 0,
    notes: null, sets: [{
      id: 'set-1', workoutExerciseId: 'we-1', setIndex: 1, setType: 'working',
      weightKg: 80, reps: 8, restSeconds: null, rpe: null, comment: null,
      isCompleted: true, completedAt: fixedNow,
    }],
  }],
};

it('renders stored exercise snapshots and completed set data', async () => {
  await render(<WorkoutDetailScreen workout={workout} />);
  expect(screen.getByText('杠铃卧推')).toBeTruthy();
  expect(screen.getByText('80 kg × 8')).toBeTruthy();
});
