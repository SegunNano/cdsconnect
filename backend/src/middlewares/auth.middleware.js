import { verifyToken } from '../utils/jwt.js'
import pool from '../config/db.js'

// Added `async` keyword here
export default async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorised. No token provided.'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = verifyToken(token)

        // Query database for member's current token_version
        const memberResult = await pool.query(
            'SELECT token_version FROM members WHERE id = $1',
            [decoded.id]
        )

        // Handle deleted or non-existent member
        if (memberResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorised. User no longer exists.' 
            })
        }

        // Verify token_version matches DB state (forces logout on password/PIN reset or remote revocation)
        if (memberResult.rows[0].token_version !== decoded.token_version) {
            return res.status(401).json({ 
                success: false, 
                message: 'Session expired. Please log in again.' 
            })
        }
        
        req.member = decoded
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorised. Invalid or expired token.'
        })
    }
}