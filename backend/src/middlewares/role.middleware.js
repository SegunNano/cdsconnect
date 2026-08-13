export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.member.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient role.'
            })
        }
        next()
    }
}