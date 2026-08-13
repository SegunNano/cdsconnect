import api from './api.js'

export const loginService = async (email, pin, device_fingerprint) => {
    const response = await api.post('/auth/login', {
        email,
        pin,
        device_fingerprint
    })
    return response.data
}

export const registerService = async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
}