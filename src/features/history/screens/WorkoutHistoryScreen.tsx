import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { WorkoutRepository } from '@/src/features/workouts/data/WorkoutRepository';
import type { WorkoutSummary } from '@/src/features/workouts/domain/workout';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { Screen } from '@/src/shared/components/Screen';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

interface WorkoutHistoryScreenProps {
  repository: WorkoutRepository;
  onSelect?: (id: string) => void;
  onOpenExercises?: () => void;
  refreshKey?: string;
}

const durationLabel = (seconds: number | null) => {
  if (seconds == null) return '—';
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分` : `${minutes} 分钟`;
};

export function WorkoutHistoryScreen({ repository, onSelect, onOpenExercises, refreshKey }: WorkoutHistoryScreenProps) {
  const theme = useAppTheme();
  const [items, setItems] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void repository.listCompleted()
      .then((history) => {
        if (mounted) setItems([...history].sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : '读取历史失败');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [refreshKey, repository]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <AppText weight="bold" style={styles.title}>训练历史</AppText>
          <AppText tone="muted">所有已完成训练都保存在本机。</AppText>
        </View>
        {onOpenExercises ? <Pressable onPress={onOpenExercises}><AppText tone="primary">动作库</AppText></Pressable> : null}
      </View>
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {error ? <EmptyState title="无法读取历史" message={error} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="暂无历史记录" message="完成训练后会出现在这里。" /> : null}
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onSelect?.(item.id)}>
            <Card style={styles.item}>
              <View style={styles.itemCopy}>
                <AppText testID="history-title" weight="bold" style={styles.itemTitle}>{item.title}</AppText>
                <AppText tone="muted">{new Date(item.startedAt).toLocaleDateString('zh-CN')}</AppText>
              </View>
              <View style={styles.metrics}>
                <AppText>{item.exerciseCount} 动作 · {item.completedSetCount} 组</AppText>
                <AppText tone="muted">{durationLabel(item.durationSeconds)}</AppText>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 40 },
  heading: { gap: 4 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28 },
  list: { gap: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCopy: { gap: 4 },
  itemTitle: { fontSize: 18 },
  metrics: { alignItems: 'flex-end', gap: 4 },
});
