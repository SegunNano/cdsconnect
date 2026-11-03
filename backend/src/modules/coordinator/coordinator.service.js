import pool from '../../config/db.js'
import { createMembersPdfBuffer, createAttendancePdfBuffer } from '../../utils/coordinator.js'

export const getCoordinatorOverview = async () => {
    const membersResult = await pool.query(
        `SELECT COUNT(*) AS total FROM members WHERE is_active = true AND member_type = 'corps_member'`
    )

    const streamsResult = await pool.query(
        `SELECT s.id, s.year, s.batch, s.stream, s.callup_date, s.service_end, s.certificate_unlocked, COUNT(m.id) AS member_count
        FROM streams s
        LEFT JOIN members m ON m.stream_id = s.id AND m.is_active = true AND m.member_type = 'corps_member'
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY s.callup_date DESC`
    )

    const meetingsResult = await pool.query(
        `SELECT COUNT(*) AS total FROM meetings WHERE sign_in_close < NOW()`
    )

    return {
        total_members: parseInt(membersResult.rows[0].total),
        total_meetings: parseInt(meetingsResult.rows[0].total),
        active_streams: streamsResult.rows
    }
}

export const getCoordinatorMembers = async () => {
    const result = await pool.query(
        `SELECT m.id, m.first_name, m.last_name, m.state_code, m.role, m.gender, m.breakout_session, m.token_balance, m.reinstatement_count,
            s.year AS stream_year, s.batch AS stream_batch, s.stream AS stream_number
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.is_active = true AND m.member_type = 'corps_member' AND s.is_active = true
        ORDER BY s.callup_date DESC, m.last_name ASC`
    )
    return result.rows
}

export const getMeetingAttendanceReport = async (meetingId) => {
    const meetingResult = await pool.query('SELECT * FROM meetings WHERE id = $1', [meetingId])
    if (meetingResult.rows.length === 0) throw { status: 404, message: 'Meeting not found' }
    const meeting = meetingResult.rows[0]

    const allMembersResult = await pool.query(
        `SELECT m.id, m.first_name, m.last_name, m.state_code, m.role, m.gender,
            s.year AS stream_year, s.batch AS stream_batch, s.stream AS stream_number
        FROM members m
        JOIN streams s ON m.stream_id = s.id
        WHERE m.is_active = true AND m.member_type = 'corps_member' AND m.created_at::DATE <= $1
        ORDER BY m.last_name ASC`,
        [meeting.meeting_date]
    )
    const allMembers = allMembersResult.rows

    const attendanceResult = await pool.query(
        `SELECT a.member_id, a.signed_in_at, a.signed_out_at, a.is_late, a.marked_present_by, a.sequence_number, er.status AS excuse_status
        FROM attendance a
        LEFT JOIN excuse_requests er ON er.meeting_id = a.meeting_id AND er.member_id = a.member_id
        WHERE a.meeting_id = $1`,
        [meetingId]
    )

    const attendanceMap = {}
    attendanceResult.rows.forEach(a => { attendanceMap[a.member_id] = a })

    const excuseResult = await pool.query(
        `SELECT member_id FROM excuse_requests WHERE meeting_id = $1 AND status IN ('approved', 'approved_not_needed')`,
        [meetingId]
    )
    const excusedIds = new Set(excuseResult.rows.map(e => e.member_id))

    const present = []
    const excused = []
    const absent = []

    allMembers.forEach(member => {
        const record = attendanceMap[member.id]
        if (record?.signed_out_at || record?.marked_present_by) {
            present.push({ ...member, ...record })
        } else if (excusedIds.has(member.id) || record?.excuse_id) {
            excused.push(member)
        } else {
            absent.push(member)
        }
    })

    return {
        meeting,
        present,
        excused,
        absent,
        totals: { total: allMembers.length, present: present.length, excused: excused.length, absent: absent.length }
    }
}

// PDF callers remain in your service file, delegating to the utility
export const generateMembersPdf = async () => {
    const members = await getCoordinatorMembers()
    const streamGroups = {}
    members.forEach(m => {
        const key = `${m.stream_year} Batch ${m.stream_batch} Stream ${m.stream_number}`
        if (!streamGroups[key]) streamGroups[key] = []
        streamGroups[key].push(m)
    })
    return createMembersPdfBuffer(streamGroups, members.length)
}

export const generateAttendancePdf = async (meetingId) => {
    const report = await getMeetingAttendanceReport(meetingId)
    return createAttendancePdfBuffer(report)
}