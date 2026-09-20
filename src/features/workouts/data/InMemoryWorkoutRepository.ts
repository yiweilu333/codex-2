import { randomUUID } from 'expo-crypto';

import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type {
  SaveWorkoutSetInput,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutSummary,
} from '../domain/workout';
import type { WorkoutRepository } from './WorkoutRepository';

const cloneWorkout = (workout: Workout): Workout =>
  structuredClone(workout);

export class InMemoryWorkoutRepository implements WorkoutRepository {
  private readonly workouts = new Map<string, Workout>();

  async start(title: string, startedAt: string): Promise<Workout> {
    const workout: Workout = {
      id: randomUUID(),
      title,
      status: 'in_progress',
      startedAt,
      endedAt: null,
      durationSeconds: null,
      notes: null,
      createdAt: startedAt,
      updatedAt: startedAt,
      workoutExercises: [],
    };
    this.workouts.set(workout.id, workout);
    return cloneWorkout(workout);
  }

  async getActive(): Promise<Workout | null> {
    const workout = [...this.workouts.values()]
      .filter((item) => item.status === 'in_progress')
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0];
    return workout ? cloneWorkout(workout) : null;
  }

  async getById(id: string): Promise<Workout | null> {
    const workout = this.workouts.get(id);
    return workout ? cloneWorkout(workout) : null;
  }

  async listCompleted(): Promise<WorkoutSummary[]> {
    return [...this.workouts.values()]
      .filter((workout) => workout.status === 'completed')
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
      .map((workout) => ({
        id: workout.id,
        title: workout.title,
        status: workout.status,
        startedAt: workout.startedAt,
        endedAt: workout.endedAt,
        durationSeconds: workout.durationSeconds,
        exerciseCount: workout.workoutExercises.length,
        completedSetCount: workout.workoutExercises.reduce(
          (total, exercise) => total + exercise.sets.filter((set) => set.isCompleted).length,
          0,
        ),
      }));
  }

  async addExercise(workoutId: string, exercise: Exercise): Promise<WorkoutExercise> {
    const workout = this.requireWorkout(workoutId);
    const workoutExercise: WorkoutExercise = {
      id: randomUUID(),
      workoutId,
      exerciseId: exercise.id,
      exerciseNameSnapshot: exercise.name,
      muscleGroupSnapshot: exercise.muscleGroup,
      sortOrder: workout.workoutExercises.length,
      notes: null,
      sets: [],
    };
    workout.workoutExercises.push(workoutExercise);
    return structuredClone(workoutExercise);
  }

  async reorderExercises(workoutId: string, orderedIds: string[]): Promise<void> {
    const workout = this.requireWorkout(workoutId);
    if (orderedIds.length !== workout.workoutExercises.length) {
      throw new Error('动作顺序不完整');
    }
    const byId = new Map(workout.workoutExercises.map((item) => [item.id, item]));
    workout.workoutExercises = orderedIds.map((id, sortOrder) => {
      const item = byId.get(id);
      if (!item) throw new Error('动作不存在');
      return { ...item, sortOrder };
    });
  }

  async saveSet(input: SaveWorkoutSetInput): Promise<WorkoutSet> {
    const workoutExercise = this.requireWorkoutExercise(input.workoutExerciseId);
    const existing = workoutExercise.sets.find(
      (set) => set.id === input.id || set.setIndex === input.setIndex,
    );
    const workoutSet: WorkoutSet = {
      id: existing?.id ?? input.id ?? randomUUID(),
      workoutExerciseId: input.workoutExerciseId,
      setIndex: input.setIndex,
      setType: input.setType ?? existing?.setType ?? 'working',
      weightKg: input.weightKg,
      reps: input.reps,
      restSeconds: input.restSeconds ?? existing?.restSeconds ?? null,
      rpe: input.rpe ?? existing?.rpe ?? null,
      comment: input.comment ?? existing?.comment ?? null,
      isCompleted: input.isCompleted,
      completedAt: input.completedAt ?? existing?.completedAt ?? null,
    };
    if (existing) {
      workoutExercise.sets[workoutExercise.sets.indexOf(existing)] = workoutSet;
    } else {
      workoutExercise.sets.push(workoutSet);
    }
    workoutExercise.sets.sort((left, right) => left.setIndex - right.setIndex);
    return structuredClone(workoutSet);
  }

  async removeSet(id: string): Promise<void> {
    for (const workout of this.workouts.values()) {
      for (const exercise of workout.workoutExercises) {
        const index = exercise.sets.findIndex((set) => set.id === id);
        if (index >= 0) {
          exercise.sets.splice(index, 1);
          return;
        }
      }
    }
  }

  async finish(workoutId: string, endedAt: string): Promise<Workout> {
    const current = this.requireWorkout(workoutId);
    const durationSeconds = Math.max(
      0,
      Math.round((Date.parse(endedAt) - Date.parse(current.startedAt)) / 1000),
    );
    const completed: Workout = {
      ...current,
      status: 'completed',
      endedAt,
      durationSeconds,
      updatedAt: endedAt,
    };
    this.workouts.set(workoutId, completed);
    return cloneWorkout(completed);
  }

  async discard(workoutId: string, discardedAt: string): Promise<void> {
    const workout = this.requireWorkout(workoutId);
    this.workouts.set(workoutId, {
      ...workout,
      status: 'discarded',
      endedAt: discardedAt,
      updatedAt: discardedAt,
    });
  }

  async delete(workoutId: string): Promise<void> {
    this.workouts.delete(workoutId);
  }

  private requireWorkout(id: string): Workout {
    const workout = this.workouts.get(id);
    if (!workout) throw new Error('训练不存在');
    return workout;
  }

  private requireWorkoutExercise(id: string): WorkoutExercise {
    for (const workout of this.workouts.values()) {
      const exercise = workout.workoutExercises.find((item) => item.id === id);
      if (exercise) return exercise;
    }
    throw new Error('训练动作不存在');
  }
}
