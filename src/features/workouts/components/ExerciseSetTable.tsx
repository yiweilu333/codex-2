import { Pressable, StyleSheet, View } from 'react-native';

import type { WorkoutSet } from '../domain/workout';
import { NumericField } from '@/src/shared/components/NumericField';
import { AppText } from '@/src/shared/components/AppText';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

interface ExerciseSetTableProps {
  sets: WorkoutSet[];
  focusedSetIndex?: number;
  onChange(set: WorkoutSet, field: 'weightKg' | 'reps', value: string): void;
  onComplete(set: WorkoutSet): void;
  onRemove(set: WorkoutSet): void;
}

export function ExerciseSetTable({
  sets,
  focusedSetIndex,
  onChange,
  onComplete,
  onRemove,
}: ExerciseSetTableProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.table}>
      {sets.map((set) => (
        <View key={set.id} style={styles.row}>
          <AppText tone="muted" style={styles.index}>{set.setIndex}</AppText>
          <View style={styles.field}>
            <NumericField
              label="重量"
              unit="kg"
              value={set.weightKg == null ? '' : String(set.weightKg)}
              onChangeText={(value) => onChange(set, 'weightKg', value)}
            />
          </View>
          <View style={styles.field}>
            <NumericField
              label="次数"
              integer
              autoFocus={focusedSetIndex === set.setIndex}
              value={set.reps == null ? '' : String(set.reps)}
              onChangeText={(value) => onChange(set, 'reps', value)}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={set.isCompleted ? `取消完成第${set.setIndex}组` : `完成第${set.setIndex}组`}
            onPress={() => onComplete(set)}
            style={[
              styles.complete,
              { backgroundColor: set.isCompleted ? theme.colors.success : theme.colors.surfaceRaised },
            ]}>
            <AppText weight="bold">{set.isCompleted ? '✓' : '完成'}</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onRemove(set)} hitSlop={8}>
            <AppText tone="danger">删除</AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  index: { width: 18, paddingBottom: 15, textAlign: 'center' },
  field: { flex: 1 },
  complete: { minWidth: 54, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
});
