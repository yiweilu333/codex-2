import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { ExerciseService } from '@/src/features/exercises/application/ExerciseService';
import type { Exercise } from '@/src/features/exercises/domain/exercise';
import type { WorkoutService } from '../application/WorkoutService';
import type { Workout } from '../domain/workout';
import { ResumeWorkoutSheet } from './ResumeWorkoutSheet';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { Screen } from '@/src/shared/components/Screen';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

interface StartWorkoutScreenProps {
  exerciseService: ExerciseService;
  workoutService: WorkoutService;
  onStarted(workout: Workout): void;
}

export function StartWorkoutScreen({ exerciseService, workoutService, onStarted }: StartWorkoutScreenProps) {
  const theme = useAppTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [active, setActive] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([exerciseService.list(), workoutService.resume()])
      .then(([items, draft]) => {
        if (!mounted) return;
        setExercises(items);
        setActive(draft);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '加载失败'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [exerciseService, workoutService]);

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
  };

  const start = async () => {
    try {
      setLoading(true);
      const workout = await workoutService.start('自由训练');
      const added = await workoutService.addExercises(workout.id, selected);
      await workoutService.flushDraft(
        added.map((item) => ({ workoutExerciseId: item.id, setIndex: 1 })),
      );
      onStarted((await workoutService.resume())!);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '开始训练失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && exercises.length === 0) return <Screen><ActivityIndicator color={theme.colors.primary} /></Screen>;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.heading}>
        <AppText weight="bold" style={styles.title}>开始训练</AppText>
        <AppText tone="muted">选择动作后即可进入快速记录。</AppText>
      </View>
      {active ? (
        <ResumeWorkoutSheet
          workout={active}
          onResume={() => onStarted(active)}
          onDiscard={() => {
            void workoutService.discard(active.id).then(() => setActive(null));
          }}
        />
      ) : null}
      {selected.length ? (
        <Card style={styles.selectedCard}>
          <AppText weight="bold">训练顺序</AppText>
          {selected.map((exercise, index) => (
            <View key={exercise.id} style={styles.selectedRow}>
              <AppText style={styles.selectedName}>{index + 1}. {exercise.name}</AppText>
              <Pressable onPress={() => move(index, -1)}><AppText tone="primary">上移</AppText></Pressable>
              <Pressable onPress={() => move(index, 1)}><AppText tone="primary">下移</AppText></Pressable>
            </View>
          ))}
        </Card>
      ) : null}
      <View style={styles.list}>
        {exercises.map((exercise) => {
          const chosen = selected.some((item) => item.id === exercise.id);
          return (
            <Pressable
              key={exercise.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: chosen }}
              onPress={() => setSelected((current) => chosen
                ? current.filter((item) => item.id !== exercise.id)
                : [...current, exercise])}>
              <Card style={[styles.exercise, chosen && { borderColor: theme.colors.primary }]}>
                <View>
                  <AppText weight="medium">{exercise.name}</AppText>
                  <AppText tone="muted">{exercise.muscleGroup} · {exercise.equipment}</AppText>
                </View>
                <AppText tone={chosen ? 'primary' : 'muted'}>{chosen ? '已选' : '选择'}</AppText>
              </Card>
            </Pressable>
          );
        })}
      </View>
      {error ? <EmptyState title="无法开始训练" message={error} /> : null}
      <PrimaryButton label={`开始训练 · ${selected.length} 个动作`} disabled={!selected.length || Boolean(active)} loading={loading} onPress={() => void start()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  heading: { gap: 4 },
  title: { fontSize: 28 },
  selectedCard: { gap: 10 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectedName: { flex: 1 },
  list: { gap: 10 },
  exercise: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
