import { createContext, type PropsWithChildren, useContext } from 'react';

import type { ExerciseService } from './ExerciseService';

const ExerciseServiceContext = createContext<ExerciseService | null>(null);

export function ExerciseServiceProvider({
  service,
  children,
}: PropsWithChildren<{ service: ExerciseService }>) {
  return (
    <ExerciseServiceContext.Provider value={service}>
      {children}
    </ExerciseServiceContext.Provider>
  );
}

export function useExerciseService(): ExerciseService {
  const service = useContext(ExerciseServiceContext);
  if (!service) throw new Error('ExerciseServiceProvider 尚未初始化');
  return service;
}
