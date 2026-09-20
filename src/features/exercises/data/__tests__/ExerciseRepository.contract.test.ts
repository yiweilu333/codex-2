import { seedExercises } from '@/src/db/seed/exercises';
import { customExercise, fixedNow } from '@/src/test/fixtures';

import { InMemoryExerciseRepository } from '../InMemoryExerciseRepository';

describe('ExerciseRepository contract', () => {
  it('seeds the full list once across repeated startup', async () => {
    const repository = new InMemoryExerciseRepository();

    await seedExercises(repository);
    await seedExercises(repository);

    const exercises = await repository.list({ includeArchived: false });
    expect(exercises).toHaveLength(17);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(17);
  });

  it('hides archived exercises by default but retains their data', async () => {
    const repository = new InMemoryExerciseRepository();
    const exercise = await repository.create(customExercise('绳索夹胸'));

    await repository.archive(exercise.id, fixedNow);

    expect(await repository.list()).toEqual([]);
    expect(await repository.getById(exercise.id)).toMatchObject({
      name: '绳索夹胸',
      archivedAt: fixedNow,
    });
  });
});
