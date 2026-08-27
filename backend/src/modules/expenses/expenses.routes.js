import { Router } from 'express'
import { log, getAll, getSummary } from './expenses.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import staffMiddleware from '../../middlewares/staff.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'

const router = Router()

router.use(authMiddleware)

// Coordinator only
router.post('/', devOrRole('coordinator', 'treasurer', 'financial_secretary'), log)
router.get('/', devOrRole(
    'coordinator', 'treasurer', 'financial_secretary',
    'president', 'vice_president', 'secretary'
), getAll)
router.get('/summary', devOrRole(
    'coordinator', 'treasurer', 'financial_secretary',
    'president', 'vice_president', 'secretary'
), getSummary)

export default router