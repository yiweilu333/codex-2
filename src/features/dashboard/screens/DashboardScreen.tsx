import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { WorkoutRepository } from '@/src/features/workouts/data/WorkoutRepository';
import type { Workout, WorkoutSummary } from '@/src/features/workouts/domain/workout';
import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { Screen } from '@/src/shared/components/Screen';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

interface DashboardScreenProps {
  repository: WorkoutRepository;
  onStart(): void;
  onResume(): void;
  onOpenHistory?: () => void;
  refreshKey?: string;
}

const dateLabel = (iso: string) => new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

export function DashboardScreen({ repository, onStart, onResume, onOpenHistory, refreshKey }: DashboardScreenProps) {
  const theme = useAppTheme();
  const [active, setActive] = useState<Workout | null>(null);
  const [recent, setRecent] = useState<WorkoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    void Promise.all([repository.getActive(), repository.listCompleted()])
      .then(([draft, history]) => {
        if (!mounted) return;
        setActive(draft);
        setRecent(history.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : '读取数据失败');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [attempt, refreshKey, repository]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <AppText tone="muted">FORGE FIT</AppText>
        <AppText weight="bold" style={styles.title}>今天，练得更强。</AppText>
        <AppText tone="muted">每一组都保存在你的设备上。</AppText>
      </View>
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {error ? (
        <>
          <EmptyState title="数据暂时不可用" message={error} />
          <PrimaryButton label="重试" onPress={() => {
            setLoading(true);
            setError(null);
            setAttempt((value) => value + 1);
          }} />
        </>
      ) : null}
      {!loading && !error && active ? (
        <Card style={[styles.activeCard, { borderColor: theme.colors.primary }]}>
          <View style={styles.cardCopy}>
            <AppText tone="primary" weight="bold">训练进行中</AppText>
            <AppText weight="bold" style={styles.cardTitle}>{active.title}</AppText>
            <AppText tone="muted">{active.workoutExercises.length} 个动作 · 自动保存中</AppText>
          </View>
          <PrimaryButton label="继续训练" onPress={onResume} />
        </Card>
      ) : !loading && !error ? (
        <Card style={styles.startCard}>
          <View style={styles.cardCopy}>
            <AppText weight="bold" style={styles.cardTitle}>准备开始？</AppText>
            <AppText tone="muted">选择动作，几秒内开始记录。</AppText>
          </View>
          <PrimaryButton label="开始训练" onPress={onStart} />
        </Card>
      ) : null}
      <View style={styles.sectionHeading}>
        <AppText weight="bold" style={styles.sectionTitle}>最近训练</AppText>
        {recent && onOpenHistory ? <Pressable onPress={onOpenHistory}><AppText tone="primary">全部</AppText></Pressable> : null}
      </View>
      {recent ? (
        <Card style={styles.recentCard}>
          <View style={styles.cardCopy}>
            <AppText weight="bold">{recent.title}</AppText>
            <AppText tone="muted">{dateLabel(recent.startedAt)}</AppText>
          </View>
          <View style={styles.metrics}>
            <AppText>{recent.exerciseCount} 个动作</AppText>
            <AppText>{recent.completedSetCount} 组</AppText>
          </View>
        </Card>
      ) : !loading ? <EmptyState title="还没有训练记录" message="完成第一次训练后，这里会展示真实数据。" /> : null}
      <Card style={styles.roadmap}>
        <AppText weight="bold">下一阶段</AppText>
        <AppText tone="muted">训练容量、PR 和力量趋势将在数据积累后开放。</AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 40 },
  hero: { gap: 6, paddingVertical: 12 },
  title: { fontSize: 32, lineHeight: 39 },
  activeCard: { gap: 20 },
  startCard: { gap: 20 },
  cardCopy: { gap: 4 },
  cardTitle: { fontSize: 21 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20 },
  recentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metrics: { alignItems: 'flex-end', gap: 4 },
  roadmap: { gap: 6 },
});
