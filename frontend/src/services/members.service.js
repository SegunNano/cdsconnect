import api from './api.js'

export const getMyProfile = async () => {
    const response = await api.get('/members/me')
    return response.data
}
export const updateMyProfile = async (data) => {
    const response = await api.patch('/members/me', data)
    return response.data
}