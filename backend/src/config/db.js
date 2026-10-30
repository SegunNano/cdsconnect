import pg from 'pg'
import { DATABASE_URL, NODE_ENV } from './env.js'

const { Pool, types } = pg

// Prevent pg from converting DATE to JavaScript Date object
// Return it as a plain string instead
types.setTypeParser(1082, (val) => val)

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
})

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
})

pool.on('connect', () => {
    console.log('PostgreSQL connected')
})

// --- DATABASE ACTIVITY TRACKER ---
let lastDbActivity = Date.now()

// Save the original query method
const originalQuery = pool.query.bind(pool)

// Override pool.query so it automatically updates the timestamp on EVERY call
pool.query = async (...args) => {
    lastDbActivity = Date.now()
    return originalQuery(...args)
}

// Helper to check how long it's been since the database was last hit
export function getLastDbActivity() {
    return lastDbActivity
}
// ---------------------------------

pool.query('SELECT 1')
    .then(() => console.log('Database is ready'))
    .catch(err => console.error('Database connection failed:', err.message))

export default pool