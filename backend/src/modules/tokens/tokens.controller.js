import {
    topUpTokens,
    getMemberTopUpHistory,
    getMyTopUpHistory,
    getAllTopUps,
    transferTokens
} from './tokens.service.js'

export const transfer = async (req, res, next) => {
    try {
        const senderId = req.member.id;
        const { recipientStateCode, tokensToTransfer } = req.body;

        // Safely parse and validate tokens to prevent NaN reaching the database
        const parsedTokens = parseInt(tokensToTransfer, 10);

        if (isNaN(parsedTokens) || parsedTokens < 1) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide a valid token amount of at least 1.'
            });
        }

        // Pass the clean, parsed integer to your service
        const result = await transferTokens(senderId, recipientStateCode, parsedTokens);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (err) {
        res.status(err.status || 500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

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