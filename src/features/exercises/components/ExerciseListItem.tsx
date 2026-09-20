import { Pressable, StyleSheet, View } from 'react-native';

import type { Exercise } from '../domain/exercise';
import { Card } from '@/src/shared/components/Card';
import { AppText } from '@/src/shared/components/AppText';

const muscleLabels: Record<Exercise['muscleGroup'], string> = {
  chest: '胸',
  back: '背',
  shoulders: '肩',
  legs: '腿',
  arms: '手臂',
  core: '核心',
  full_body: '全身',
};

const equipmentLabels: Record<Exercise['equipment'], string> = {
  barbell: '杠铃',
  dumbbell: '哑铃',
  cable: '绳索',
  machine: '器械',
  bodyweight: '自重',
  other: '其他',
};

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress?: (exercise: Exercise) => void;
  selected?: boolean;
}

export function ExerciseListItem({ exercise, onPress, selected }: ExerciseListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}，${muscleLabels[exercise.muscleGroup]}`}
      onPress={() => onPress?.(exercise)}>
      <Card style={[styles.card, selected && styles.selected]}>
        <View style={styles.copy}>
          <AppText weight="bold">{exercise.name}</AppText>
          <AppText tone="muted" style={styles.meta}>
            {muscleLabels[exercise.muscleGroup]} · {equipmentLabels[exercise.equipment]} · 休息 {exercise.defaultRestSeconds} 秒
          </AppText>
        </View>
        <AppText tone={exercise.isCustom ? 'primary' : 'muted'} style={styles.badge}>
          {exercise.isCustom ? '自定义' : '内置'}
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selected: { borderColor: '#65AFFF', borderWidth: 2 },
  copy: { flex: 1, gap: 5 },
  meta: { fontSize: 12 },
  badge: { fontSize: 12 },
});
