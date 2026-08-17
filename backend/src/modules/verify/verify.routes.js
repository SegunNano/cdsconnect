import { Router } from 'express'
import { verify } from '../clearance/clearance.controller.js'

const router = Router()

router.get('/:qrToken', verify)

export default router