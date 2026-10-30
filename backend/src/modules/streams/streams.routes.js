import { Router } from 'express'
import { getAll, getActive, create, toggleActive, updateCertificate } from './streams.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

// Public — for registration form
router.get('/active', getActive)

// Auth required
router.use(authMiddleware)
router.use(devMiddleware)

// Dev only
router.get('/', getAll)
router.post('/', create)
router.patch('/:id/toggle', toggleActive)
router.patch('/:streamId/certificates', updateCertificate)

export default router