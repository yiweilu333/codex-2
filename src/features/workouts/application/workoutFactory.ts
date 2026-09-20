import { randomUUID } from 'expo-crypto';

import type { Clock, IdGenerator } from '@/src/db/types';

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

export const uuidGenerator: IdGenerator = {
  create: () => randomUUID(),
};
