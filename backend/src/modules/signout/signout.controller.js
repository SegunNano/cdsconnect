import {
    getMeetingSignOutList,
    signOutMember,
    getTodayMeeting
} from './signout.service.js'

export const getSignOutList = async (req, res, next) => {
    try {
        const result = await getMeetingSignOutList(req.params.meetingId)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}

export const signOut = async (req, res, next) => {
    try {
        const { meetingId, attendanceId, confirmedName, confirmedStateCode } = req.body
        const result = await signOutMember(
            req.member.id,
            meetingId,
            attendanceId,
            confirmedName,
            confirmedStateCode
        )
        res.status(200).json({
            success: true,
            message: 'Member signed out successfully.',
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getToday = async (req, res, next) => {
    try {
        const meeting = await getTodayMeeting()
        res.status(200).json({ success: true, data: meeting })
    } catch (err) {
        next(err)
    }
}