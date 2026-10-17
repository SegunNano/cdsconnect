import {
    getAllStreams,
    getActiveStreams,
    createStream,
    toggleStreamActive
} from './streams.service.js'

export const updateCertificate = async (req, res, next) => {
    try {
        const { certificate_cost_tokens } = req.body
        if (!certificate_cost_tokens || certificate_cost_tokens < 1) {
            throw { status: 400, message: 'Invalid token cost.' }
        }

        const result = await pool.query(
            `UPDATE streams 
            SET certificate_unlocked = true,
                certificate_cost_tokens = $1
            WHERE id = $2
            RETURNING *`,
            [certificate_cost_tokens, req.params.streamId]
        )

        // Notify all members of that stream
        const members = await pool.query(
            `SELECT id FROM members 
            WHERE stream_id = $1 AND is_active = true`,
            [req.params.streamId]
        )

        const { createNotification } = await import('../notifications/notifications.service.js')
        await Promise.all(members.rows.map(m =>
            createNotification(
                m.id,
                'Certificates Available 🎓',
                `Your batch certificates are now available. Pay ${certificate_cost_tokens} token${certificate_cost_tokens !== 1 ? 's' : ''} to unlock your final documents.`,
                'certificate_ready'
            )
        ))

        res.status(200).json({ success: true, data: result.rows[0] })
    } catch (err) {
        next(err)
    }
}


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