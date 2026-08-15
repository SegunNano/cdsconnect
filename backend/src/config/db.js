import pg from 'pg'
import { DATABASE_URL, NODE_ENV } from './env.js'

const { Pool } = pg

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
    console.log('New client connected to PostgreSQL')
})

export default pool