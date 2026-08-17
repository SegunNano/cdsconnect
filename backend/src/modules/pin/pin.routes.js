import { Router } from 'express'
import { reset } from './pin.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.patch('/reset', reset)

export default router