import api from './api.js'

export const getTodayStatus = async () => {
    const response = await api.get('/attendance/today')
    return response.data
}

export const signIn = async (latitude, longitude) => {
    const response = await api.post('/attendance/signin', { latitude, longitude })
    return response.data
}

export const getMyAttendance = async () => {
    const response = await api.get('/attendance/me')
    return response.data
}

export const getTodayAttendance = async () => {
    const response = await api.get('/attendance/today/status')
    return response.data
}