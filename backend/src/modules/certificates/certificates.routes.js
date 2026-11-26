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

const COLLATE_ROLES = ['general_secretary']

const router = Router()

router.use(authMiddleware)

// Member routes
router.get('/status', getStatus)
router.post('/pay', pay)
// router.get('/download/membership', downloadMembership)
// router.get('/download/excellence', downloadExcellence)


router.use(requireRole(...COLLATE_ROLES))

// Certificate collation routes
router.get('/paid-members', paidMembersList)
router.get('/collate-status', collateStatus)
router.get('/collate', collate)
router.patch('/collate/:streamId/done', markCollateDone)
router.get('/collate/:streamId/pdf', async (req, res, next) => {
    try {
        const buffer = await buildCollationPdf(Number(req.params.streamId))
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="paid-certificates-${req.params.streamId}.pdf"`,
            'Content-Length': buffer.length
        })
        res.send(buffer)
    } catch (err) { next(err) }
})

export default router
