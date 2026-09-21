import { createContext, useContext, type PropsWithChildren } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import type { ActiveWorkoutState } from '@/src/stores/activeWorkoutStore';
import type { WorkoutService } from './WorkoutService';

export interface WorkoutRuntime {
  service: WorkoutService;
  store: StoreApi<ActiveWorkoutState>;
}

const WorkoutRuntimeContext = createContext<WorkoutRuntime | null>(null);

export function WorkoutRuntimeProvider({
  value,
  children,
}: PropsWithChildren<{ value: WorkoutRuntime }>) {
  return (
    <WorkoutRuntimeContext.Provider value={value}>
      {children}
    </WorkoutRuntimeContext.Provider>
  );
}

export function useWorkoutRuntime(): WorkoutRuntime {
  const value = useContext(WorkoutRuntimeContext);
  if (!value) throw new Error('WorkoutRuntimeProvider is missing');
  return value;
}
