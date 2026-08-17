import { Router } from 'express'
import { download, verify, getMySlips } from './clearance.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'

const router = Router()

// Public — QR verification
router.get('/verify/:qrToken', verify)

// Auth required
router.use(authMiddleware)
router.get('/me', getMySlips)
router.get('/download/:meetingId', download)

export default router