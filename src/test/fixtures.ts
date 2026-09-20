import {
  type Exercise,
  type NewExercise,
} from '@/src/features/exercises/domain/exercise';

export const fixedNow = '2026-09-20T12:00:00.000Z';

export const barbellBench: Exercise = {
  id: 'seed.exercise.barbell-bench-press',
  name: '杠铃卧推',
  muscleGroup: 'chest',
  movementType: 'compound',
  equipment: 'barbell',
  defaultRestSeconds: 120,
  notes: null,
  isCustom: false,
  createdAt: fixedNow,
  updatedAt: fixedNow,
  archivedAt: null,
};

export const dumbbellBench: Exercise = {
  ...barbellBench,
  id: 'seed.exercise.dumbbell-bench-press',
  name: '哑铃卧推',
  equipment: 'dumbbell',
};

export const barbellRow: Exercise = {
  ...barbellBench,
  id: 'seed.exercise.barbell-row',
  name: '杠铃划船',
  muscleGroup: 'back',
};

export function customExercise(name: string): NewExercise {
  return {
    name,
    muscleGroup: 'chest',
    movementType: 'isolation',
    equipment: 'cable',
    defaultRestSeconds: 90,
    notes: null,
  };
}
