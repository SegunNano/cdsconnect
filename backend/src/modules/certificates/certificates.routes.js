import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { devOrRole } from '../../middlewares/devOrRole.middleware.js'
import {
    getStatus, pay, downloadMembership,
    downloadExcellence, paidMembersList,
    getCollateStatus
} from './certificates.controller.js'
const COLLATE_ROLES = ['secretary']


const router = Router()
router.use(authMiddleware)

// Member routes
router.get('/status', getStatus)
router.post('/pay', pay)
router.get('/download/membership', downloadMembership)
router.get('/download/excellence', downloadExcellence)

// Secretary/Exco — see all paid members and download for them
router.get('/paid-members', devOrRole('secretary'), paidMembersList)


router.get('/collate-status', async (req, res, next) => {
    try {
        const data = await getCollateStatus()
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
})

router.get('/collate', devOrRole(...COLLATE_ROLES), async (req, res, next) => {
    try {
        const data = await getCollateData()
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
})

// Dev marks stream certificates as distributed
router.patch('/collate/:streamId/done', devOrRole(...COLLATE_ROLES), async (req, res, next) => {
    try {
        await pool.query(
            `UPDATE streams 
            SET certificates_distributed = true, certificate_unlocked = false
            WHERE id = $1`,
            [req.params.streamId]
        )
        res.status(200).json({ success: true, message: 'Stream marked as distributed.' })
    } catch (err) { next(err) }
})

export default router