import {
    topUpTokens,
    transferTokens,
    getMyTopUpHistory,
    getAllTopUps,
    uploadProof,
    createTopUpRequest,
    cancelTopUpRequest,
    getMyTopUpRequests,
    getPendingTopUpCount,
    getTreasurerTopUpRequests,
    reviewTopUpRequest
} from './tokens.service.js'

// --- HELPER FOR CLEAN RESPONSES ---
const handle = (fn, status = 200) => async (req, res, next) => {
    try {
        res.status(status).json({ success: true, data: await fn(req) })
    } catch (err) {
        next(err)
    }
}

// --- PHASE 1 & GENERAL TOKEN CONTROLLERS ---

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

export const transfer = async (req, res, next) => {
    try {
        const senderId = req.member.id
        const { recipientStateCode, tokensToTransfer } = req.body

        const parsedTokens = parseInt(tokensToTransfer, 10)
        if (isNaN(parsedTokens) || parsedTokens < 1) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide a valid token amount of at least 1.'
            })
        }

        const result = await transferTokens(senderId, recipientStateCode, parsedTokens)

        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (err) {
        res.status(err.status || 500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        })
    }
}

export const history = handle(async (req) => {
    return await getMyTopUpHistory(req.member.id)
})

export const getAll = handle(async () => {
    return await getAllTopUps()
})

// --- PHASE 2 TOP-UP REQUEST CONTROLLERS ---

export const submitRequest = handle(async (req) => {
    const proofPath = req.file ? await uploadProof(req.file) : null
    return await createTopUpRequest(req.member.id, { ...req.body, proofPath })
}, 201)

export const cancelRequest = handle(async (req) => {
    return await cancelTopUpRequest(req.member.id, Number(req.params.id))
})

export const getMyRequests = handle(async (req) => {
    return await getMyTopUpRequests(req.member.id)
})

export const getPendingCount = handle(async () => {
    return await getPendingTopUpCount()
})

export const getTreasurerRequests = handle(async (req) => {
    return await getTreasurerTopUpRequests(req.query)
})

export const reviewRequest = handle(async (req) => {
    return await reviewTopUpRequest(req.member.id, Number(req.params.id), req.body)
})