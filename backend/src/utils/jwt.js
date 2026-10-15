import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

export const generateToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            token_version: payload.token_version ?? 1 // <--- FIXED: Guarantees claim existence
        },
        JWT_SECRET,
        { expiresIn: '60m' }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}