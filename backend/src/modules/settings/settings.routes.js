import { Router } from 'express'
import { getAccount, getStatus, toggle, updateAccount } from './settings.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { pinAttempts } from '../../middlewares/pinAttempts.js'

const router = Router()

// Public — frontend checks if registration is open
router.get('/registration', getStatus)

router.use(authMiddleware)

router.get('/payment-account', getAccount)

router.use(devMiddleware)

router.patch('/registration/toggle', toggle)
router.put('/payment-account', pinAttempts, updateAccount)

export default router