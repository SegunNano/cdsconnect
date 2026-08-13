import {
    createMeeting,
    getActiveMeeting,
    getAllMeetings,
    getMeetingById,
    getMeetingState
} from './meetings.service.js'

export const create = async (req, res, next) => {
    try {
        const meeting = await createMeeting(req.body)
        res.status(201).json({ success: true, data: meeting })
    } catch (err) {
        next(err)
    }
}

export const getActive = async (req, res, next) => {
    try {
        const meeting = await getActiveMeeting()

        if (!meeting) {
            return res.status(200).json({ success: true, data: null })
        }

        const state = getMeetingState(meeting)

        res.status(200).json({
            success: true,
            data: { ...meeting, state }
        })
    } catch (err) {
        next(err)
    }
}

export const getAll = async (req, res, next) => {
    try {
        const meetings = await getAllMeetings()
        res.status(200).json({ success: true, data: meetings })
    } catch (err) {
        next(err)
    }
}

export const getOne = async (req, res, next) => {
    try {
        const meeting = await getMeetingById(req.params.id)
        res.status(200).json({ success: true, data: meeting })
    } catch (err) {
        next(err)
    }
}