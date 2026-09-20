import { InMemoryWorkoutRepository } from '@/src/features/workouts/data/InMemoryWorkoutRepository';
import type { Workout } from '@/src/features/workouts/domain/workout';
import { barbellBench, fixedNow } from '@/src/test/fixtures';

import { WorkoutService } from '../WorkoutService';

const clock = { now: () => fixedNow };
const makeService = (repository: InMemoryWorkoutRepository) => {
  let id = 0;
  return new WorkoutService(repository, clock, {
    create: () => `10000000-0000-4000-8000-${String(++id).padStart(12, '0')}`,
  });
};

async function createWorkoutWithCompletedSet(service: WorkoutService): Promise<Workout> {
  const workout = await service.start('胸部训练');
  const [exercise] = await service.addExercises(workout.id, [barbellBench]);
  await service.completeSet(exercise.id, {
    setIndex: 1,
    weightKg: 80,
    reps: 8,
  });
  return (await service.resume())!;
}

describe('WorkoutService', () => {
  it('restores the exact active draft after a new service instance starts', async () => {
    const repository = new InMemoryWorkoutRepository();
    const first = makeService(repository);
    const workout = await first.start('胸部训练');
    const [exercise] = await first.addExercises(workout.id, [barbellBench]);

    await first.saveDraftSet(exercise.id, {
      setIndex: 1,
      weightKg: 80,
      reps: 8,
    });

    const second = makeService(repository);
    expect((await second.resume())?.workoutExercises[0].sets[0]).toMatchObject({
      weightKg: 80,
      reps: 8,
      isCompleted: false,
    });
  });

  it('rejects finishing a workout without a completed set', async () => {
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await service.start('胸部训练');

    await expect(service.finish(workout.id)).rejects.toThrow('至少完成一组训练');
    expect((await repository.getById(workout.id))?.status).toBe('in_progress');
  });

  it('leaves the workout active when the finish transaction fails', async () => {
    class FailingFinishWorkoutRepository extends InMemoryWorkoutRepository {
      override async finish(): Promise<Workout> {
        throw new Error('保存失败');
      }
    }

    const repository = new FailingFinishWorkoutRepository();
    const service = makeService(repository);
    const workout = await createWorkoutWithCompletedSet(service);

    await expect(service.finish(workout.id)).rejects.toThrow('保存失败');
    expect((await repository.getById(workout.id))?.status).toBe('in_progress');
  });

  it('completes a validated set and finishes the workout', async () => {
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await createWorkoutWithCompletedSet(service);

    const completed = await service.finish(workout.id);

    expect(completed.status).toBe('completed');
    expect(completed.workoutExercises[0].sets[0]).toMatchObject({
      isCompleted: true,
      completedAt: fixedNow,
    });
  });

  it('flushes multiple draft sets and can discard the session', async () => {
    const repository = new InMemoryWorkoutRepository();
    const service = makeService(repository);
    const workout = await service.start('胸部训练');
    const [exercise] = await service.addExercises(workout.id, [barbellBench]);

    await service.flushDraft([
      { workoutExerciseId: exercise.id, setIndex: 1, weightKg: 80, reps: 8 },
      { workoutExerciseId: exercise.id, setIndex: 2, weightKg: 80, reps: 7 },
    ]);
    await service.discard(workout.id);

    expect((await repository.getById(workout.id))?.status).toBe('discarded');
    expect((await repository.getById(workout.id))?.workoutExercises[0].sets).toHaveLength(2);
  });
});
