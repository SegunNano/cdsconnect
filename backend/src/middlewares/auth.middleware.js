import { verifyToken } from '../utils/jwt.js'

export default (req, res, next) => {
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
        const memberResult = await pool.query(
            'SELECT token_version FROM members WHERE id = $1',
            [decoded.id]
        )
        if (memberResult.rows[0].token_version !== decoded.token_version) {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' })
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

