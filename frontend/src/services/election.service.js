import api from './api.js'

export const getElectionAdmin = async () => (await api.get('/election/admin')).data
export const createElection = async (payload) => (await api.post('/election/admin', payload)).data
export const electionPhase = async (payload) => (await api.post('/election/admin/phase', payload)).data
export const removeElectionCandidate = async (id, reason) =>
    (await api.post(`/election/admin/candidates/${id}/remove`, { reason })).data

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

// export const getElectionStatus = async () => (await api.get('/election/status')).data.data
export const getElectionStatus = async () => {
    const res = await api.get('/election/status')
    console.log('election status:', res.data)
    return res.data
}
export const getElection = async () => (await api.get('/election')).data

export const applyToElection = async ({ role, manifesto, photo }) => {
    const form = new FormData()
    form.append('role', role)
    form.append('manifesto', manifesto)
    form.append('photo', photo)
    return (await api.post('/election/application', form, multipart)).data.data
}

export const updateElectionApplication = async ({ manifesto, photo }) => {
    const form = new FormData()
    if (manifesto !== undefined) form.append('manifesto', manifesto)
    if (photo) form.append('photo', photo)
    return (await api.patch('/election/application', form, multipart)).data.data
}

export const withdrawElectionApplication = async () => (await api.delete('/election/application')).data.data
export const castElectionVote = async (payload) => (await api.post('/election/vote', payload)).data.data