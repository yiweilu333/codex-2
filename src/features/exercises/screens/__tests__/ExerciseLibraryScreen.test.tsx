import { fireEvent, render, screen } from '@testing-library/react-native';

import { ExerciseService } from '@/src/features/exercises/application/ExerciseService';
import { InMemoryExerciseRepository } from '@/src/features/exercises/data/InMemoryExerciseRepository';
import { barbellBench, barbellRow, dumbbellBench } from '@/src/test/fixtures';

import { ExerciseLibraryScreen } from '../ExerciseLibraryScreen';

async function renderExerciseLibrary() {
  const repository = new InMemoryExerciseRepository();
  await repository.upsertBuiltIns([barbellBench, dumbbellBench, barbellRow]);
  const service = new ExerciseService(repository);
  await render(<ExerciseLibraryScreen service={service} />);
}

describe('ExerciseLibraryScreen', () => {
  it('filters exercises by search text and muscle group together', async () => {
    await renderExerciseLibrary();
    expect(await screen.findByText('杠铃卧推')).toBeTruthy();

    await fireEvent.press(screen.getByText('胸'));
    await fireEvent.changeText(
      screen.getByPlaceholderText('搜索动作、肌群或器械'),
      '杠铃',
    );

    expect(await screen.findByText('杠铃卧推')).toBeTruthy();
    expect(screen.queryByText('哑铃卧推')).toBeNull();
    expect(screen.queryByText('杠铃划船')).toBeNull();
  });

  it('shows a clear empty result state', async () => {
    await renderExerciseLibrary();

    await fireEvent.changeText(
      screen.getByPlaceholderText('搜索动作、肌群或器械'),
      '不存在的动作',
    );

    expect(await screen.findByText('没有匹配的动作')).toBeTruthy();
  });
});
