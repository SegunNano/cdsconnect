import { logIncome, getAllIncome } from './income.service.js'

export const log = async (req, res, next) => {
    try {
        const { amount, description, source } = req.body
        const result = await logIncome(req.member.id, amount, description, source)
        res.status(201).json({
            success: true,
            message: `₦${amount.toLocaleString()} income recorded successfully.`,
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getAll = async (req, res, next) => {
    try {
        const income = await getAllIncome()
        res.status(200).json({ success: true, data: income })
    } catch (err) {
        next(err)
    }
}