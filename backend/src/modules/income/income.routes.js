import { Router } from 'express'
import { log, getAll } from './income.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)

// Log income — treasurer, fin sec, coordinator
router.post('/', requireRole('treasurer', 'financial_secretary'), log)

// View income — same roles + president, vp, secretary
router.get('/', requireRole(
    'treasurer', 'financial_secretary', 
    'president', 'vice_president', 'secretary'
), getAll)

export default router
