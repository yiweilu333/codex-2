import { Pressable, StyleSheet, View } from 'react-native';

import type { Workout } from '../domain/workout';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';

interface ResumeWorkoutSheetProps {
  workout: Workout;
  onResume(): void;
  onDiscard(): void;
}

export function ResumeWorkoutSheet({ workout, onResume, onDiscard }: ResumeWorkoutSheetProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <AppText weight="bold" style={styles.title}>发现未完成训练</AppText>
        <AppText tone="muted">{workout.title} · {workout.workoutExercises.length} 个动作</AppText>
      </View>
      <PrimaryButton label="继续训练" onPress={onResume} />
      <Pressable accessibilityRole="button" onPress={onDiscard} style={styles.discard}>
        <AppText tone="danger" weight="medium">放弃草稿</AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  copy: { gap: 4 },
  title: { fontSize: 20 },
  discard: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
