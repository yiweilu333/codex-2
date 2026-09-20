import { router } from 'expo-router';

import { useExerciseService } from '@/src/features/exercises/application/ExerciseServiceContext';
import { ExerciseLibraryScreen } from '@/src/features/exercises/screens/ExerciseLibraryScreen';

export default function ExerciseLibraryRoute() {
  const service = useExerciseService();
  return (
    <ExerciseLibraryScreen
      service={service}
      onCreate={() => router.push('/exercises/create')}
      onSelect={(exercise) => router.push(`/exercises/${exercise.id}`)}
    />
  );
}
