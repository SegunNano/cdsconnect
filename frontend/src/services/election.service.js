import api from './api.js'

export const getElectionAdmin = async () => (await api.get('/election/admin')).data
export const createElection = async (payload) => (await api.post('/election/admin', payload)).data
export const electionPhase = async (payload) => (await api.post('/election/admin/phase', payload)).data
export const removeElectionCandidate = async (id, reason) =>
    (await api.post(`/election/admin/candidates/${id}/remove`, { reason })).data