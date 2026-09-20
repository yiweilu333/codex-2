export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'legs'
  | 'arms'
  | 'core'
  | 'full_body';

export type MovementType = 'compound' | 'isolation';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementType: MovementType;
  equipment: Equipment;
  defaultRestSeconds: number;
  notes: string | null;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export type NewExercise = Pick<
  Exercise,
  'name' | 'muscleGroup' | 'movementType' | 'equipment' | 'defaultRestSeconds' | 'notes'
>;

export type UpdateExercise = Partial<NewExercise>;
