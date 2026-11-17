import rateLimit from 'express-rate-limit'

// 5 wrong PINs per 15 minutes per member, per feature name
export const pinAttempts = (name) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => `${name}:${req.member.id}`,
    message: { success: false, message: 'Too many wrong PINs. Try again in 15 minutes.' }
})