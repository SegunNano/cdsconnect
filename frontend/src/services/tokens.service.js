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