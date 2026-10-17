import { Router } from 'express'
import { getAll, getActive, create, toggleActive, updateCertificate } from './streams.controller.js'
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
router.patch('/:streamId/certificates', devMiddleware, updateCertificate)

export default router