import {
    signIn,
    getMemberAttendance,
    getMeetingAttendance,
    getTodayAttendanceStatus,
    markMemberPresent
} from './attendance.service.js'

export const memberSignIn = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body
        const result = await signIn(req.member.id, latitude, longitude)
        res.status(200).json({
            success: true,
            message: result.is_late
                ? `Signed in late. ${result.tokens_deducted} tokens deducted.`
                : `Signed in successfully. ${result.tokens_deducted} token deducted.`,
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getMyAttendance = async (req, res, next) => {
    try {
        const attendance = await getMemberAttendance(req.member.id)
        res.status(200).json({ success: true, data: attendance })
    } catch (err) {
        next(err)
    }
}

export const getMeetingAttendanceList = async (req, res, next) => {
    try {
        const attendance = await getMeetingAttendance(req.params.meetingId)
        res.status(200).json({ success: true, data: attendance })
    } catch (err) {
        next(err)
    }
}

export const getTodayStatus = async (req, res, next) => {
    try {
        const status = await getTodayAttendanceStatus(req.member.id)
        res.status(200).json({ success: true, data: status })
    } catch (err) {
        next(err)
    }
}

export const getTodayAttendance =  async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT 
                a.id,
                a.member_id,
                a.meeting_id,
                a.sequence_number,
                a.signed_in_at,
                a.signed_out_at,
                a.tokens_deducted,
                a.is_late,
                a.excuse_id,
                a.marked_present_by
            FROM attendance a
            JOIN meetings m ON a.meeting_id = m.id
            WHERE a.member_id = $1
            AND m.meeting_date = CURRENT_DATE`,
            [req.member.id]
        )
        res.status(200).json({
            success: true,
            data: result.rows[0] || null
        })
    } catch (err) {
        next(err)
    }
}

export const manualMarkPresent = async (req, res, next) => {
    try {
        const { memberId, meetingId, reason } = req.body
        const result = await markMemberPresent(
            req.member.id, memberId, meetingId, reason
        )
        res.status(200).json({
            success: true,
            message: 'Member marked as present.',
            data: result
        })
    } catch (err) {
        next(err)
    }
}