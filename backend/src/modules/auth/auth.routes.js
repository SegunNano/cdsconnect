import { Router } from 'express'
import {
    register,
    getWebAuthnRegistrationOptions,
    verifyWebAuthnRegistration,
    getWebAuthnLoginOptions,
    verifyWebAuthnLogin,
    pinLogin
} from './auth.controller.js'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import authMiddleware from '../../middlewares/auth.middleware.js'



export const pinLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    // Safely combine IPv6-compliant IP generation with the target account email
    keyGenerator: (req, res) => {
        const ip = ipKeyGenerator(req, res)
        const accountIdentifier = (req.body?.email || req.body?.state_code || '').trim().toLowerCase()
        return `${ip}:${accountIdentifier}`
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        success: false, 
        message: 'Too many login attempts. Please try again in 15 minutes.' 
    }
})

const router = Router()

// Registration
router.post('/register', register)

// WebAuthn device registration — after initial registration

// WebAuthn login
router.post('/webauthn/login/options', getWebAuthnLoginOptions)
router.post('/webauthn/login/verify', verifyWebAuthnLogin)


// PIN login — fallback
router.post('/login/pin', pinLoginLimiter, pinLogin)

router.use(authMiddleware)
router.get('/webauthn/register/options', getWebAuthnRegistrationOptions)
router.post('/webauthn/register/verify', verifyWebAuthnRegistration)
router.post('/logout', async (req, res, next) => {
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