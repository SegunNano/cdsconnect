import pool from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification } from '../modules/notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../constants.js'

export const issueClearance = async (memberId, meetingId) => {
    // Check if already exists
    const existing = await pool.query(
        'SELECT id FROM clearance_slips WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )

    if (existing.rows.length > 0) return // Already issued

    const qrToken = uuidv4()

    await pool.query(
        `INSERT INTO clearance_slips (member_id, meeting_id, qr_token)
        VALUES ($1, $2, $3)`,
        [memberId, meetingId, qrToken]
    )

    // Get meeting title for notification
    const meetingResult = await pool.query(
        'SELECT title FROM meetings WHERE id = $1',
        [meetingId]
    )

    await createNotification(
        memberId,
        'Clearance Ready 🎉',
        `Your clearance slip for ${meetingResult.rows[0].title} is ready to download.`,
        NOTIFICATION_TYPES.CLEARANCE_READY
    )
}