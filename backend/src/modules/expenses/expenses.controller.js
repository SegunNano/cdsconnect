import {
    logExpense,
    getAllExpenses,
    getTreasurySummary
} from './expenses.service.js'

export const log = async (req, res, next) => {
    try {
        const { amount, description } = req.body
        const result = await logExpense(req.member.id, amount, description)
        res.status(201).json({
            success: true,
            message: `Expense of ₦${amount.toLocaleString()} logged successfully.`,
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getAll = async (req, res, next) => {
    try {
        const expenses = await getAllExpenses()
        res.status(200).json({ success: true, data: expenses })
    } catch (err) {
        next(err)
    }
}

export const getSummary = async (req, res, next) => {
    try {
        const summary = await getTreasurySummary()
        res.status(200).json({ success: true, data: summary })
    } catch (err) {
        next(err)
    }
}