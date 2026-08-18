export const devOrRole = (...roles) => {
    return (req, res, next) => {
        const isDev = req.member.is_dev
        const hasRole = roles.includes(req.member.role)

        if (isDev || hasRole) {
            return next()
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
        })
    }
}