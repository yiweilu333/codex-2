import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useWorkoutRuntime } from '@/src/features/workouts/application/WorkoutRuntimeContext';
import type { Workout } from '@/src/features/workouts/domain/workout';
import { WorkoutDetailScreen } from '@/src/features/history/screens/WorkoutDetailScreen';
import { Screen } from '@/src/shared/components/Screen';

export default function WorkoutDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repository } = useWorkoutRuntime();
  const [workout, setWorkout] = useState<Workout | null | undefined>();

  useEffect(() => {
    let mounted = true;
    void repository.getById(id).then((item) => {
      if (mounted) setWorkout(item);
    });
    return () => { mounted = false; };
  }, [id, repository]);

  if (workout === undefined) return <Screen><ActivityIndicator /></Screen>;
  return <WorkoutDetailScreen workout={workout} />;
}
