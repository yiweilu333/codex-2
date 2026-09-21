import { router } from 'expo-router';

import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { ActiveWorkoutScreen } from '@/src/features/workouts/screens/ActiveWorkoutScreen';

export default function ActiveWorkoutRoute() {
  const runtime = useWorkoutRuntime();
  return (
    <ActiveWorkoutScreen
      {...runtime}
      onBack={() => router.back()}
      onAddExercise={() => router.push('/exercises')}
      onFinish={() => router.replace('/history')}
    />
  );
}
