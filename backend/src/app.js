import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { globalSanitizer } from './middlewares/sanitizers.js'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './modules/auth/auth.routes.js'
import memberRoutes from './modules/members/members.routes.js'
import meetingRoutes from './modules/meetings/meetings.routes.js'
import streamsRoutes from './modules/streams/streams.routes.js'
import settingsRoutes from './modules/settings/settings.routes.js'
import attendanceRoutes from './modules/attendance/attendance.routes.js'
import signoutRoutes from './modules/signout/signout.routes.js'
import tokenRoutes from './modules/tokens/tokens.routes.js'
import excuseRoutes from './modules/excuses/excuses.routes.js'
import expenseRoutes from './modules/expenses/expenses.routes.js'
import clearanceRoutes from './modules/clearance/clearance.routes.js'
import notificationRoutes from './modules/notifications/notifications.routes.js'
import pinRoutes from './modules/pin/pin.routes.js'
import deviceRoutes from './modules/device/device.routes.js'
import verifyRoutes from './modules/verify/verify.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'

const app = express()

// ── 1. PROXY & HEADERS ───────────────────────────
app.set('trust proxy', 1)
app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    // Bypass ngrok browser warning page
    app.use((req, res, next) => {
        res.setHeader('ngrok-skip-browser-warning', 'true')
        next()
    })
}

// ── 2. CORS ──────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV === 'development') {
            return callback(null, true)
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error(`CORS policy blocked access for origin: ${origin}`))
    },
    credentials: true
}))

// ── 3. RATE LIMITING ──────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false
})
app.use(limiter)

// ── 4. BODY PARSERS (MUST COME BEFORE SANITIZER) ──
app.use(express.json({ limit: '10kb' })) // Prevents massive payload freezes
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── 5. GLOBAL SANITIZER ───────────────────────────
app.use(globalSanitizer) // Now req.body is defined and gets cleaned properly!

// ── 6. ROUTES ────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/streams', streamsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/signout', signoutRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/excuses', excuseRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/clearance', clearanceRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/pin', pinRoutes)
app.use('/api/device', deviceRoutes)
app.use('/api/verify', verifyRoutes)

// ── 7. ERROR HANDLER ─────────────────────────────
app.use(errorMiddleware)

export default app