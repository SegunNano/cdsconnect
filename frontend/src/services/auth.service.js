import api from './api.js'

export const loginService = async (email, pin, credentialId=null) => {
    const response = await api.post('/auth/login/pin', { email, pin, credentialId })
    return response.data
}

export const registerService = async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
}