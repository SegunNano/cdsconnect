import { Router } from 'express'
import { getAll, getActive, create, toggleActive } from './streams.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

// Public — for registration form
router.get('/active', getActive)

// Auth required
router.use(authMiddleware)

// Dev only
router.get('/', devMiddleware, getAll)
router.post('/', devMiddleware, create)
router.patch('/:id/toggle', devMiddleware, toggleActive)

export default router