import { Router } from 'express'
import {
    memberSignIn,
    getMyAttendance,
    getMeetingAttendanceList,
    getTodayStatus
} from './attendance.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/signin', memberSignIn)
router.get('/me', getMyAttendance)
router.get('/today', getTodayStatus)
router.get('/meeting/:meetingId', getMeetingAttendanceList)

export default router