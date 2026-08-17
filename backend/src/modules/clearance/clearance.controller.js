import {
    generateClearanceSlip,
    verifyClearanceSlip,
    getMyClearanceSlips
} from './clearance.service.js'

export const download = async (req, res, next) => {
    try {
        const { meetingId } = req.params
        const result = await generateClearanceSlip(req.member.id, meetingId)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=clearance_${result.member.state_code}_${result.month}.pdf`
        )
        res.send(result.buffer)
    } catch (err) {
        next(err)
    }
}

export const verify = async (req, res, next) => {
    try {
        const result = await verifyClearanceSlip(req.params.qrToken)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}

export const getMySlips = async (req, res, next) => {
    try {
        const slips = await getMyClearanceSlips(req.member.id)
        res.status(200).json({ success: true, data: slips })
    } catch (err) {
        next(err)
    }
}