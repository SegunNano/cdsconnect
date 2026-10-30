import { Router } from 'express'
import { getSignOutList, signOut, getToday } from './signout.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)
router.use(requireRole('president', 'vice_president'))

// Today's meeting
router.get('/today', getToday)

// President and VP only
router.get('/list/:meetingId', getSignOutList)
router.post('/confirm', signOut)

export default router