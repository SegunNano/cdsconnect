import { Router } from 'express'
import { getSignOutList, signOut, getToday } from './signout.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)

// Today's meeting
router.get('/today', getToday)

// President and VP only
router.get('/list/:meetingId', requireRole('president', 'vice_president'), getSignOutList)
router.post('/confirm', requireRole('president', 'vice_president'), signOut)

export default router