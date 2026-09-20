import { createStore, type StoreApi } from 'zustand/vanilla';
import type { AppStateStatus } from 'react-native';

import type {
  DraftSetInput,
  DraftSetWrite,
  WorkoutService,
} from '@/src/features/workouts/application/WorkoutService';
import type { Workout, WorkoutSet } from '@/src/features/workouts/domain/workout';

export interface ActiveWorkoutState {
  workout: Workout | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  load(): Promise<void>;
  updateSetDraft(
    workoutExerciseId: string,
    setIndex: number,
    values: Omit<DraftSetInput, 'setIndex'>,
  ): void;
  flushPending(): Promise<void>;
}

interface PendingDraft extends DraftSetWrite {
  key: string;
}

const draftKey = (workoutExerciseId: string, setIndex: number) =>
  `${workoutExerciseId}:${setIndex}`;

const replaceSet = (
  workout: Workout,
  workoutExerciseId: string,
  setIndex: number,
  values: Partial<WorkoutSet>,
): Workout => ({
  ...workout,
  workoutExercises: workout.workoutExercises.map((exercise) => {
    if (exercise.id !== workoutExerciseId) return exercise;
    const current = exercise.sets.find((set) => set.setIndex === setIndex);
    const next: WorkoutSet = {
      id: current?.id ?? `draft:${workoutExerciseId}:${setIndex}`,
      workoutExerciseId,
      setIndex,
      setType: current?.setType ?? 'working',
      weightKg: current?.weightKg ?? null,
      reps: current?.reps ?? null,
      restSeconds: current?.restSeconds ?? null,
      rpe: current?.rpe ?? null,
      comment: current?.comment ?? null,
      isCompleted: current?.isCompleted ?? false,
      completedAt: current?.completedAt ?? null,
      ...values,
    };
    const sets = current
      ? exercise.sets.map((set) => (set.setIndex === setIndex ? next : set))
      : [...exercise.sets, next].sort((left, right) => left.setIndex - right.setIndex);
    return { ...exercise, sets };
  }),
});

export function createActiveWorkoutStore(
  service: WorkoutService,
): StoreApi<ActiveWorkoutState> {
  const pending = new Map<string, PendingDraft>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let store: StoreApi<ActiveWorkoutState>;

  const persist = async (key: string) => {
    const draft = pending.get(key);
    if (!draft) return;
    store.setState({ isSaving: true, error: null });
    try {
      const saved = await service.saveDraftSet(draft.workoutExerciseId, draft);
      pending.delete(key);
      const timer = timers.get(key);
      if (timer) clearTimeout(timer);
      timers.delete(key);
      const workout = store.getState().workout;
      if (workout) {
        store.setState({
          workout: replaceSet(workout, draft.workoutExerciseId, draft.setIndex, saved),
        });
      }
    } catch (error) {
      store.setState({
        error: error instanceof Error ? error.message : '保存失败',
      });
      throw error;
    } finally {
      store.setState({ isSaving: false });
    }
  };

  store = createStore<ActiveWorkoutState>((set, get) => ({
    workout: null,
    isLoading: false,
    isSaving: false,
    error: null,
    load: async () => {
      set({ isLoading: true, error: null });
      try {
        set({ workout: await service.resume() });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : '读取训练失败' });
      } finally {
        set({ isLoading: false });
      }
    },
    updateSetDraft: (workoutExerciseId, setIndex, values) => {
      const workout = get().workout;
      if (!workout) return;
      const key = draftKey(workoutExerciseId, setIndex);
      const draft: PendingDraft = { key, workoutExerciseId, setIndex, ...values };
      pending.set(key, draft);
      set({
        workout: replaceSet(workout, workoutExerciseId, setIndex, {
          weightKg: values.weightKg ?? null,
          reps: values.reps ?? null,
          isCompleted: false,
          completedAt: null,
        }),
      });
      const previousTimer = timers.get(key);
      if (previousTimer) clearTimeout(previousTimer);
      timers.set(
        key,
        setTimeout(() => {
          void persist(key).catch(() => undefined);
        }, 300),
      );
    },
    flushPending: async () => {
      for (const key of [...pending.keys()]) await persist(key);
    },
  }));

  return store;
}

export async function flushOnAppStateChange(
  store: StoreApi<ActiveWorkoutState>,
  nextState: AppStateStatus,
): Promise<void> {
  if (nextState !== 'active') {
    await store.getState().flushPending();
  }
}
