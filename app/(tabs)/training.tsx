import { router, usePathname } from 'expo-router';

import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { WorkoutHistoryScreen } from '@/src/features/history/screens/WorkoutHistoryScreen';

export default function TrainingRoute() {
  const { repository } = useWorkoutRuntime();
  const pathname = usePathname();
  return (
    <WorkoutHistoryScreen
      repository={repository}
      refreshKey={pathname}
      onSelect={(id) => router.push(`/workout/${id}`)}
      onOpenExercises={() => router.push('/exercises')}
    />
  );
}
