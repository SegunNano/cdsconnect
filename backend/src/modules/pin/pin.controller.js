import { resetPin } from './pin.service.js'

export const reset = async (req, res, next) => {
    try {
        const { currentPin, newPin, confirmPin } = req.body
        const result = await resetPin(req.member.id, currentPin, newPin, confirmPin)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}