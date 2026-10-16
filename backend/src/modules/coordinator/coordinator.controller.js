import {
    getCoordinatorOverview,
    getCoordinatorMembers,
    getMeetingAttendanceReport,
    generateMembersPdf,
    generateAttendancePdf
} from './coordinator.service.js'

export const overview = async (req, res, next) => {
    try {
        const data = await getCoordinatorOverview()
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const members = async (req, res, next) => {
    try {
        const data = await getCoordinatorMembers()
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const attendanceReport = async (req, res, next) => {
    try {
        const data = await getMeetingAttendanceReport(req.params.meetingId)
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const membersPdf = async (req, res, next) => {
    try {
        const buffer = await generateMembersPdf()
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cds-members-${Date.now()}.pdf"`,
            'Content-Length': buffer.length
        })
        res.send(buffer)
    } catch (err) { next(err) }
}

export const attendancePdf = async (req, res, next) => {
    try {
        const buffer = await generateAttendancePdf(req.params.meetingId)
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="attendance-${req.params.meetingId}-${Date.now()}.pdf"`,
            'Content-Length': buffer.length
        })
        res.send(buffer)
    } catch (err) { next(err) }
}