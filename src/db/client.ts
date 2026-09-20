import { openDatabaseAsync } from 'expo-sqlite';

import { migrateDatabase } from './migrate';

export async function openAppDatabase() {
  const database = await openDatabaseAsync('forge-fit.db');
  await migrateDatabase(database);
  return database;
}
