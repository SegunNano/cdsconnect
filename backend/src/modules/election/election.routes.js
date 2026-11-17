import { Router } from 'express'
import multer from 'multer'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import { pinAttempts } from '../../middlewares/pinAttempts.js'
import * as electionController from './election.controller.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } })
const phasePinLimit = pinAttempts('election')

// The coordinator is staff, not a voter or a candidate
const corpsOnly = (req, res, next) =>
    req.member.member_type === 'corps_member'
        ? next()
        : res.status(403).json({ success: false, message: 'Only corps members can take part.' })

router.use(authMiddleware)

// Dev routes. Declared first so nothing below can shadow it.
router.get('/admin', devMiddleware, electionController.handleGetAdminState)
router.post('/admin', devMiddleware, electionController.handleCreateElection)
router.post('/admin/phase', devMiddleware,
    (req, res, next) => ['start_voting', 'close_election'].includes(req.body?.action)
        ? phasePinLimit(req, res, next) : next(),
    electionController.handleTransitionElection)
router.post('/admin/candidates/:id/remove', devMiddleware, electionController.handleRemoveCandidate)

// Member routes
router.get('/status', corpsOnly, electionController.handleGetElectionStatus)
router.get('/', corpsOnly, electionController.handleGetElectionState)
router.post('/application', corpsOnly, upload.single('photo'), electionController.handleApplyToPosition)
router.patch('/application', corpsOnly, upload.single('photo'), electionController.handleUpdateApplication)
router.delete('/application', corpsOnly, electionController.handleWithdrawApplication)
router.post('/vote', corpsOnly, electionController.handleCastVote)

export default router