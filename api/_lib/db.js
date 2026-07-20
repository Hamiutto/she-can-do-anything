import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  console.warn('[db] DATABASE_URL is not configured.')
}

const globalForPg = globalThis

export const pool =
  globalForPg.__sheCanDoAnythingPool ||
  new Pool({
    connectionString,
    max: 3,
    ssl: connectionString?.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  })

if (!globalForPg.__sheCanDoAnythingPool) {
  globalForPg.__sheCanDoAnythingPool = pool
}

export function query(text, params = []) {
  return pool.query(text, params)
}
