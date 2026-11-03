import { Router } from 'express'
import { log, getAll, getSummary } from './expenses.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)

// Coordinator only
router.post('/', requireRole('coordinator', 'treasurer', 'financial_secretary'), log)
router.get('/', requireRole(
    'coordinator', 'treasurer', 'financial_secretary',
    'president', 'vice_president', 'secretary'
), getAll)
router.get('/summary', requireRole(
    'coordinator', 'treasurer', 'financial_secretary',
    'president', 'vice_president', 'secretary'
), getSummary)

export default router