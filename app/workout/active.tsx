import { router } from 'expo-router';

import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { ActiveWorkoutScreen } from '@/src/features/workouts/screens/ActiveWorkoutScreen';

export default function ActiveWorkoutRoute() {
  const runtime = useWorkoutRuntime();
  return (
    <ActiveWorkoutScreen
      {...runtime}
      onBack={() => router.back()}
      onAddExercise={() => {
        const workoutId = runtime.store.getState().workout?.id;
        if (workoutId) router.push({ pathname: '/exercises', params: { mode: 'pick', workoutId } });
      }}
      onFinish={() => router.replace('/training')}
    />
  );
}
