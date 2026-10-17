import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'
import {
    getStatus, pay, downloadMembership,
    downloadExcellence, paidMembersList
} from './certificates.controller.js'

const router = Router()
router.use(authMiddleware)

// Member routes
router.get('/status', getStatus)
router.post('/pay', pay)
router.get('/download/membership', downloadMembership)
router.get('/download/excellence', downloadExcellence)

// Secretary/Exco — see all paid members and download for them
router.get('/paid-members', devOrRole(
    'secretary', 'president', 'vice_president', 'coordinator'
), paidMembersList)

export default router