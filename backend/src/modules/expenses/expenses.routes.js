import { Router } from 'express'
import { log, getAll, getSummary } from './expenses.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import staffMiddleware from '../../middlewares/staff.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)
router.use(staffMiddleware)

// Coordinator only
router.post('/', log)
router.get('/', getAll)
router.get('/summary', getSummary)

export default router