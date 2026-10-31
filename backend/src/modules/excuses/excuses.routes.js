import multer from 'multer'
import supabase from '../../config/supabase.js'
import { Router } from 'express'
import { file, getMyExcuseList, getPending, getAll, review, checkEligibility } from './excuses.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import staffMiddleware from '../../middlewares/staff.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'
import crypto from 'crypto'

const router = Router()

router.use(authMiddleware)

// Member - Multer memory storage with strict 5MB size limit (Fixes F-04)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }
})

router.post('/upload', upload.single('evidence'), async (req, res, next) => {
    try {
        const file = req.file
        if (!file) throw { status: 400, message: 'No file uploaded' }

        // Validate actual file content — not just extension
        const { fileTypeFromBuffer } = await import('file-type')
        const detected = await fileTypeFromBuffer(file.buffer)

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (!detected || !allowedTypes.includes(detected.mime)) {
            throw { status: 400, message: 'Invalid file type. Only JPG, PNG, WebP and PDF are allowed.' }
        }

        // Random filename — not timestamp based
        const randomName = crypto.randomBytes(16).toString('hex')
        const extension = detected.ext
        const fileName = `${randomName}.${extension}`

        // 1. Upload file buffer to Supabase storage
        const { error } = await supabase.storage
            .from('evidence')
            .upload(fileName, file.buffer, {
                contentType: detected.mime
            })

        if (error) throw { status: 500, message: error.message }

        // 2. Store PATH ONLY instead of a permanent public URL (Fixes F-03)
        res.status(200).json({
            success: true,
            data: { url: fileName } 
        })
    } catch (err) {
        next(err)
    }
})

router.post('/', file)
router.get('/me', getMyExcuseList)

// Coordinator
router.get('/pending', staffMiddleware, getPending)
router.get('/eligibility', checkEligibility)
router.post('/review', staffMiddleware, review)

// Dev
router.get('/', devMiddleware, getAll)

export default router