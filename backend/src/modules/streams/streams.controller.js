import {
    getAllStreams,
    getActiveStreams,
    createStream,
    toggleStreamActive
} from './streams.service.js'

export const getAll = async (req, res, next) => {
    try {
        const streams = await getAllStreams()
        res.status(200).json({ success: true, data: streams })
    } catch (err) {
        next(err)
    }
}

export const getActive = async (req, res, next) => {
    try {
        const streams = await getActiveStreams()
        res.status(200).json({ success: true, data: streams })
    } catch (err) {
        next(err)
    }
}

export const create = async (req, res, next) => {
    try {
        const stream = await createStream(req.body)
        res.status(201).json({ success: true, data: stream })
    } catch (err) {
        next(err)
    }
}

export const toggleActive = async (req, res, next) => {
    try {
        const stream = await toggleStreamActive(req.params.id)
        res.status(200).json({ success: true, data: stream })
    } catch (err) {
        next(err)
    }
}