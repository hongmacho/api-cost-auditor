import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let db: BetterSQLite3Database<typeof schema> | null = null

export function getDb() {
  if (!db) {
    const sqlite = new Database('api-cost-auditor.db')
    sqlite.pragma('journal_mode = WAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export type Database = ReturnType<typeof getDb>
