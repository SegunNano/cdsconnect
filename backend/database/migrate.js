import pool from '../src/config/db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationsDir = path.join(__dirname, 'migrations')

async function runMigrations() {
    const files = fs.readdirSync(migrationsDir).sort()

    for (const file of files) {
        const filePath = path.join(migrationsDir, file)
        const sql = fs.readFileSync(filePath, 'utf8')

        try {
            await pool.query(sql)
            console.log(`✅ Migrated: ${file}`)
        } catch (err) {
            console.error(`❌ Failed: ${file}`, err.message)
            process.exit(1)
        }
    }

    console.log('All migrations complete')
    process.exit(0)
}

runMigrations()