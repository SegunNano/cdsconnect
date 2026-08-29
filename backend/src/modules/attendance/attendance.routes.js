import { Router } from 'express'
import {
    memberSignIn,
    getMyAttendance,
    getMeetingAttendanceList,
    getTodayStatus,
    manualMarkPresent,
    getTodayAttendance,
    reinstate,
    getSuspensionStatus 
} from './attendance.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/signin', memberSignIn)
router.get('/me', getMyAttendance)
router.get('/today', getTodayStatus)
router.get('/meeting/:meetingId', getMeetingAttendanceList)
router.get('/today/status', getTodayAttendance)
router.get('/suspension', getSuspensionStatus)

// Dev only
router.post('/mark-present', devMiddleware, manualMarkPresent)
router.post('/reinstate', devMiddleware, reinstate)
router.get('/suspension/:memberId', devMiddleware, getSuspensionStatus)

export default router