import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification } from '../notifications/notifications.service.js'
import { issueClearance } from '../../utils/clearance.js'

const isSameDay = (meetingDate) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const meetingStr = typeof meetingDate === 'string'
        ? meetingDate.split('T')[0]
        : new Date(meetingDate).toISOString().split('T')[0]
    
     return todayStr === meetingStr
}

export const getMeetingSignOutList = async (meetingId) => {
    // Check meeting is today
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )

    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }

    const meeting = meetingResult.rows[0]
    const meetingDate = new Date(meeting.meeting_date)
        .toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    if (!isSameDay(meeting.meeting_date, new Date())) {     
        throw { status: 403, message: 'Sign-out is no longer available for this meeting.' }
    }

    // Get all signed in members ordered by sequence number
    const result = await pool.query(
        `SELECT a.*, 
            m.first_name, m.last_name, m.state_code
        FROM attendance a
        JOIN members m ON a.member_id = m.id
        WHERE a.meeting_id = $1
        ORDER BY a.sequence_number ASC`,
        [meetingId]
    )

    return { meeting, attendance: result.rows }
}

export const signOutMember = async (officerId, meetingId, attendanceId, confirmedName, confirmedStateCode) => {
    // Check meeting is today
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )

    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }

    const meeting = meetingResult.rows[0]
    const meetingDate = new Date(meeting.meeting_date)
        .toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    if (!isSameDay(meeting.meeting_date, new Date())) {
        throw { status: 403, message: 'Sign-out is no longer available for this meeting.' }
    }

    // Get attendance record with member details
    const attendanceResult = await pool.query(
        `SELECT a.*, m.first_name, m.last_name, m.state_code
        FROM attendance a
        JOIN members m ON a.member_id = m.id
        WHERE a.id = $1 AND a.meeting_id = $2`,
        [attendanceId, meetingId]
    )

    if (attendanceResult.rows.length === 0) {
        throw { status: 404, message: 'Attendance record not found.' }
    }

    const attendance = attendanceResult.rows[0]

    // Check already signed out
    if (attendance.signed_out_at) {
        throw { status: 409, message: 'Member has already been signed out.' }
    }

    // Verify name and state code
    const fullName = `${attendance.first_name} ${attendance.last_name}`.toLowerCase()
    const confirmedFullName = confirmedName.toLowerCase().trim()
    const stateCodeMatch = attendance.state_code.toLowerCase() === confirmedStateCode.toLowerCase().trim()
    const nameMatch = fullName === confirmedFullName

    if (!nameMatch || !stateCodeMatch) {
        throw {
            status: 400,
            message: 'Name or state code does not match our records. Please verify.'
        }
    }
    const now = new Date()

    // Sign out
    const result = await pool.query(
        `UPDATE attendance 
        SET signed_out_at = $1
        WHERE id = $2
        RETURNING *`,
        [now, attendanceId]
    )


    await issueClearance(attendance.member_id, meetingId)


    return result.rows[0]
}

export const getTodayMeeting = async () => {
    const result = await pool.query(
        'SELECT * FROM meetings WHERE meeting_date = CURRENT_DATE'
    )
    return result.rows[0] || null
}