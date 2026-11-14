import api from './api.js'

export const getPaymentAccount = async () => (await api.get('/settings/payment-account')).data
export const updatePaymentAccount = async (payload) => (await api.put('/settings/payment-account', payload)).data