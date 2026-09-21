import { useEffect, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import type { StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';

import type { WorkoutService } from '../application/WorkoutService';
import type { WorkoutSet } from '../domain/workout';
import { parseNumericInput } from '../domain/workoutRules';
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard';
import type { ActiveWorkoutState } from '@/src/stores/activeWorkoutStore';
import { flushOnAppStateChange } from '@/src/stores/activeWorkoutStore';
import { AppText } from '@/src/shared/components/AppText';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { Screen } from '@/src/shared/components/Screen';

interface ActiveWorkoutScreenProps {
  service: WorkoutService;
  store: StoreApi<ActiveWorkoutState>;
  onAddExercise?: () => void;
  onFinish?: () => void;
  onBack?: () => void;
}

const elapsedLabel = (startedAt: string, now: number) => {
  const seconds = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

export function ActiveWorkoutScreen({ service, store, onAddExercise, onFinish, onBack }: ActiveWorkoutScreenProps) {
  const state = useStore(store);
  const [now, setNow] = useState(Date.now());
  const [focused, setFocused] = useState<string>();

  useEffect(() => {
    void store.getState().load();
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const subscription = AppState.addEventListener('change', (next) => {
      void flushOnAppStateChange(store, next);
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
      void store.getState().flushPending();
    };
  }, [store]);

  const workout = state.workout;
  if (!workout) {
    return <Screen><EmptyState title="暂无进行中的训练" message="从训练页选择动作开始。" /></Screen>;
  }

  const changeSet = (set: WorkoutSet, field: 'weightKg' | 'reps', value: string) => {
    const currentWeight = field === 'weightKg' ? parseNumericInput(value) : set.weightKg ?? undefined;
    const currentReps = field === 'reps' ? parseNumericInput(value) : set.reps ?? undefined;
    store.getState().updateSetDraft(set.workoutExerciseId, set.setIndex, {
      weightKg: currentWeight,
      reps: currentReps,
    });
  };

  const completeSet = async (set: WorkoutSet) => {
    if (set.isCompleted) return;
    try {
      await service.completeSet(set.workoutExerciseId, {
        setIndex: set.setIndex,
        weightKg: set.weightKg ?? undefined,
        reps: set.reps ?? undefined,
      });
      await store.getState().load();
    } catch (error) {
      Alert.alert('无法完成该组', error instanceof Error ? error.message : '请检查输入');
    }
  };

  const finish = async () => {
    try {
      await store.getState().flushPending();
      await service.finish(workout.id);
      await store.getState().load();
      onFinish?.();
    } catch (error) {
      Alert.alert('暂时无法结束训练', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack}><AppText tone="primary">返回</AppText></Pressable>
        <View style={styles.headerCopy}>
          <AppText weight="bold" style={styles.title}>{workout.title}</AppText>
          <AppText tone="muted">{elapsedLabel(workout.startedAt, now)}</AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={onAddExercise}><AppText tone="primary">加动作</AppText></Pressable>
      </View>
      {workout.workoutExercises.map((exercise) => (
        <WorkoutExerciseCard
          key={exercise.id}
          exercise={exercise}
          focusedSetIndex={focused?.startsWith(`${exercise.id}:`) ? Number(focused.split(':')[1]) : undefined}
          onChange={changeSet}
          onComplete={(set) => void completeSet(set)}
          onRemove={(set) => {
            void service.removeSet(set.id).then(() => store.getState().load());
          }}
          onAddSet={() => {
            const previous = exercise.sets.at(-1);
            const nextIndex = (previous?.setIndex ?? 0) + 1;
            setFocused(`${exercise.id}:${nextIndex}`);
            store.getState().updateSetDraft(exercise.id, nextIndex, {
              weightKg: previous?.weightKg ?? undefined,
              reps: undefined,
            });
          }}
        />
      ))}
      <PrimaryButton label="完成训练" onPress={() => void finish()} loading={state.isSaving} />
      <AppText tone="muted" style={styles.hint}>离开页面不会丢失，本地草稿会自动保存。</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { alignItems: 'center', gap: 2 },
  title: { fontSize: 22 },
  hint: { textAlign: 'center', fontSize: 13 },
});
