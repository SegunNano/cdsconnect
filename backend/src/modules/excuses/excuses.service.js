import pool from '../../config/db.js'
import { createNotification } from '../notifications/notifications.service.js'
import { NOTIFICATION_TYPES } from '../../constants.js'

export const fileExcuse = async (memberId, meetingId, reason, evidenceUrl) => {
    // Check meeting exists
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )
    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }

    const meeting = meetingResult.rows[0]
    const now = new Date()
    const signInOpen = new Date(meeting.sign_in_open)

    // Check excuse window is still open
    if (now >= signInOpen) {
        throw { status: 400, message: 'Excuse window has closed for this meeting.' }
    }

    // Check member hasn't already filed an excuse
    const existing = await pool.query(
        'SELECT id FROM excuse_requests WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )
    if (existing.rows.length > 0) {
        throw { status: 409, message: 'You have already filed an excuse for this meeting.' }
    }

    // Check member hasn't already signed in
    const attendance = await pool.query(
        'SELECT id FROM attendance WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )
    if (attendance.rows.length > 0) {
        throw { status: 409, message: 'You have already signed in for this meeting.' }
    }

    // Evidence is compulsory
    if (!evidenceUrl) {
        throw { status: 400, message: 'Evidence is required to file an excuse.' }
    }

    const result = await pool.query(
        `INSERT INTO excuse_requests (member_id, meeting_id, reason, evidence_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [memberId, meetingId, reason, evidenceUrl]
    )

    return result.rows[0]
}

export const getMyExcuses = async (memberId) => {
    const result = await pool.query(
        `SELECT e.*, m.title, m.meeting_date
        FROM excuse_requests e
        JOIN meetings m ON e.meeting_id = m.id
        WHERE e.member_id = $1
        ORDER BY e.created_at DESC`,
        [memberId]
    )
    return result.rows
}

export const getPendingExcuses = async () => {
    const result = await pool.query(
        `SELECT e.*,
            m.title AS meeting_title,
            m.meeting_date,
            mem.first_name, mem.last_name,
            mem.state_code
        FROM excuse_requests e
        JOIN meetings m ON e.meeting_id = m.id
        JOIN members mem ON e.member_id = mem.id
        WHERE e.status = 'pending'
        ORDER BY e.created_at ASC`
    )
    return result.rows
}

export const getAllExcuses = async () => {
    const result = await pool.query(
        `SELECT e.*,
            m.title AS meeting_title,
            m.meeting_date,
            mem.first_name, mem.last_name,
            mem.state_code
        FROM excuse_requests e
        JOIN meetings m ON e.meeting_id = m.id
        JOIN members mem ON e.member_id = mem.id
        ORDER BY e.created_at DESC`
    )
    return result.rows
}

export const reviewExcuse = async (coordinatorId, excuseId, decision) => {
    if (!['approved', 'rejected'].includes(decision)) {
        throw { status: 400, message: 'Decision must be approved or rejected.' }
    }

    // Get excuse
    const excuseResult = await pool.query(
        'SELECT * FROM excuse_requests WHERE id = $1',
        [excuseId]
    )
    if (excuseResult.rows.length === 0) {
        throw { status: 404, message: 'Excuse request not found.' }
    }

    const excuse = excuseResult.rows[0]

    if (excuse.status !== 'pending') {
        throw { status: 409, message: 'This excuse has already been reviewed.' }
    }

    if (decision === 'approved') {
        // Check if member already attended
        const attendance = await pool.query(
            'SELECT id FROM attendance WHERE member_id = $1 AND meeting_id = $2',
            [excuse.member_id, excuse.meeting_id]
        )

        if (attendance.rows.length > 0) {
            // Member attended — approve but don't deduct token
            await pool.query(
                `UPDATE excuse_requests 
                SET status = 'approved_not_needed', 
                    reviewed_by = $1, 
                    reviewed_at = $2
                WHERE id = $3`,
                [coordinatorId, new Date(), excuseId]
            )
            return { status: 'approved_not_needed', message: 'Member attended. No token deducted.' }
        }

        // Get meeting cost
        const meetingResult = await pool.query(
            'SELECT meeting_cost FROM meetings WHERE id = $1',
            [excuse.meeting_id]
        )
        const meetingCost = meetingResult.rows[0].meeting_cost

        // Check member has enough tokens
        const memberResult = await pool.query(
            'SELECT token_balance FROM members WHERE id = $1',
            [excuse.member_id]
        )
        if (memberResult.rows[0].token_balance < meetingCost) {
            throw { status: 400, message: 'Member has insufficient tokens for excuse approval.' }
        }

        // Deduct token
        await pool.query(
            'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
            [meetingCost, excuse.member_id]
        )

        // Create attendance record
        const seqResult = await pool.query(
            `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
            FROM attendance WHERE meeting_id = $1`,
            [excuse.meeting_id]
        )

        await pool.query(
            `INSERT INTO attendance (
                member_id, meeting_id, sequence_number,
                signed_in_at, signed_out_at,
                tokens_deducted, is_late, excuse_id
            ) VALUES ($1, $2, $3, $4, $4, $5, false, $6)`,
            [
                excuse.member_id,
                excuse.meeting_id,
                seqResult.rows[0].next_seq,
                new Date(),
                meetingCost,
                excuseId
            ]
        )

        // Update excuse status
        await pool.query(
            `UPDATE excuse_requests 
            SET status = 'approved', 
                reviewed_by = $1, 
                reviewed_at = $2
            WHERE id = $3`,
            [coordinatorId, new Date(), excuseId]
        )

        await createNotification(
        excuse.member_id,
        'Excuse Approved',
        `Your excuse for ${meeting.title} has been approved.`,
        NOTIFICATION_TYPES.EXCUSE_APPROVED
    )

        return { status: 'approved', message: 'Excuse approved. Token deducted and member marked present.' }
    }

    // Rejected
    await pool.query(
        `UPDATE excuse_requests 
        SET status = 'rejected', 
            reviewed_by = $1, 
            reviewed_at = $2
        WHERE id = $3`,
        [coordinatorId, new Date(), excuseId]
    )
    await createNotification(
        excuse.member_id,
        'Excuse Rejected',
        `Your excuse for ${meeting.title} has been rejected. You can contact the coordinaotor for clarity.`,
        NOTIFICATION_TYPES.EXCUSE_REJECTED
    )

    return { status: 'rejected', message: 'Excuse rejected.' }
}