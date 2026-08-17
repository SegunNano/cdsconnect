import multer from 'multer'
import supabase from '../../config/supabase.js'
import { Router } from 'express'
import { file, getMyExcuseList, getPending, getAll, review } from './excuses.controller.js'
import authMiddleware from '../../middlewares/auth.middleware.js'
import staffMiddleware from '../../middlewares/staff.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import devMiddleware from '../../middlewares/dev.middleware.js'

const router = Router()

router.use(authMiddleware)

// Member
const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', upload.single('evidence'), async (req, res, next) => {
    try {
        const file = req.file
        if (!file) throw { status: 400, message: 'No file uploaded' }

        const fileName = `${Date.now()}_${file.originalname}`

        const { data, error } = await supabase.storage
        .from('evidence')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            })
            
        if (error) throw { status: 500, message: error.message }
        
        const { data: urlData } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)

            res.status(200).json({
            success: true,
            data: { url: urlData.publicUrl }
        })
    } catch (err) {
        next(err)
    }
})

router.post('/', file)
router.get('/me', getMyExcuseList)


// Coordinator
router.get('/pending', staffMiddleware, getPending)
router.post('/review', staffMiddleware, review)

// Dev
router.get('/', devMiddleware, getAll)

export default router