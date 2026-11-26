import rateLimit from 'express-rate-limit'

const limiters = new Map()

export const pinAttempts = (name) => {
    if (!limiters.has(name)) {
        limiters.set(
            name,
            rateLimit({
                windowMs: 15 * 60 * 1000,
                limit: 5,
                skipSuccessfulRequests: true,
                keyGenerator: (req) => `${name}:${req.member.id}`,
                message: {
                    success: false,
                    message: 'Too many wrong PINs. Try again in 15 minutes.'
                }
            })
        )
    }

    return limiters.get(name)
}