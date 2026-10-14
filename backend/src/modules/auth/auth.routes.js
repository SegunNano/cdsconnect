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


router.post('/logout', authMiddleware, async (req, res, next) => {
    try {
        // Increment token_version — invalidates all existing tokens
        await pool.query(
            'UPDATE members SET token_version = token_version + 1 WHERE id = $1',
            [req.member.id]
        )
        res.status(200).json({ success: true, message: 'Logged out successfully.' })
    } catch (err) {
        next(err)
    }
})

export default router