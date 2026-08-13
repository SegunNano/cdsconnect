import { Router } from 'express'
import { create, getActive, getAll, getOne } from './meetings.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)

// All members
router.get('/active', getActive)
router.get('/', getAll)
router.get('/:id', getOne)

// Dev only
router.post('/', devMiddleware, create)

export default router