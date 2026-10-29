import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'shopforge',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    }

export const pool = new Pool(poolConfig)

let isConnectedToPostgres = false

// Helper query function that routes to PostgreSQL
export const query = async (text, params) => {
  return pool.query(text, params)
}

export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()')
    isConnectedToPostgres = true
    console.log('✅ PostgreSQL connected successfully at:', res.rows[0].now)
    return true
  } catch (err) {
    isConnectedToPostgres = false
    console.warn('⚠️  PostgreSQL connection unavailable. Falling back to local high-fidelity memory store.')
    console.warn('   Ensure PostgreSQL is running and credentials in server/.env are valid for persistent DB.')
    return false
  }
}

export { isConnectedToPostgres }
export default { pool, query, testConnection }
