import pool from '../../config/db.js'
import { RATE } from '../../constants.js'

// Haversine formula — distance between two coordinates in meters
const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000 // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export const signIn = async (memberId, latitude, longitude) => {
    // Get member with stream
    const memberResult = await pool.query(
        `SELECT m.*, s.service_end 
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.id = $1`,
        [memberId]
    )

    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found' }
    }

    const member = memberResult.rows[0]

    // Check member is active
    if (!member.is_active || new Date() > new Date(member.service_end)) {
        throw { status: 403, message: 'Your account is no longer active for attendance.' }
    }

    // Get active meeting for today
    const meetingResult = await pool.query(
        `SELECT * FROM meetings 
        WHERE meeting_date::DATE = CURRENT_DATE`,
    )

    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'No meeting scheduled for today.' }
    }

    const meeting = meetingResult.rows[0]
    const now = new Date()
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)
    const lateThreshold = new Date(meeting.late_threshold)

    // Check sign-in window
    if (now < signInOpen) {
        throw { status: 400, message: 'Sign-in has not opened yet.' }
    }

    if (now > signInClose) {
        throw { status: 400, message: 'Sign-in is closed.' }
    }

    // Check already signed in
    const existingAttendance = await pool.query(
        'SELECT id FROM attendance WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meeting.id]
    )
    if (existingAttendance.rows.length > 0) {
        throw { status: 409, message: 'You have already signed in for this meeting.' }
    }

    // Check approved excuse
    const excuse = await pool.query(
        `SELECT id FROM excuse_requests 
        WHERE member_id = $1 AND meeting_id = $2 
        AND status = 'approved'`,
        [memberId, meeting.id]
    )
    if (excuse.rows.length > 0) {
        throw { status: 409, message: 'You already have an approved excuse for this meeting.' }
    }

    // Check geofence
    const distance = getDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(meeting.venue_lat),
        parseFloat(meeting.venue_lng)
    )

    if (distance > meeting.radius_meters) {
        throw {
            status: 403,
            message: `You are too far from the venue. You must be within ${meeting.radius_meters}m. You are ${Math.round(distance)}m away.`
        }
    }

    // Determine if late and cost
    const isLate = now >= lateThreshold
    const totalCost = isLate
        ? meeting.meeting_cost + meeting.lateness_cost
        : meeting.meeting_cost

    // Check token balance
    if (member.token_balance < totalCost) {
        throw {
            status: 400,
            message: `Insufficient tokens. You need ${totalCost} token(s) to sign in.`
        }
    }

    // Get next sequence number
    const seqResult = await pool.query(
        `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
        FROM attendance WHERE meeting_id = $1`,
        [meeting.id]
    )
    const sequenceNumber = seqResult.rows[0].next_seq

    // Deduct tokens
    await pool.query(
        'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
        [totalCost, memberId]
    )

    // Record attendance
    const attendanceResult = await pool.query(
        `INSERT INTO attendance (
            member_id, meeting_id, sequence_number,
            signed_in_at, tokens_deducted, is_late
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [memberId, meeting.id, sequenceNumber, now, totalCost, isLate]
    )

    return {
        attendance: attendanceResult.rows[0],
        sequence_number: sequenceNumber,
        tokens_deducted: totalCost,
        is_late: isLate,
        new_balance: member.token_balance - totalCost
    }
}

export const getMemberAttendance = async (memberId) => {
    const result = await pool.query(
        `SELECT a.*, m.title, m.meeting_date
        FROM attendance a
        JOIN meetings m ON a.meeting_id = m.id
        WHERE a.member_id = $1
        ORDER BY a.signed_in_at DESC`,
        [memberId]
    )
    return result.rows
}

export const getMeetingAttendance = async (meetingId) => {
    const result = await pool.query(
        `SELECT a.*, 
            mem.first_name, mem.last_name, 
            mem.state_code
        FROM attendance a
        JOIN members mem ON a.member_id = mem.id
        WHERE a.meeting_id = $1
        ORDER BY a.sequence_number ASC`,
        [meetingId]
    )
    return result.rows
}

export const getTodayAttendanceStatus = async (memberId) => {

    
    // Get today's meeting
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE meeting_date::DATE = CURRENT_DATE'
    )

    if (meetingResult.rows.length === 0) {
        return { has_meeting: false }
    }

    const meeting = meetingResult.rows[0]

    // Check attendance
    const attendanceResult = await pool.query(
        `SELECT * FROM attendance 
        WHERE member_id = $1 AND meeting_id = $2`,
        [memberId, meeting.id]
    )

    // Check excuse
    const excuseResult = await pool.query(
        `SELECT * FROM excuse_requests 
        WHERE member_id = $1 AND meeting_id = $2`,
        [memberId, meeting.id]
    )

    return {
        has_meeting: true,
        meeting,
        attendance: attendanceResult.rows[0] || null,
        excuse: excuseResult.rows[0] || null
    }
}