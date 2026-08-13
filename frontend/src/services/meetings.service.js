import api from './api.js'

export const getActiveMeeting = async () => {
    const response = await api.get('/meetings/active')
    return response.data
}