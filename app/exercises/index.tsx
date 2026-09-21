import { router, useLocalSearchParams } from 'expo-router';

import { useExerciseService } from '@/src/features/exercises/application/ExerciseServiceContext';
import { ExerciseLibraryScreen } from '@/src/features/exercises/screens/ExerciseLibraryScreen';
import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';

export default function ExerciseLibraryRoute() {
  const service = useExerciseService();
  const workoutRuntime = useWorkoutRuntime();
  const { mode, workoutId } = useLocalSearchParams<{ mode?: string; workoutId?: string }>();
  return (
    <ExerciseLibraryScreen
      service={service}
      onCreate={() => router.push('/exercises/create')}
      onSelect={(exercise) => {
        if (mode === 'pick' && workoutId) {
          void workoutRuntime.service.addExercises(workoutId, [exercise]).then(async ([added]) => {
            await workoutRuntime.service.saveDraftSet(added.id, { setIndex: 1 });
            await workoutRuntime.store.getState().load();
            router.back();
          });
          return;
        }
        router.push(`/exercises/${exercise.id}`);
      }}
    />
  );
}
