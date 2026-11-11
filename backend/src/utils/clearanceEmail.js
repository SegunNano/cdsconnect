import pool from '../config/db.js'
import { sendMailSafe } from './mailer.js'
import { emailLayout, esc } from './emailTemplate.js'

export const sendClearedEmail = async (memberId, meetingId) => {
    const { rows } = await pool.query(
        `SELECT m.first_name, m.email, mt.title
         FROM members m, meetings mt WHERE m.id=$1 AND mt.id=$2`, [memberId, meetingId])
    if (!rows.length) return
    sendMailSafe({
        to: rows[0].email,
        subject: 'Your clearance slip is ready',
        html: emailLayout({
            greeting: rows[0].first_name,
            paragraphs: [`You have been cleared for <b>${esc(rows[0].title)}</b>. Your clearance slip is ready to download.`],
            button: { label: 'Download slip', url: `${process.env.FRONTEND_URL}/clearance` }
        })
    })
}