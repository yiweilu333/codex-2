import type { AppDatabase } from './types';
import { INITIAL_MIGRATION_SQL } from './migrations/001_initial';

export async function migrateDatabase(database: AppDatabase): Promise<void> {
  await database.execAsync(INITIAL_MIGRATION_SQL);
}
