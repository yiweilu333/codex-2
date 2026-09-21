import { render, screen } from '@testing-library/react-native';

import type { WorkoutRepository } from '@/src/features/workouts/data/WorkoutRepository';

import { WorkoutHistoryScreen } from '../WorkoutHistoryScreen';

const repository = {
  listCompleted: jest.fn(async () => [
    { id: 'old', title: '旧训练', status: 'completed', startedAt: '2026-09-01T10:00:00Z', endedAt: '2026-09-01T11:00:00Z', durationSeconds: 3600, exerciseCount: 2, completedSetCount: 6 },
    { id: 'new', title: '最新训练', status: 'completed', startedAt: '2026-09-20T10:00:00Z', endedAt: '2026-09-20T11:00:00Z', durationSeconds: 3600, exerciseCount: 3, completedSetCount: 9 },
  ]),
} as unknown as WorkoutRepository;

it('sorts completed workouts newest first', async () => {
  await render(<WorkoutHistoryScreen repository={repository} />);
  const titles = await screen.findAllByTestId('history-title');
  expect(titles.map((item) => item.props.children)).toEqual(['最新训练', '旧训练']);
});
