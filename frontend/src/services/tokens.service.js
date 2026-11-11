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

export const getMyTopUpRequests = async () => (await api.get('/tokens/requests/me')).data
export const cancelTopUpRequest = async (id) => (await api.patch(`/tokens/requests/${id}/cancel`)).data
export const getTopUpRequests = async (params) => (await api.get('/tokens/requests', { params })).data
export const getPendingTopUpCount = async () => (await api.get('/tokens/requests/pending-count')).data
export const reviewTopUpRequest = async (id, payload) => (await api.post(`/tokens/requests/${id}/review`, payload)).data

export const submitTopUpRequest = async ({ tokensRequested, senderName, transferReference, proof }) => {
    const form = new FormData()
    form.append('tokensRequested', tokensRequested)
    form.append('senderName', senderName)
    form.append('transferReference', transferReference)
    if (proof) form.append('proof', proof)
    return (await api.post('/tokens/requests', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data
}