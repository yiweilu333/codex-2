import { router } from 'expo-router';

import { useExerciseService } from '@/src/features/exercises/application/ExerciseServiceContext';
import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import { StartWorkoutScreen } from '@/src/features/workouts/screens/StartWorkoutScreen';

export default function StartWorkoutRoute() {
  const exerciseService = useExerciseService();
  const { service } = useWorkoutRuntime();
  return (
    <StartWorkoutScreen
      exerciseService={exerciseService}
      workoutService={service}
      onStarted={() => router.replace('/workout/active')}
    />
  );
}
