import {
    signIn,
    getMemberAttendance,
    getMeetingAttendance,
    getTodayAttendanceStatus
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