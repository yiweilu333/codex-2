import { router, usePathname } from 'expo-router';

import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { DashboardScreen } from '@/src/features/dashboard/screens/DashboardScreen';

export default function DashboardRoute() {
  const { repository } = useWorkoutRuntime();
  const pathname = usePathname();
  return (
    <DashboardScreen
      repository={repository}
      refreshKey={pathname}
      onStart={() => router.push('/workout/start')}
      onResume={() => router.push('/workout/active')}
      onOpenHistory={() => router.push('/training')}
    />
  );
}
