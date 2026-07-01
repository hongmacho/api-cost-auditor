import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!db) {
    const sqlite = new Database('api-cost-auditor.db')
    sqlite.pragma('journal_mode = WAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export type Database = ReturnType<typeof getDb>
