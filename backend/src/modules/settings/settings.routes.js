import { Router } from 'express'
import { getStatus, toggle } from './settings.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

// Public — frontend checks if registration is open
router.get('/registration', getStatus)

// Dev only
router.use(authMiddleware)
router.patch('/registration/toggle', devMiddleware, toggle)

export default router