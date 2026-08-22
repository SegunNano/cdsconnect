import {
    startRegistration,
    startAuthentication
} from '@simplewebauthn/browser'
import api from './api'

export const registerDevice = async () => {
    const optionsRes = await api.get('/auth/webauthn/register/options')
    const options = optionsRes.data.data
    
    const credential = await startRegistration(options)

    const verifyRes = await api.post('/auth/webauthn/register/verify', credential)

    const credentialId = verifyRes.data?.data?.credentialId || credential.id
    
    if (credentialId) {
        localStorage.setItem('cds_credential_id', credentialId)
    }

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