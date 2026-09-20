import { router } from 'expo-router';

import { useExerciseService } from '@/src/features/exercises/application/ExerciseServiceContext';
import { ExerciseFormScreen } from '@/src/features/exercises/screens/ExerciseFormScreen';

export default function CreateExerciseRoute() {
  const service = useExerciseService();
  return <ExerciseFormScreen service={service} onSaved={() => router.back()} />;
}
