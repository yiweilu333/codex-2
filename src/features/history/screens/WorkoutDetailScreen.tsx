import { StyleSheet, View } from 'react-native';

import type { Workout } from '@/src/features/workouts/domain/workout';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { Screen } from '@/src/shared/components/Screen';

export function WorkoutDetailScreen({ workout }: { workout: Workout | null }) {
  if (!workout) return <Screen><EmptyState title="找不到训练" message="这条训练可能已被删除。" /></Screen>;
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.heading}>
        <AppText weight="bold" style={styles.title}>{workout.title}</AppText>
        <AppText tone="muted">{new Date(workout.startedAt).toLocaleString('zh-CN')}</AppText>
      </View>
      {workout.workoutExercises.map((exercise) => (
        <Card key={exercise.id} style={styles.exercise}>
          <View style={styles.exerciseHeading}>
            <AppText weight="bold" style={styles.exerciseTitle}>{exercise.exerciseNameSnapshot}</AppText>
            <AppText tone="muted">{exercise.sets.filter((set) => set.isCompleted).length} 组</AppText>
          </View>
          {exercise.sets.filter((set) => set.isCompleted).map((set) => (
            <View key={set.id} style={styles.setRow}>
              <AppText tone="muted">第 {set.setIndex} 组</AppText>
              <AppText weight="medium">{set.weightKg ?? 0} kg × {set.reps ?? 0}</AppText>
              {set.rpe ? <AppText tone="muted">RPE {set.rpe}</AppText> : null}
            </View>
          ))}
        </Card>
      ))}
      {workout.notes ? <Card><AppText>{workout.notes}</AppText></Card> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 40 },
  heading: { gap: 4 },
  title: { fontSize: 28 },
  exercise: { gap: 14 },
  exerciseHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseTitle: { fontSize: 20 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
