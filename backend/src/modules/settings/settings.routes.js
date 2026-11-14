import { Router } from 'express'
import { getAccount, getStatus, toggle, updateAccount } from './settings.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

import rateLimit from 'express-rate-limit'
// 5 wrong attempts per 15 minutes per dev, so a stolen session can't guess the PIN
const pinAttempts = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => `payment-account:${req.member.id}`,
    message: { success: false, message: 'Too many wrong PINs. Try again in 15 minutes.' }
})

const router = Router()

// Public — frontend checks if registration is open
router.get('/registration', getStatus)

router.use(authMiddleware)

router.get('/payment-account', getAccount)

router.use(devMiddleware)

router.patch('/registration/toggle', toggle)
router.put('/payment-account', pinAttempts, updateAccount)

export default router