import pool from '../config/db.js'
import { sendMail } from '../utils/mailer.js'
import { emailLayout, esc } from '../utils/emailTemplate.js'
import { createNotification } from '../modules/notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../constants.js'

const REMIND_DAYS = [5, 3, 1]

export const runExcuseReminder = async () => {
    // meeting_date is a DATE and the DB session runs on Lagos time,
    // so this is "days from today" in Lagos
    const { rows: meetings } = await pool.query(
        `SELECT m.id, m.title,
                (m.meeting_date - CURRENT_DATE) AS days_left,
                COUNT(er.id)::int AS pending
         FROM meetings m
         JOIN excuse_requests er ON er.meeting_id = m.id AND er.status = 'pending'
         WHERE (m.meeting_date - CURRENT_DATE) = ANY($1)
         GROUP BY m.id`,
        [REMIND_DAYS]
    )
    if (meetings.length === 0) return

    const { rows: coordinators } = await pool.query(
        "SELECT id, first_name, email FROM members WHERE role = 'coordinator' AND is_active = true"
    )
    if (coordinators.length === 0) {
        console.warn('[job:excuses] no active coordinator to notify')
        return
    }

    for (const m of meetings) {
        const first = m.days_left === 5
        const waiting = `${m.pending} excuse request${m.pending !== 1 ? 's' : ''}`
        const summary = first
            ? `The window for filing excuses for ${m.title} has closed. ${waiting} ${m.pending !== 1 ? 'are' : 'is'} waiting for your decision.`
            : `${m.title} is ${m.days_left} day${m.days_left !== 1 ? 's' : ''} away and ${waiting} ${m.pending !== 1 ? 'are' : 'is'} still pending.`

        for (const c of coordinators) {
            createNotification(c.id, 'Excuses to review', summary, NOTIFICATION_TYPES.EXCUSE_REMINDER)
                .catch(err => console.error('[job:excuses] notification failed:', err.message))

            await sendMail({
                to: c.email,
                subject: first
                    ? `Excuse window closed: ${waiting} to review`
                    : `Reminder: ${waiting} still pending for ${m.title}`,
                html: emailLayout({
                    greeting: c.first_name,
                    paragraphs: [
                        esc(summary),
                        'Please review them before the meeting. A late review leaves an excused member showing as absent until it is approved.'
                    ],
                    button: { label: 'Open coordinator page', url: `${process.env.FRONTEND_URL}/coordinator` }
                })
            }).catch(err => console.error('[job:excuses] email failed:', err.message))
        }
    }
}