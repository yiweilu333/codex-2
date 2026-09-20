import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import type { Exercise } from '../domain/exercise';
import type { ExerciseService } from '../application/ExerciseService';
import { ExerciseListItem } from '../components/ExerciseListItem';
import { MuscleFilter } from '../components/MuscleFilter';
import { AppText } from '@/src/shared/components/AppText';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { Screen } from '@/src/shared/components/Screen';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

interface ExerciseLibraryScreenProps {
  service: ExerciseService;
  onCreate?: () => void;
  onSelect?: (exercise: Exercise) => void;
  selectedIds?: string[];
}

export function ExerciseLibraryScreen({
  service,
  onCreate,
  onSelect,
  selectedIds = [],
}: ExerciseLibraryScreenProps) {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void service
      .list({ query, muscleGroup })
      .then((result) => {
        if (!active) return;
        setExercises(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : '读取动作失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [muscleGroup, query, service]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <AppText weight="bold" style={styles.title}>动作库</AppText>
          <AppText tone="muted">快速找到动作，或创建自己的训练动作。</AppText>
        </View>
        {onCreate ? <PrimaryButton label="新建" onPress={onCreate} style={styles.createButton} /> : null}
      </View>
      <TextInput
        accessibilityLabel="搜索动作"
        placeholder="搜索动作、肌群或器械"
        placeholderTextColor={theme.colors.muted}
        value={query}
        onChangeText={setQuery}
        style={[
          styles.search,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      />
      <MuscleFilter value={muscleGroup} onChange={setMuscleGroup} />
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {error ? (
        <EmptyState title="动作库暂时不可用" message={error} />
      ) : !loading && exercises.length === 0 ? (
        <EmptyState title="没有匹配的动作" message="试试其他关键词或肌群。" />
      ) : (
        <View style={styles.list}>
          {exercises.map((exercise) => (
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              selected={selectedIds.includes(exercise.id)}
              onPress={onSelect}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingCopy: { flex: 1, gap: 4 },
  title: { fontSize: 28 },
  createButton: { minWidth: 88 },
  search: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 16 },
  list: { gap: 10 },
});
