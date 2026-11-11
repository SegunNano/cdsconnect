import pool from '../config/db.js'
import { sendMail } from '../utils/mailer.js'

const BULK_CAP = 50        // bulk emails per day
const ACCOUNT_CAP = 95     // total per day, headroom under Resend's ~100
const PER_TICK = 5
const MAX_ATTEMPTS = 3

const count = async (sql) => Number((await pool.query(sql)).rows[0].n)

export const processEmailQueue = async () => {
    // Drop bulk mail that would arrive too late to be useful
    await pool.query(
        "UPDATE email_jobs SET status='expired' WHERE status='pending' AND expires_at < NOW()")

    const bulkToday = await count(
        "SELECT COUNT(*) AS n FROM email_jobs WHERE status='sent' AND sent_at::date = CURRENT_DATE")
    const totalToday = await count(
        "SELECT COALESCE(SUM(sent),0) AS n FROM email_stats WHERE day = CURRENT_DATE")

    const room = Math.min(PER_TICK, BULK_CAP - bulkToday, ACCOUNT_CAP - totalToday)
    if (room <= 0) return

    const { rows } = await pool.query(`
        UPDATE email_jobs SET attempts = attempts + 1
        WHERE id IN (
            SELECT id FROM email_jobs
            WHERE status='pending' AND run_after <= NOW()
            ORDER BY expires_at NULLS LAST, id
            LIMIT $1 FOR UPDATE SKIP LOCKED
        ) RETURNING *`, [room])

    for (const job of rows) {
        try {
            await sendMail({ to: job.to_email, subject: job.subject, html: job.html })
            await pool.query(
                "UPDATE email_jobs SET status='sent', sent_at=NOW() WHERE id=$1", [job.id])
        } catch (err) {
            const dead = job.attempts >= MAX_ATTEMPTS
            await pool.query(
                `UPDATE email_jobs SET status=$2, last_error=$3,
                 run_after = NOW() + ($4 || ' minutes')::interval WHERE id=$1`,
                [job.id, dead ? 'failed' : 'pending', err.message || 'send failed',
                 String(2 ** job.attempts)])
        }
    }
}

export const startEmailWorker = () => {
    setInterval(() => processEmailQueue().catch(console.error), 30 * 1000)
}