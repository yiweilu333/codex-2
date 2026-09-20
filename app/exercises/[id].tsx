import { router, useLocalSearchParams } from 'expo-router';

import { useExerciseService } from '@/src/features/exercises/application/ExerciseServiceContext';
import { ExerciseFormScreen } from '@/src/features/exercises/screens/ExerciseFormScreen';

export default function EditExerciseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = useExerciseService();
  return (
    <ExerciseFormScreen
      service={service}
      exerciseId={id}
      onSaved={() => router.back()}
      onArchived={() => router.replace('/exercises')}
    />
  );
}
