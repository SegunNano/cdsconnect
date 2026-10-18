import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'

import {
    getStatus,
    pay,
    downloadMembership,
    downloadExcellence,
    paidMembersList,
    collateStatus,
    collate,
    markCollateDone
} from './certificates.controller.js'

const COLLATE_ROLES = ['secretary']

const router = Router()

router.use(authMiddleware)

// Member routes
router.get('/status', getStatus)
router.post('/pay', pay)
router.get('/download/membership', downloadMembership)
router.get('/download/excellence', downloadExcellence)

// Secretary/Exco routes
router.get('/paid-members', requireRole('secretary'), paidMembersList)

// Certificate collation routes
router.get('/collate-status', collateStatus)
router.get('/collate', requireRole(...COLLATE_ROLES), collate)
router.patch(
    '/collate/:streamId/done',
    requireRole(...COLLATE_ROLES),
    markCollateDone
)

export default router
