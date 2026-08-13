import api from './api.js'

export const getMyProfile = async () => {
    const response = await api.get('/members/me')
    return response.data
}