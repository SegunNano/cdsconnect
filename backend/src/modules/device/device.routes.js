import { Router } from 'express'
import { resetDevice } from './device.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)
router.use(devMiddleware)

router.patch('/:memberId/reset', resetDevice)

export default router