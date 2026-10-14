import { Router } from 'express'
import { log, getAll } from './income.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'

const router = Router()

router.use(authMiddleware)

// Log income — treasurer, fin sec, coordinator
router.post('/', devOrRole('treasurer', 'financial_secretary', 'coordinator'), log)

// View income — same roles + president, vp, secretary
router.get('/', devOrRole(
    'treasurer', 'financial_secretary', 'coordinator',
    'president', 'vice_president', 'secretary'
), getAll)

export default router
