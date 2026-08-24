import api from './api.js'

export const getActiveStreams = async () => {
    const response = await api.get('/streams/active')
    return response.data
}