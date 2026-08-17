import { Router } from 'express'
import { getMyList, getUnread, readOne, readAll } from './notifications.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getMyList)
router.get('/unread', getUnread)
router.patch('/:id/read', readOne)
router.patch('/read-all', readAll)

export default router