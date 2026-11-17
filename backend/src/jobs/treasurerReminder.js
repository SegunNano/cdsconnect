import pool from '../config/db.js'
import { sendMail } from '../utils/mailer.js'
import { emailLayout } from '../utils/emailTemplate.js'
import { RATE } from '../constants.js'

const plural = (n, word) => `${n} ${word}${n !== 1 ? 's' : ''}`

const ago = (hours) =>
    hours < 1 ? 'under an hour'
    : hours < 24 ? plural(hours, 'hour')
    : plural(Math.floor(hours / 24), 'day')

export const runTreasurerReminder = async () => {
    const { rows: [s] } = await pool.query(
        `SELECT COUNT(*)::int AS count,
                COALESCE(SUM(tokens_requested), 0)::int AS tokens,
                COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600, 0)::int AS oldest_hours
         FROM topup_requests WHERE status = 'pending'`
    )
    if (s.count === 0) return   // nothing waiting, nothing sent

    const { rows: treasurers } = await pool.query(
        "SELECT first_name, email FROM members WHERE role = 'treasurer' AND is_active = true"
    )
    if (treasurers.length === 0) {
        console.warn('[job:treasurer] no active treasurer to notify')
        return
    }

    const overdue = s.oldest_hours >= 24

    for (const t of treasurers) {
        await sendMail({
            to: t.email,
            subject: `${overdue ? 'Overdue: ' : ''}${plural(s.count, 'token request')} waiting for review`,
            html: emailLayout({
                greeting: t.first_name,
                paragraphs: [
                    `<b>${plural(s.count, 'top-up request')}</b> ${s.count !== 1 ? 'are' : 'is'} waiting: <b>${s.tokens}</b> tokens (₦${(s.tokens * RATE).toLocaleString()}) in total.`,
                    `The oldest has been waiting ${ago(s.oldest_hours)}. Please check your bank alerts, then approve or reject each one.`
                ],
                button: { label: 'Review requests', url: `${process.env.FRONTEND_URL}/topup` }
            })
        }).catch(err => console.error('[job:treasurer] email failed:', err.message))
    }
}