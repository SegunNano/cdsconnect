import {
    startRegistration,
    startAuthentication
} from '@simplewebauthn/browser'
import api from './api'

export const registerDevice = async () => {
    // 1. Get registration options from server
    const optionsRes = await api.get('/auth/webauthn/register/options')
    const options = optionsRes?.data?.data || optionsRes?.data || optionsRes

    if (!options || !options.challenge) {
        throw new Error('Failed to retrieve WebAuthn registration options.')
    }

    // 2. Pass options to browser WebAuthn prompt
    const credential = await startRegistration(options)

    // 3. Verify credential with backend
    const verifyRes = await api.post('/auth/webauthn/register/verify', credential)
    const resData = verifyRes?.data || verifyRes

    // 4. Save hardware credential ID for local session persistence
    const credentialId = resData?.data?.credentialId || credential.id
    if (credentialId) {
        localStorage.setItem('cds_credential_id', credentialId)
    }

    return resData
}

export const authenticateWithDevice = async (email, clientCredentialId) => {
    // 1. Request challenge from server
    const optionsRes = await api.post('/auth/webauthn/login/options', { email, clientCredentialId })
    const options = optionsRes?.data?.data || optionsRes?.data || optionsRes

    if (!options || !options.challenge) {
        throw new Error('Failed to retrieve WebAuthn login options.')
    }

    // 2. Trigger browser hardware assertion prompt
    const credential = await startAuthentication(options)

    // 3. Send assertion response to server for verification
    const verifyRes = await api.post('/auth/webauthn/login/verify', { email, credential })
    const resData = verifyRes?.data || verifyRes

    return resData
}