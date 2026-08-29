import pool from '../../config/db.js'
import { RATE } from '../../constants.js'
import { issueClearance } from '../../utils/clearance.js'
// Haversine formula — distance between two coordinates in meters
// Calculates distance between two lat/lng coordinates in meters
 export function getDistances(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}


export const checkIfSuspended = async (memberId) => {
    const result = await pool.query(
        `SELECT EXISTS (
            SELECT 1
            FROM meetings m
            LEFT JOIN attendance a 
                ON a.meeting_id = m.id AND a.member_id = $1
            LEFT JOIN excuse_requests er
                ON er.meeting_id = m.id AND er.member_id = $1
                AND er.status IN ('approved', 'approved_not_needed')
            WHERE m.sign_in_close < NOW()
            AND m.meeting_date = (
                SELECT MAX(meeting_date) 
                FROM meetings 
                WHERE sign_in_close < NOW()
            )
            AND (
                a.id IS NULL
                OR (
                    a.signed_out_at IS NULL 
                    AND a.marked_present_by IS NULL 
                    AND a.excuse_id IS NULL
                )
            )
            AND er.id IS NULL
        ) AS is_suspended`,
        [memberId]
    )
    return result.rows[0].is_suspended
}

export const getMissedMeeting = async (memberId) => {
    const result = await pool.query(
        `SELECT m.*
        FROM meetings m
        LEFT JOIN attendance a 
            ON a.meeting_id = m.id AND a.member_id = $1
        LEFT JOIN excuse_requests er
            ON er.meeting_id = m.id AND er.member_id = $1
            AND er.status IN ('approved', 'approved_not_needed')
        WHERE m.sign_in_close < NOW()
        AND m.meeting_date = (
            SELECT MAX(meeting_date) 
            FROM meetings 
            WHERE sign_in_close < NOW()
        )
        AND (
            a.id IS NULL
            OR (
                a.signed_out_at IS NULL 
                AND a.marked_present_by IS NULL 
                AND a.excuse_id IS NULL
            )
        )
        AND er.id IS NULL`,
        [memberId]
    )
    return result.rows[0] || null
}

const getPenaltyTokens = (reinstatementCount, meetingCost) => {
    return meetingCost * 2
}

export const reinstateMember = async (devId, memberId) => {
    // Can't reinstate yourself
    if (parseInt(devId) === parseInt(memberId)) {
        throw { status: 400, message: 'You cannot reinstate yourself.' }
    }

    // Check member is actually suspended
    const isSuspended = await checkIfSuspended(memberId)
    if (!isSuspended) {
        throw { status: 400, message: 'Member is not suspended.' }
    }

    // Get the missed meeting
    const missedMeeting = await getMissedMeeting(memberId)
    if (!missedMeeting) {
        throw { status: 404, message: 'Could not find missed meeting.' }
    }

    // Calculate penalty
    const penaltyTokens = await getPenaltyTokens(memberId, missedMeeting.meeting_cost)

    // Check member has enough tokens
    const memberResult = await pool.query(
        'SELECT token_balance, first_name, last_name FROM members WHERE id = $1',
        [memberId]
    )
    const member = memberResult.rows[0]

    if (member.token_balance < penaltyTokens) {
        throw {
            status: 400,
            message: `Insufficient tokens. Member needs ${penaltyTokens} tokens (penalty) but has ${member.token_balance}. Ask treasurer to top up first.`
        }
    }

    // Deduct penalty tokens
    await pool.query(
        'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
        [penaltyTokens, memberId]
    )

    // Get next sequence number
    const seqResult = await pool.query(
        `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
        FROM attendance WHERE meeting_id = $1`,
        [missedMeeting.id]
    )

    // Mark present for missed meeting
    await pool.query(
        `INSERT INTO attendance (
            member_id, meeting_id, sequence_number,
            signed_in_at, signed_out_at,
            tokens_deducted, is_late,
            marked_present_by, mark_reason
        ) VALUES ($1, $2, $3, $4, $4, $5, false, $6, $7)`,
        [
            memberId,
            missedMeeting.id,
            seqResult.rows[0].next_seq,
            new Date(),
            penaltyTokens,
            devId,
            `Reinstated after absence — ${penaltyTokens} token penalty paid`
        ]
    )

    // Record reinstatement
    // After successful reinstatement
    await pool.query(
        'UPDATE members SET reinstatement_count = reinstatement_count + 1 WHERE id = $1',
        [memberId]
    )

    // Issue clearance
    const { issueClearance } = await import('../../utils/clearance.js')
    await issueClearance(memberId, missedMeeting.id)

    // Notify member
    const { createNotification } = await import('../notifications/notifications.service.js')
    await createNotification(
        memberId,
        'Account Reinstated',
        `Your account has been reinstated. ${penaltyTokens} token${penaltyTokens !== 1 ? 's' : ''} were deducted as penalty for missing ${missedMeeting.title}.`,
        'reinstatement'
    )

    return {
        member: member.first_name + ' ' + member.last_name,
        missed_meeting: missedMeeting.title,
        penalty_tokens: penaltyTokens,
        new_balance: member.token_balance - penaltyTokens
    }
}

export const signIn = async (memberId, latitude, longitude) => {
  const client = await pool.connect()

  try {

     const isSuspended = await checkIfSuspended(memberId)
    if (isSuspended) {
        const missedMeeting = await getMissedMeeting(memberId)
        throw {
            status: 403,
            message: `Your account is suspended for missing ${missedMeeting?.title}. Report to the President to reinstate your account.`
        }
    }

   await client.query('BEGIN')

    // 1. Get member & stream details
    const memberResult = await client.query(
      `SELECT m.*, s.service_end 
       FROM members m
       JOIN streams s ON m.stream_id = s.id
       WHERE m.id = $1 FOR UPDATE`,
      [memberId]
    )

    if (memberResult.rows.length === 0) {
      throw { status: 404, message: 'Member not found' }
    }

    const member = memberResult.rows[0]

    if (!member.is_active || new Date() > new Date(member.service_end)) {
      throw { status: 403, message: 'Your account is no longer active for attendance.' }
    }

    // 2. Get today's meeting
    const meetingResult = await client.query(
      `SELECT * FROM meetings WHERE meeting_date::DATE = CURRENT_DATE`
    )

    if (meetingResult.rows.length === 0) {
      throw { status: 404, message: 'No meeting scheduled for today.' }
    }

    const meeting = meetingResult.rows[0]
    const now = new Date()
    const signInOpen = new Date(meeting.sign_in_open)
    const signInClose = new Date(meeting.sign_in_close)
    const lateThreshold = new Date(meeting.late_threshold)

    if (now < signInOpen) {
      throw { status: 400, message: 'Sign-in has not opened yet.' }
    }
    if (now > signInClose) {
      throw { status: 400, message: 'Sign-in is closed.' }
    }

    // 3. Check existing attendance
    const existingAttendance = await client.query(
      'SELECT id FROM attendance WHERE member_id = $1 AND meeting_id = $2',
      [memberId, meeting.id]
    )
    if (existingAttendance.rows.length > 0) {
      throw { status: 409, message: 'You have already signed in for this meeting.' }
    }

    // 4. Check approved excuse
    const excuse = await client.query(
      `SELECT id FROM excuse_requests 
       WHERE member_id = $1 AND meeting_id = $2 AND status = 'approved'`,
      [memberId, meeting.id]
    )
    if (excuse.rows.length > 0) {
      throw { status: 409, message: 'You already have an approved excuse for this meeting.' }
    }

    // 5. Geofence check
    const distance = getDistances(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(meeting.venue_lat),
      parseFloat(meeting.venue_lng)
    )

    if (distance > meeting.radius_meters) {
      throw {
        status: 403,
        message: `You are too far from the venue (${Math.round(distance)}m away). Must be within ${meeting.radius_meters}m.`
      }
    }

    // 6. Token calculation & balance check
    const isLate = now >= lateThreshold
    const totalCost = isLate
      ? meeting.meeting_cost + meeting.lateness_cost
      : meeting.meeting_cost

    if (member.token_balance < totalCost) {
      throw {
        status: 400,
        message: `Insufficient tokens. You need ${totalCost} token(s) to sign in.`
      }
    }

    // 7. Deduct tokens
    await client.query(
      'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
      [totalCost, memberId]
    )

    // 8. Record attendance (Postgres assigns sequence & NOW() timestamp)
    const attendanceResult = await client.query(
      `INSERT INTO attendance (
          member_id, meeting_id, sequence_number,
          signed_in_at, tokens_deducted, is_late
       ) VALUES (
          $1, $2,
          (SELECT COALESCE(MAX(sequence_number), 0) + 1 FROM attendance WHERE meeting_id = $2),
          NOW(), $3, $4
       )
       RETURNING *`,
      [memberId, meeting.id, totalCost, isLate]
    )

    await client.query('COMMIT')

    const attendanceRecord = attendanceResult.rows[0]
    return {
      attendance: attendanceRecord,
      sequence_number: attendanceRecord.sequence_number,
      tokens_deducted: totalCost,
      is_late: isLate,
      new_balance: member.token_balance - totalCost
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const getMemberAttendance = async (memberId) => {
    const result = await pool.query(
        `SELECT 
            m.id AS meeting_id,
            m.title,
            m.meeting_date,
            a.id AS attendance_id,
            a.signed_in_at,
            a.signed_out_at,
            a.is_late,
            a.tokens_deducted,
            a.excuse_id,
            a.marked_present_by,
            er.status AS excuse_status
        FROM meetings m
        LEFT JOIN attendance a 
            ON a.meeting_id = m.id AND a.member_id = $1
        LEFT JOIN excuse_requests er 
            ON er.meeting_id = m.id AND er.member_id = $1
        ORDER BY m.meeting_date DESC`,
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

export const markMemberPresent = async (devId, memberId, meetingId, reason) => {
    // Dev cannot mark themselves
    if (parseInt(devId) === parseInt(memberId)) {
        throw { status: 403, message: 'You cannot mark yourself present.' }
    }

    // Get meeting
    const meetingResult = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )

    if (meetingResult.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found.' }
    }

    const meeting = meetingResult.rows[0]

    // Check member exists
    const memberResult = await pool.query(
        'SELECT * FROM members WHERE id = $1',
        [memberId]
    )

    if (memberResult.rows.length === 0) {
        throw { status: 404, message: 'Member not found.' }
    }

    // Check not already present
    const existing = await pool.query(
        'SELECT id FROM attendance WHERE member_id = $1 AND meeting_id = $2',
        [memberId, meetingId]
    )

    if (existing.rows.length > 0) {
        throw { status: 409, message: 'Member already has an attendance record for this meeting.' }
    }

    // Get meeting cost
    const totalCost = meeting.meeting_cost

    // Check member has enough tokens
    const member = memberResult.rows[0]
    if (member.token_balance < totalCost) {
        throw { status: 400, message: 'Member has insufficient tokens.' }
    }

    // Deduct token
    await pool.query(
        'UPDATE members SET token_balance = token_balance - $1 WHERE id = $2',
        [totalCost, memberId]
    )

    // Get next sequence number
    const seqResult = await pool.query(
        `SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
        FROM attendance WHERE meeting_id = $1`,
        [meetingId]
    )

    // Create attendance record
    const result = await pool.query(
        `INSERT INTO attendance (
            member_id, meeting_id, sequence_number,
            signed_in_at, signed_out_at,
            tokens_deducted, is_late,
            marked_present_by, mark_reason
        ) VALUES ($1, $2, $3, $4, $4, $5, false, $6, $7)
        RETURNING *`,
        [
            memberId, meetingId,
            seqResult.rows[0].next_seq,
            new Date(), totalCost,
            devId, reason
        ]
    )

    await issueClearance(memberId, meetingId)

    return result.rows[0]
}