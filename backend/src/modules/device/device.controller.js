import { resetMemberDevice } from './device.service.js'

export const resetDevice = async (req, res, next) => {
    try {
        const result = await resetMemberDevice(req.member.id, req.params.memberId)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}