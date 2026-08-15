import { Router } from 'express'
import {
    register,
    getWebAuthnRegistrationOptions,
    verifyWebAuthnRegistration,
    getWebAuthnLoginOptions,
    verifyWebAuthnLogin,
    pinLogin
} from './auth.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'

const router = Router()

// Registration
router.post('/register', register)

// WebAuthn device registration — after initial registration
router.get('/webauthn/register/options', authMiddleware, getWebAuthnRegistrationOptions)
router.post('/webauthn/register/verify', authMiddleware, verifyWebAuthnRegistration)

// WebAuthn login
router.post('/webauthn/login/options', getWebAuthnLoginOptions)
router.post('/webauthn/login/verify', verifyWebAuthnLogin)

// PIN login — fallback
router.post('/login/pin', pinLogin)

export default router