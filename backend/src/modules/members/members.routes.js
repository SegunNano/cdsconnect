import { Router } from 'express'
import {
    getMyProfile,
    getMembers,
    updateRole,
    toggleDev,
    extendService,
    deactivate,
    updateProfile
} from './members.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

// Member routes
router.get('/me', getMyProfile)
router.patch('/me', updateProfile)

// Dev only routes
router.get('/', devOrRole('treasurer', 'financial_secretary'), getMembers)


router.use(devMiddleware)
router.patch('/:id/role', updateRole)
router.patch('/:id/dev', toggleDev)
router.patch('/:id/extend', extendService)
router.patch('/:id/deactivate', deactivate)

export default router