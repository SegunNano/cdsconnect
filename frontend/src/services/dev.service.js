import api from './api.js'

export const getAllMembers = async () => {
    const response = await api.get('/members')
    return response.data
}

export const updateMemberRole = async (memberId, role) => {
    const response = await api.patch(`/members/${memberId}/role`, { role })
    return response.data
}

export const toggleDevAccess = async (memberId) => {
    const response = await api.patch(`/members/${memberId}/dev`)
    return response.data
}

export const resetMemberDevice = async (memberId) => {
    const response = await api.patch(`/device/${memberId}/reset`)
    return response.data
}

export const deactivateMember = async (memberId) => {
    const response = await api.patch(`/members/${memberId}/deactivate`)
    return response.data
}

export const createMeeting = async (data) => {
    const response = await api.post('/meetings', data)
    return response.data
}

export const getAllMeetings = async () => {
    const response = await api.get('/meetings')
    return response.data
}

export const getAllStreams = async () => {
    const response = await api.get('/streams')
    return response.data
}

export const createStream = async (data) => {
    const response = await api.post('/streams', data)
    return response.data
}

export const toggleStreamActive = async (streamId) => {
    const response = await api.patch(`/streams/${streamId}/toggle`)
    return response.data
}

export const getRegistrationStatus = async () => {
    const response = await api.get('/settings/registration')
    return response.data
}

export const toggleRegistration = async () => {
    const response = await api.patch('/settings/registration/toggle')
    return response.data
}