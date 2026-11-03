import { Router } from 'express'
import {
    getMyProfile,
    getMembers,
    updateRole,
    toggleDev,
    extendService,
    deactivate,
    updateProfile,
    resetPinByDev
} from './members.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'
import { devUpdateMemberDetails } from './members.service.js'

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
router.post('/:id/reset-pin', resetPinByDev)
router.patch('/:id/details', async (req, res, next) => {
    try {
        const data = await devUpdateMemberDetails(req.params.id, req.body)
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
})

export default router