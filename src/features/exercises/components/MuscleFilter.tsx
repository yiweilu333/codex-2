import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/src/shared/components/AppText';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

const options = [
  { value: undefined, label: '全部' },
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'shoulders', label: '肩' },
  { value: 'legs', label: '腿' },
  { value: 'arms', label: '手臂' },
] as const;

interface MuscleFilterProps {
  value?: string;
  onChange(value?: string): void;
}

export function MuscleFilter({ value, onChange }: MuscleFilterProps) {
  const theme = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.lg,
              },
            ]}>
            <AppText style={{ color: active ? theme.colors.primaryText : theme.colors.text }} weight={active ? 'bold' : 'regular'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: { minHeight: 44, minWidth: 54, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
