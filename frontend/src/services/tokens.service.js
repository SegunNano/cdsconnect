import api from './api.js'

export const getAllMembers = async () => {
    const response = await api.get('/members')
    return response.data
}

export const topUpMember = async (memberId, tokensToAdd) => {
    const response = await api.post('/tokens/topup', { memberId, tokensToAdd })
    return response.data
}

export const getMyTopUps = async () => {
    const response = await api.get('/tokens/me')
    return response.data
}
export const getMyTokenHistory = async () => {
    const response = await api.get('/tokens/history')
    // Return array payload directly regardless of backend format wrapper
    return response.data?.data || response.data
}


export const transferTokens = async (recipientStateCode, tokensToTransfer) => {
    const response = await api.post('/tokens/transfer', {
        recipientStateCode,
        tokensToTransfer
    })
    return response.data
}

