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

pool.query('SELECT 1')
    .then(() => console.log('Database is ready'))
    .catch(err => console.error('Database connection failed:', err.message))

export default pool