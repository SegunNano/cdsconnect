import { Router } from 'express'
import multer from 'multer'
import {
    topUp,
    transfer,
    history,
    getAll,
    submitRequest,
    cancelRequest,
    getMyRequests,
    getPendingCount,
    getTreasurerRequests,
    reviewRequest
} from './tokens.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

// Configure multer memory storage for single file proof upload (5MB max cap)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }
})



router.use(authMiddleware)

// --- MEMBER TOKEN ACTIONS ---
router.post('/transfer', transfer)
router.get('/history', history)

// Phase 2: Top-up Requests (Member Side)
router.post('/requests', upload.single('proof'), submitRequest)
router.get('/requests/me', getMyRequests)
router.patch('/requests/:id/cancel', cancelRequest)

router.use(requireRole('treasurer', 'financial_secretary'))
// --- TREASURER / FINANCIAL SECRETARY ROUTES ---
router.post('/topup', topUp)

// Phase 2: Top-up Requests Reviewer Dashboard
router.get('/requests/pending-count', getPendingCount)
router.get('/requests', getTreasurerRequests)
router.post('/requests/:id/review', reviewRequest)

// Dev only route
router.get('/', devMiddleware, getAll)

export default router