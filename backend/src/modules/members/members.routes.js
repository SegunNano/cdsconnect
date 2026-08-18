import { Router } from 'express'
import {
    getMyProfile,
    getMembers,
    updateRole,
    toggleDev,
    resetDevice,
    extendService,
    deactivate
} from './members.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

// Member routes
router.get('/me', getMyProfile)

// Dev only routes
router.get('/', devOrRole('treasurer', 'financial_secretary'), getMembers)
router.patch('/:id/role', devMiddleware, updateRole)
router.patch('/:id/dev', devMiddleware, toggleDev)
router.patch('/:id/device', devMiddleware, resetDevice)
router.patch('/:id/extend', devMiddleware, extendService)
router.patch('/:id/deactivate', devMiddleware, deactivate)

export default router