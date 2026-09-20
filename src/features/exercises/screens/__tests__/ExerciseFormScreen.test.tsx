import { fireEvent, render, screen } from '@testing-library/react-native';

import { ExerciseService } from '@/src/features/exercises/application/ExerciseService';
import { InMemoryExerciseRepository } from '@/src/features/exercises/data/InMemoryExerciseRepository';

import { ExerciseFormScreen } from '../ExerciseFormScreen';

describe('ExerciseFormScreen', () => {
  it('rejects a whitespace-only custom exercise name', async () => {
    const service = new ExerciseService(new InMemoryExerciseRepository());
    await render(<ExerciseFormScreen service={service} onSaved={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('动作名称'), '   ');
    await fireEvent.press(screen.getByText('保存动作'));

    expect(await screen.findByText('请输入动作名称')).toBeTruthy();
  });

  it('normalizes and saves a valid custom exercise', async () => {
    const repository = new InMemoryExerciseRepository();
    const service = new ExerciseService(repository);
    const onSaved = jest.fn();
    await render(<ExerciseFormScreen service={service} onSaved={onSaved} />);

    await fireEvent.changeText(screen.getByLabelText('动作名称'), '  绳索夹胸  ');
    await fireEvent.press(screen.getByText('保存动作'));

    expect(await screen.findByText('动作已保存')).toBeTruthy();
    expect((await repository.list())[0]).toMatchObject({
      name: '绳索夹胸',
      isCustom: true,
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
