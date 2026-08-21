import {
    startRegistration,
    startAuthentication
} from '@simplewebauthn/browser'
import api from './api'

export const registerDevice = async () => {
    // Get options from server
    const optionsRes = await api.get('/auth/webauthn/register/options')
    const options = optionsRes.data.data

    // Trigger browser to create credential
    const credential = await startRegistration(options)

    // Send credential to server to verify and save
    const verifyRes = await api.post('/auth/webauthn/register/verify', credential)
    return verifyRes.data
}

export const authenticateWithDevice = async (email) => {
    // Get challenge from server
    const optionsRes = await api.post('/auth/webauthn/login/options', { email })
    const options = optionsRes.data.data

    // Trigger browser to sign challenge
    const credential = await startAuthentication(options)

    // Send to server to verify
    const verifyRes = await api.post('/auth/webauthn/login/verify', { email, credential })
    return verifyRes.data
}