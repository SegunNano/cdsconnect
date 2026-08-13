import pg from 'pg'
import { DATABASE_URL, NODE_ENV } from './env.js'

const { Pool } = pg

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.connect()
    .then(() => console.log('PostgreSQL connected'))
    .catch(err => console.error('Database connection error:', err))

export default pool