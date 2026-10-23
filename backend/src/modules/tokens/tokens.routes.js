import { Router } from 'express'
import { topUp, getMyTopUps, getAll, history, transfer } from './tokens.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)

// Member
router.get('/me', getMyTopUps)
router.post('/transfer', transfer)

// Treasurer and financial secretary only
router.post('/topup', requireRole('treasurer', 'financial_secretary'), topUp)
router.get('/history', history)

// Dev only
router.get('/', devMiddleware, getAll)

export default router