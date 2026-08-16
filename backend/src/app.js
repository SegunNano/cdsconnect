import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
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
// import expenseRoutes from './modules/expenses/expenses.routes.js'
// import clearanceRoutes from './modules/clearance/clearance.routes.js'
// import notificationRoutes from './modules/notifications/notifications.routes.js'
// import pinRoutes from './modules/pin/pin.routes.js'
// import deviceRoutes from './modules/device/device.routes.js'
// import verifyRoutes from './modules/verify/verify.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'

const app = express()

// ── SECURITY ─────────────────────────────────────
app.use(helmet())
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
]

if (process.env.NODE_ENV === 'development') {
    // Bypass ngrok browser warning
    app.use((req, res, next) => {
        res.setHeader('ngrok-skip-browser-warning', 'true')
        next()
    })
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true)
        }
        // Restrict in production
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))
// ── RATE LIMITING ────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
})
app.set('trust proxy', 1)
app.use(limiter)

// ── BODY PARSER ──────────────────────────────────
app.use(express.json())

// ── ROUTES ───────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/streams', streamsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/signout', signoutRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/excuses', excuseRoutes)
// app.use('/api/expenses', expenseRoutes)
// app.use('/api/clearance', clearanceRoutes)
// app.use('/api/notifications', notificationRoutes)
// app.use('/api/pin', pinRoutes)
// app.use('/api/device', deviceRoutes)
// app.use('/api/verify', verifyRoutes)

// ── ERROR HANDLER ────────────────────────────────
app.use(errorMiddleware)

export default app