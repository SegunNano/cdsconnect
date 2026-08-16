import {
    fileExcuse,
    getMyExcuses,
    getPendingExcuses,
    getAllExcuses,
    reviewExcuse
} from './excuses.service.js'

export const file = async (req, res, next) => {
    try {
        console.log(req.body)
        const { meetingId, reason, evidenceUrl } = req.body
        const result = await fileExcuse(req.member.id, meetingId, reason, evidenceUrl)
        res.status(201).json({
            success: true,
            message: 'Excuse filed successfully. Awaiting coordinator review.',
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getMyExcuseList = async (req, res, next) => {
    try {
        const excuses = await getMyExcuses(req.member.id)
        res.status(200).json({ success: true, data: excuses })
    } catch (err) {
        next(err)
    }
}

export const getPending = async (req, res, next) => {
    try {
        const excuses = await getPendingExcuses()
        res.status(200).json({ success: true, data: excuses })
    } catch (err) {
        next(err)
    }
}

export const getAll = async (req, res, next) => {
    try {
        const excuses = await getAllExcuses()
        res.status(200).json({ success: true, data: excuses })
    } catch (err) {
        next(err)
    }
}

export const review = async (req, res, next) => {
    try {
        const { excuseId, decision } = req.body
        const result = await reviewExcuse(req.member.id, excuseId, decision)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}