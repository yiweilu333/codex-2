import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type { ExerciseRepository } from '@/src/features/exercises/data/ExerciseRepository';

const seedDate = '2026-01-01T00:00:00.000Z';

const defineExercise = (
  slug: string,
  name: string,
  muscleGroup: Exercise['muscleGroup'],
  movementType: Exercise['movementType'],
  equipment: Exercise['equipment'],
  defaultRestSeconds: number,
): Exercise => ({
  id: `seed.exercise.${slug}`,
  name,
  muscleGroup,
  movementType,
  equipment,
  defaultRestSeconds,
  notes: null,
  isCustom: false,
  createdAt: seedDate,
  updatedAt: seedDate,
  archivedAt: null,
});

export const BUILT_IN_EXERCISES: Exercise[] = [
  defineExercise('barbell-bench-press', '杠铃卧推', 'chest', 'compound', 'barbell', 120),
  defineExercise('dumbbell-bench-press', '哑铃卧推', 'chest', 'compound', 'dumbbell', 90),
  defineExercise('incline-bench-press', '上斜卧推', 'chest', 'compound', 'barbell', 120),
  defineExercise('chest-fly', '飞鸟', 'chest', 'isolation', 'dumbbell', 75),
  defineExercise('pull-up', '引体向上', 'back', 'compound', 'bodyweight', 120),
  defineExercise('lat-pulldown', '高位下拉', 'back', 'compound', 'cable', 90),
  defineExercise('barbell-row', '杠铃划船', 'back', 'compound', 'barbell', 120),
  defineExercise('seated-row', '坐姿划船', 'back', 'compound', 'cable', 90),
  defineExercise('shoulder-press', '肩推', 'shoulders', 'compound', 'dumbbell', 120),
  defineExercise('lateral-raise', '侧平举', 'shoulders', 'isolation', 'dumbbell', 60),
  defineExercise('rear-delt-fly', '后束飞鸟', 'shoulders', 'isolation', 'dumbbell', 60),
  defineExercise('squat', '深蹲', 'legs', 'compound', 'barbell', 180),
  defineExercise('deadlift', '硬拉', 'legs', 'compound', 'barbell', 180),
  defineExercise('leg-press', '腿举', 'legs', 'compound', 'machine', 120),
  defineExercise('leg-curl', '腿弯举', 'legs', 'isolation', 'machine', 75),
  defineExercise('biceps-curl', '二头弯举', 'arms', 'isolation', 'dumbbell', 60),
  defineExercise('triceps-pushdown', '三头下压', 'arms', 'isolation', 'cable', 60),
];

export async function seedExercises(repository: ExerciseRepository): Promise<void> {
  await repository.upsertBuiltIns(BUILT_IN_EXERCISES);
}
