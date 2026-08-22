import {
    topUpTokens,
    getMemberTopUpHistory,
    getMyTopUpHistory,
    getAllTopUps
} from './tokens.service.js'

export const topUp = async (req, res, next) => {
    try {
        const { memberId, tokensToAdd } = req.body
        const result = await topUpTokens(req.member.id, memberId, tokensToAdd)
        res.status(200).json({
            success: true,
            message: `${tokensToAdd} token(s) added successfully. ₦${result.naira_value.toLocaleString()} collected.`,
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getMyTopUps = async (req, res, next) => {
    try {
        const topups = await getMemberTopUpHistory(req.member.id)
        res.status(200).json({ success: true, data: topups })
    } catch (err) {
        next(err)
    }
}
export const history = async (req, res, next) => {
    try {
        const history = await getMyTopUpHistory(req.member.id)
        res.status(200).json({ success: true, data: history })
        } catch (err) {
            next(err)
        }
}

export const getAll = async (req, res, next) => {
    try {
        const topups = await getAllTopUps()
        res.status(200).json({ success: true, data: topups })
    } catch (err) {
        next(err)
    }
}