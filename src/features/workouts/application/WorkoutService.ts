import type { Clock, IdGenerator } from '@/src/db/types';
import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type { WorkoutRepository } from '../data/WorkoutRepository';
import type { Workout, WorkoutExercise, WorkoutSet } from '../domain/workout';
import { canFinishWorkout, validateCompletableSet } from '../domain/workoutRules';
import { systemClock, uuidGenerator } from './workoutFactory';

export interface DraftSetInput {
  setIndex: number;
  weightKg?: number;
  reps?: number;
}

export interface DraftSetWrite extends DraftSetInput {
  workoutExerciseId: string;
}

export class WorkoutService {
  constructor(
    private readonly workouts: WorkoutRepository,
    private readonly clock: Clock = systemClock,
    private readonly ids: IdGenerator = uuidGenerator,
  ) {}

  async start(title: string): Promise<Workout> {
    const normalized = title.trim();
    if (!normalized) throw new Error('请输入训练名称');
    return this.workouts.start(normalized, this.clock.now());
  }

  async resume(): Promise<Workout | null> {
    return this.workouts.getActive();
  }

  async addExercises(workoutId: string, exercises: Exercise[]): Promise<WorkoutExercise[]> {
    const added: WorkoutExercise[] = [];
    for (const exercise of exercises) {
      added.push(await this.workouts.addExercise(workoutId, exercise));
    }
    return added;
  }

  async saveDraftSet(workoutExerciseId: string, input: DraftSetInput): Promise<WorkoutSet> {
    return this.workouts.saveSet({
      id: this.ids.create(),
      workoutExerciseId,
      setIndex: input.setIndex,
      weightKg: input.weightKg ?? null,
      reps: input.reps ?? null,
      isCompleted: false,
      completedAt: null,
    });
  }

  async flushDraft(entries: DraftSetWrite[]): Promise<WorkoutSet[]> {
    const saved: WorkoutSet[] = [];
    for (const entry of entries) {
      saved.push(await this.saveDraftSet(entry.workoutExerciseId, entry));
    }
    return saved;
  }

  async completeSet(workoutExerciseId: string, input: DraftSetInput): Promise<WorkoutSet> {
    const values = validateCompletableSet(input);
    return this.workouts.saveSet({
      id: this.ids.create(),
      workoutExerciseId,
      setIndex: input.setIndex,
      weightKg: values.weightKg,
      reps: values.reps,
      isCompleted: true,
      completedAt: this.clock.now(),
    });
  }

  async finish(workoutId: string): Promise<Workout> {
    const workout = await this.workouts.getById(workoutId);
    if (!workout) throw new Error('训练不存在');
    if (!canFinishWorkout(workout)) throw new Error('至少完成一组训练');
    return this.workouts.finish(workoutId, this.clock.now());
  }

  async discard(workoutId: string): Promise<void> {
    await this.workouts.discard(workoutId, this.clock.now());
  }

  async removeSet(setId: string): Promise<void> {
    await this.workouts.removeSet(setId);
  }
}
