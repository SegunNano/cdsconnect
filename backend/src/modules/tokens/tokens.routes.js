import { Router } from 'express'
import { topUp, getMyTopUps, getAll } from './tokens.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)

// Member
router.get('/me', getMyTopUps)

// Treasurer and financial secretary only
router.post('/topup', requireRole('treasurer', 'financial_secretary'), topUp)

// Dev only
router.get('/', devMiddleware, getAll)

export default router