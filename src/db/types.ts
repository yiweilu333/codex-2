import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

export type AppDatabase = SQLiteDatabase;
export type DatabaseValue = SQLiteBindValue;

export interface IdGenerator {
  create(): string;
}

export interface Clock {
  now(): string;
}
