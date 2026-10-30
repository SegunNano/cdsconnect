import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import {
    overview, members, attendanceReport,
    membersPdf, attendancePdf
} from './coordinator.controller.js'

const router = Router()

router.use(authMiddleware)
router.use(requireRole('coordinator'))

// Staff only
router.get('/overview', overview)
router.get('/members', members)
router.get('/attendance/:meetingId', attendanceReport)

router.get('/members/pdf', membersPdf)
router.get('/attendance/:meetingId/pdf', attendancePdf)

export default router