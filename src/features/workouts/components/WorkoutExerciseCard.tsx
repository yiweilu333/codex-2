import { Pressable, StyleSheet, View } from 'react-native';

import type { WorkoutExercise, WorkoutSet } from '../domain/workout';
import { ExerciseSetTable } from './ExerciseSetTable';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  focusedSetIndex?: number;
  onChange(set: WorkoutSet, field: 'weightKg' | 'reps', value: string): void;
  onComplete(set: WorkoutSet): void;
  onRemove(set: WorkoutSet): void;
  onAddSet(): void;
}

export function WorkoutExerciseCard(props: WorkoutExerciseCardProps) {
  const { exercise } = props;
  return (
    <Card style={styles.card}>
      <View style={styles.heading}>
        <View>
          <AppText weight="bold" style={styles.title}>{exercise.exerciseNameSnapshot}</AppText>
          <AppText tone="muted">{exercise.muscleGroupSnapshot}</AppText>
        </View>
        <AppText tone="muted">{exercise.sets.filter((set) => set.isCompleted).length}/{exercise.sets.length} 组</AppText>
      </View>
      <ExerciseSetTable
        sets={exercise.sets}
        focusedSetIndex={props.focusedSetIndex}
        onChange={props.onChange}
        onComplete={props.onComplete}
        onRemove={props.onRemove}
      />
      <Pressable accessibilityRole="button" onPress={props.onAddSet} style={styles.add}>
        <AppText tone="primary" weight="bold">添加一组</AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20 },
  add: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
