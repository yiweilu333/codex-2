import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { openAppDatabase } from '@/src/db/client';
import { seedExercises } from '@/src/db/seed/exercises';
import { ExerciseService } from '@/src/features/exercises/application/ExerciseService';
import { ExerciseServiceProvider } from '@/src/features/exercises/application/ExerciseServiceContext';
import { SQLiteExerciseRepository } from '@/src/features/exercises/data/SQLiteExerciseRepository';
import { WorkoutRuntimeProvider, type WorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { WorkoutService } from '@/src/features/workouts/application/WorkoutService';
import { SQLiteWorkoutRepository } from '@/src/features/workouts/data/SQLiteWorkoutRepository';
import { AppText } from '@/src/shared/components/AppText';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';
import { createActiveWorkoutStore } from '@/src/stores/activeWorkoutStore';

interface RuntimeState {
  exerciseService: ExerciseService;
  workoutRuntime: WorkoutRuntime;
}

export function AppBootstrap({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const [runtime, setRuntime] = useState<RuntimeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    void openAppDatabase()
      .then(async (database) => {
        const exerciseRepository = new SQLiteExerciseRepository(database);
        const workoutRepository = new SQLiteWorkoutRepository(database);
        await seedExercises(exerciseRepository);
        const exerciseService = new ExerciseService(exerciseRepository);
        const workoutService = new WorkoutService(workoutRepository);
        const workoutRuntime = {
          service: workoutService,
          repository: workoutRepository,
          store: createActiveWorkoutStore(workoutService),
        };
        if (mounted) setRuntime({ exerciseService, workoutRuntime });
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : '数据库初始化失败');
      });
    return () => { mounted = false; };
  }, [attempt]);

  if (!runtime) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        {error ? (
          <>
            <AppText weight="bold" style={styles.title}>无法打开本地数据</AppText>
            <AppText tone="muted" style={styles.message}>{error}</AppText>
            <PrimaryButton label="重试" onPress={retry} style={styles.button} />
          </>
        ) : (
          <>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <AppText tone="muted">正在准备训练数据库…</AppText>
          </>
        )}
      </View>
    );
  }

  return (
    <ExerciseServiceProvider service={runtime.exerciseService}>
      <WorkoutRuntimeProvider value={runtime.workoutRuntime}>
        {children}
      </WorkoutRuntimeProvider>
    </ExerciseServiceProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  title: { fontSize: 22 },
  message: { textAlign: 'center' },
  button: { minWidth: 160 },
});
