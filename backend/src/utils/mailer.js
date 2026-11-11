// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

// export const sendMail = async ({ to, subject, html }) => {
//     const { error } = await resend.emails.send({
//         from: `CDSConnect <${process.env.MAIL_FROM}>`,
//         to,
//         subject,
//         html
//     })

//     if (error) {
//         console.error('Resend error:', error.message)
//         throw { status: 502, message: 'Could not send email. Try again.' }
//     }
// }

import { Resend } from 'resend'
import pool from '../config/db.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const countSend = () =>
    pool.query(
        `INSERT INTO email_stats (day, sent) VALUES (CURRENT_DATE, 1)
         ON CONFLICT (day) DO UPDATE SET sent = email_stats.sent + 1`
    ).catch(() => {})

// Throws on failure. Use where the caller must know (PIN reset).
export const sendMail = async ({ to, subject, html }) => {
    const { error } = await resend.emails.send({
        from: `CDSConnect <${process.env.MAIL_FROM}>`,
        to, subject, html
    })
    if (error) {
        console.error('Mail error:', error.message)   // never log the body
        throw { status: 502, message: 'Could not send email. Try again.' }
    }
    countSend()
}

// Direct send that never breaks the request. Don't await it.
export const sendMailSafe = (mail) => { sendMail(mail).catch(() => {}) }

// Bulk: just a row in the table
export const enqueueBulk = (mail, { kind, streamId = null, priority = 2, expiresInHours = null }) =>
    pool.query(
        `INSERT INTO email_jobs (to_email, subject, html, kind, stream_id, priority, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,
            CASE WHEN $7::int IS NULL THEN NULL
                 ELSE NOW() + ($7 || ' hours')::interval END)`,
        [mail.to, mail.subject, mail.html, kind, streamId, priority, expiresInHours]
    ).catch(err => console.error('enqueue failed:', err.message))